import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { products, inventoryLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  change: z.number().int(),
  reason: z.string().min(1),
});

const bulkAdjustSchema = z.object({
  adjustments: z.array(adjustStockSchema),
});

export async function adjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = adjustStockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const { productId, change, reason } = parsed.data;

    await db.transaction(async (tx) => {
      const [product] = await tx
        .select({ id: products.id, stockQuantity: products.stockQuantity })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      await tx
        .update(products)
        .set({ stockQuantity: product.stockQuantity + change })
        .where(eq(products.id, productId));

      await tx.insert(inventoryLogs).values({
        productId,
        quantityChanged: change,
        reason,
      });
    });

    res.json({ ok: true });
  } catch (e: any) {
    if (e.message.includes("Product not found")) {
      res.status(404).json({ error: e.message });
      return;
    }
    next(e);
  }
}

export async function bulkAdjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkAdjustSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    await db.transaction(async (tx) => {
      for (const adj of parsed.data.adjustments) {
        const [product] = await tx
          .select({ stockQuantity: products.stockQuantity })
          .from(products)
          .where(eq(products.id, adj.productId))
          .limit(1);

        if (product) {
          await tx
            .update(products)
            .set({ stockQuantity: product.stockQuantity + adj.change })
            .where(eq(products.id, adj.productId));

          await tx.insert(inventoryLogs).values({
            productId: adj.productId,
            quantityChanged: adj.change,
            reason: adj.reason,
          });
        }
      }
    });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function getInventoryLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.query;
    
    let query = db.select().from(inventoryLogs);
    
    if (productId && typeof productId === 'string') {
      query = query.where(eq(inventoryLogs.productId, productId)) as any;
    }
    
    // sort by created at desc
    const logs = await query.orderBy(inventoryLogs.createdAt);
    // Reverse because drizzle orderBy doesn't have desc imported easily here
    res.json({ logs: logs.reverse() });
  } catch (e) {
    next(e);
  }
}
