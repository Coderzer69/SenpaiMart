import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { brands, products } from "../db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { deleteImageKitAsset } from "../lib/imagekit";
import { getEnv } from "../lib/env";

const env = getEnv();

const brandCreate = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  logoKitFileId: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  active: z.boolean().default(true),
});

const brandPatch = brandCreate.partial();

export async function listAdminBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db.select().from(brands).orderBy(desc(brands.createdAt));

    // Enrich with product counts
    const countRows = await db
      .select({ brandId: products.brandId, count: count() })
      .from(products)
      .groupBy(products.brandId);

    const countMap = new Map(countRows.map((r) => [r.brandId, Number(r.count)]));

    const enriched = rows.map((b) => ({
      ...b,
      productCount: countMap.get(b.id) ?? 0,
    }));

    res.json({ brands: enriched });
  } catch (e) {
    next(e);
  }
}

export async function createAdminBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = brandCreate.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const { logoUrl, logoKitFileId, ...rest } = parsed.data;
    const [row] = await db
      .insert(brands)
      .values({
        ...rest,
        logoUrl: logoUrl || null,
        logoKitFileId: logoKitFileId || null,
      })
      .returning();
    res.status(201).json({ brand: row });
  } catch (e) {
    next(e);
  }
}

export async function updateAdminBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = brandPatch.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const data: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) data[k] = v;
    }
    if (data.logoUrl === "") data.logoUrl = null;
    if (data.logoKitFileId === "") data.logoKitFileId = null;

    const [row] = await db
      .update(brands)
      .set(data as any)
      .where(eq(brands.id, req.params.id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ brand: row });
  } catch (e) {
    next(e);
  }
}

export async function deleteAdminBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const [existing] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Detach products from this brand (cascade set null handled by DB)
    await deleteImageKitAsset(env, existing.logoKitFileId);
    await db.delete(brands).where(eq(brands.id, id));

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
