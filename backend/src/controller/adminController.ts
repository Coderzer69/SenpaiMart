import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { getLocalUser } from "../lib/users";
import { isAdmin } from "../lib/roles";
import ImageKit from "@imagekit/nodejs";
import { getEnv } from "../lib/env";
import { db } from "../db";
import { orderItems, products } from "../db/schema";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { deleteImageKitAsset } from "../lib/imagekit";

const env = getEnv();

const productCreate = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1).default("General"),
  categoryId: z.string().uuid().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  description: z.string().default(""),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  imageKitFileId: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    fileId: z.string().min(1),
  })).optional().default([]),
  parentProductId: z.string().uuid().optional().nullable(),
  variantAttributes: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
  })).optional().default([]),
  active: z.boolean().default(true),
});

const productPatch = productCreate.partial();

function buildProductUpdateSet(body: z.infer<typeof productPatch>) {
  const data: Partial<typeof products.$inferInsert> = {};
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.name !== undefined) data.name = body.name;
  if (body.category !== undefined) data.category = body.category;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.brandId !== undefined) data.brandId = body.brandId;
  if (body.description !== undefined) data.description = body.description;
  if (body.priceCents !== undefined) data.priceCents = body.priceCents;
  if (body.currency !== undefined) data.currency = body.currency;
  
  if (body.images !== undefined) {
    data.images = body.images;
    if (body.images.length > 0) {
      data.imageUrl = body.images[0].url;
      data.imageKitFileId = body.images[0].fileId;
    } else {
      data.imageUrl = null;
      data.imageKitFileId = null;
    }
  } else {
    // Fallback if images array wasn't provided but legacy fields were
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl === "" ? null : body.imageUrl;
    if (body.imageKitFileId !== undefined) {
      data.imageKitFileId = body.imageKitFileId === "" ? null : body.imageKitFileId;
    }
  }
  
  if (body.parentProductId !== undefined) data.parentProductId = body.parentProductId;
  if (body.variantAttributes !== undefined) data.variantAttributes = body.variantAttributes;
  if (body.active !== undefined) data.active = body.active;
  return data;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await getLocalUser(userId);

    if (!isAdmin(user.role)) {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
}

export function getImageKitAuth(_req: Request, res: Response, next: NextFunction) {
  try {
    const client = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });

    const auth = client.helper.getAuthenticationParameters();

    res.json({
      ...auth,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (e) {
    next(e);
  }
}

export async function listAdminProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json({ products: rows });
  } catch (e) {
    next(e);
  }
}

export async function createAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = productCreate.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const { imageUrl, imageKitFileId, ...rest } = parsed.data;

    const [row] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      })
      .returning();
    res.status(201).json({ product: row });
  } catch (e) {
    next(e);
  }
}

export async function updateAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = productPatch.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const data = buildProductUpdateSet(parsed.data);

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, req.params.id as string))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({ product: row });
  } catch (e) {
    next(e);
  }
}

export async function deleteAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const [countRow] = await db
      .select({ c: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));

    if (Number(countRow?.c ?? 0) > 0) {
      res.status(409).json({
        error:
          "This product is on one or more orders and cannot be deleted. Deactivate it instead.",
      });
      return;
    }

    await deleteImageKitAsset(env, existing.imageKitFileId);
    await db.delete(products).where(eq(products.id, id));

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

const bulkProductCreate = z.array(productCreate);

export async function bulkImportProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkProductCreate.safeParse(req.body.products);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const itemsToInsert = parsed.data.map((item) => ({
      ...item,
      imageUrl: item.imageUrl || null,
      imageKitFileId: item.imageKitFileId || null,
    }));

    if (itemsToInsert.length === 0) {
      res.json({ successCount: 0, skippedSlugs: [] });
      return;
    }

    // Deduplicate within the payload itself to avoid Postgres error if payload has duplicate slugs
    const uniqueItemsMap = new Map();
    for (const item of itemsToInsert) {
      if (!uniqueItemsMap.has(item.slug)) {
        uniqueItemsMap.set(item.slug, item);
      }
    }
    const uniqueItemsToInsert = Array.from(uniqueItemsMap.values());

    const result = await db.transaction(async (tx) => {
      // Use onConflictDoNothing to skip any products that already exist in DB
      return await tx
        .insert(products)
        .values(uniqueItemsToInsert)
        .onConflictDoNothing({ target: products.slug })
        .returning({ slug: products.slug });
    });

    const insertedSlugs = new Set(result.map((r) => r.slug));
    
    // Find skipped slugs (either existed in DB, or duplicate in payload)
    const skippedSlugs = itemsToInsert
      .map((i) => i.slug)
      .filter((slug) => !insertedSlugs.has(slug));

    res.json({ successCount: result.length, skippedSlugs });
  } catch (e) {
    next(e);
  }
}

