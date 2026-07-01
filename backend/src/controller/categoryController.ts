import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { categories, products } from "../db/schema";
// import { count, desc, eq, isNull } from "drizzle-orm";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";

const categoryCreate = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
});

const categoryPatch = categoryCreate.partial();

export async function listAdminCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db.select().from(categories).orderBy(desc(categories.createdAt));

    // Count products per category
    const countRows = await db
      .select({ categoryId: products.categoryId, count: count() })
      .from(products)
      .groupBy(products.categoryId);
    const countMap = new Map(countRows.map((r) => [r.categoryId, Number(r.count)]));

    const enriched = rows.map((c) => ({
      ...c,
      productCount: countMap.get(c.id) ?? 0,
    }));

    res.json({ categories: enriched });
  } catch (e) {
    next(e);
  }
}

export async function createAdminCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = categoryCreate.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const { imageUrl, parentId, ...rest } = parsed.data;
    const [row] = await db
      .insert(categories)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
      })
      .returning();
    res.status(201).json({ category: row });
  } catch (e) {
    next(e);
  }
}

// export async function updateAdminCategory(req: Request, res: Response, next: NextFunction)
export async function updateAdminCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = categoryPatch.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const data: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) data[k] = v;
    }
    if (data.imageUrl === "") data.imageUrl = null;
    if (data.parentId === "") data.parentId = null;

    const id = req.params.id;

    const [row] = await db
      .update(categories)
      .set(data as any)
      .where(eq(categories.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ category: row });
  } catch (e) {
    next(e);
  }
}

// export async function deleteAdminCategory(req: Request, res: Response, next: NextFunction)
export async function deleteAdminCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    // Re-parent children to the deleted category's parent (orphan prevention)
    await db
      .update(categories)
      .set({ parentId: existing.parentId ?? null })
      .where(eq(categories.parentId, id));

    await db.delete(categories).where(eq(categories.id, id));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function bulkDeleteAdminCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = z.array(z.string().uuid()).safeParse(req.body.ids);
    if (!ids.success) {
      res.status(400).json({ error: "Invalid ids" });
      return;
    }
    let deleted = 0;
    for (const id of ids.data) {
      const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      if (!existing) continue;
      await db.update(categories).set({ parentId: existing.parentId ?? null }).where(eq(categories.parentId, id));
      await db.delete(categories).where(eq(categories.id, id));
      deleted++;
    }
    res.json({ deleted });
  } catch (e) {
    next(e);
  }
}
