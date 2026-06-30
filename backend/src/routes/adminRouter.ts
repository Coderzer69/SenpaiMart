import { Router } from "express";
import {
  bulkImportProducts,
  createAdminProduct,
  deleteAdminProduct,
  getImageKitAuth,
  listAdminProducts,
  requireAdmin,
  updateAdminProduct,
} from "../controller/adminController";
import { adjustStock, bulkAdjustStock, getInventoryLogs } from "../controller/inventoryController";
import {
  createAdminBrand,
  deleteAdminBrand,
  listAdminBrands,
  updateAdminBrand,
} from "../controller/brandController";
import {
  bulkDeleteAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "../controller/categoryController";

const router = Router();

router.use(requireAdmin);

router.get("/imagekit/auth", getImageKitAuth);
router.get("/products", listAdminProducts);
router.post("/products/bulk", bulkImportProducts);
router.post("/products", createAdminProduct);

router.post("/inventory/adjust", adjustStock);
router.post("/inventory/bulk-adjust", bulkAdjustStock);
router.get("/inventory/logs", getInventoryLogs);

router.get("/brands", listAdminBrands);
router.post("/brands", createAdminBrand);
router.patch("/brands/:id", updateAdminBrand);
router.delete("/brands/:id", deleteAdminBrand);

router.get("/categories", listAdminCategories);
router.post("/categories", createAdminCategory);
router.post("/categories/bulk-delete", bulkDeleteAdminCategories);
router.patch("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);

router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

export default router;