// const bulkActionSchema = z.object({
//   ids: z.array(z.string().uuid()).min(1),
//   action: z.enum([
//     "delete",
//     "archive",
//     "publish",
//     "draft",
//     "change-category",
//     "change-brand",
//     "update-price",
//     "update-stock",
//   ]),
//   /** For change-category */
//   categoryId: z.string().uuid().optional().nullable(),
//   /** For change-brand */
//   brandId: z.string().uuid().optional().nullable(),
//   /** For update-price: new price in cents */
//   priceCents: z.number().int().positive().optional(),
//   /** For update-stock: new quantity */
//   stockQuantity: z.number().int().min(0).optional(),
// });

// export async function bulkActionAdminProducts(req: Request, res: Response, next: NextFunction) {
//   try {
//     const parsed = bulkActionSchema.safeParse(req.body);
//     if (!parsed.success) {
//       res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
//       return;
//     }

//     const { ids, action, categoryId, brandId, priceCents, stockQuantity } = parsed.data;
//     const { inArray } = await import("drizzle-orm");

//     switch (action) {
//       case "delete": {
//         // Respect the existing safety check: can't delete products on orders
//         const onOrders = await db
//           .select({ productId: orderItems.productId })
//           .from(orderItems)
//           .where(inArray(orderItems.productId, ids));
//         const blockedIds = new Set(onOrders.map((r) => r.productId));
//         const deletableIds = ids.filter((id) => !blockedIds.has(id));

//         if (deletableIds.length > 0) {
//           await db.delete(products).where(inArray(products.id, deletableIds));
//         }

//         res.json({
//           updated: deletableIds.length,
//           skipped: blockedIds.size,
//           skippedReason: blockedIds.size > 0
//             ? "Some products are on existing orders and were deactivated instead."
//             : undefined,
//         });
//         break;
//       }

//       case "archive":
//         await db.update(products).set({ active: false }).where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "publish":
//         await db.update(products).set({ active: true }).where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "draft":
//         await db.update(products).set({ active: false }).where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "change-category":
//         await db
//           .update(products)
//           .set({ categoryId: categoryId ?? null })
//           .where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "change-brand":
//         await db
//           .update(products)
//           .set({ brandId: brandId ?? null })
//           .where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "update-price":
//         if (priceCents === undefined) {
//           res.status(400).json({ error: "priceCents required for update-price" });
//           return;
//         }
//         await db.update(products).set({ priceCents }).where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       case "update-stock":
//         if (stockQuantity === undefined) {
//           res.status(400).json({ error: "stockQuantity required for update-stock" });
//           return;
//         }
//         await db.update(products).set({ stockQuantity }).where(inArray(products.id, ids));
//         res.json({ updated: ids.length });
//         break;

//       default:
//         res.status(400).json({ error: "Unknown action" });
//     }
//   } catch (e) {
//     next(e);
//   }
// }


// export async function bulkImportProducts(req: Request, res: Response, next: NextFunction) {
//   try {
//     const parsed = bulkProductCreate.safeParse(req.body.products);
//     if (!parsed.success) {
//       res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
//       return;
//     }

//     const itemsToInsert = parsed.data.map((item) => ({
//       ...item,
//       imageUrl: item.imageUrl || null,
//       imageKitFileId: item.imageKitFileId || null,
//     }));

//     if (itemsToInsert.length === 0) {
//       res.json({ successCount: 0, skippedSlugs: [] });
//       return;
//     }

//     // Deduplicate within the payload itself to avoid Postgres error if payload has duplicate slugs
//     const uniqueItemsMap = new Map();
//     for (const item of itemsToInsert) {
//       if (!uniqueItemsMap.has(item.slug)) {
//         uniqueItemsMap.set(item.slug, item);
//       }
//     }
//     const uniqueItemsToInsert = Array.from(uniqueItemsMap.values());

//     const result = await db.transaction(async (tx) => {
//       // Use onConflictDoNothing to skip any products that already exist in DB
//       return await tx
//         .insert(products)
//         .values(uniqueItemsToInsert)
//         .onConflictDoNothing({ target: products.slug })
//         .returning({ slug: products.slug });
//     });

//     const insertedSlugs = new Set(result.map((r) => r.slug));
    
//     // Find skipped slugs (either existed in DB, or duplicate in payload)
//     const skippedSlugs = itemsToInsert
//       .map((i) => i.slug)
//       .filter((slug) => !insertedSlugs.has(slug));

//     res.json({ successCount: result.length, skippedSlugs });
//   } catch (e) {
//     next(e);
//   }
// }
