import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import { AdminProductsTableSkeleton } from "../LoadingSkeletons.jsx";
import { IK_PRESETS, imageKitOptimizedUrl } from "../../lib/imagekitUrl.js";
import { 
  PackageIcon, 
  ArrowRightLeftIcon, 
  HistoryIcon, 
  AlertTriangleIcon 
} from "lucide-react";
import { useAdminShell } from "./AdminShellContext.jsx";
import { AdminInventoryAdjustModal } from "./AdminInventoryAdjustModal.jsx";
import { AdminInventoryLogsModal } from "./AdminInventoryLogsModal.jsx";

export function AdminInventoryPanel() {
  const { searchQuery } = useAdminShell();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'low', 'out'
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [viewingLogsProduct, setViewingLogsProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiFetch("/api/admin/products", { getToken }),
  });

  const products = data?.products || [];

  const filtered = useMemo(() => {
    let filteredProducts = products.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });

    if (activeTab === "low") {
      filteredProducts = filteredProducts.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
      );
    } else if (activeTab === "out") {
      filteredProducts = filteredProducts.filter((p) => p.stockQuantity <= 0);
    }

    return filteredProducts;
  }, [products, searchQuery, activeTab]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Track stock levels, reserve inventory, and view adjustment history.
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-[#E5E7EB]">
        {[
          { id: "all", label: "All Products" },
          { id: "low", label: "Low Stock" },
          { id: "out", label: "Out of Stock" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-[#FF6B4A] text-[#FF6B4A]"
                : "border-transparent text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#111827]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AdminProductsTableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 text-right">Available</th>
                  <th className="px-5 py-3 text-right">Reserved</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[#6B7280]"
                    >
                      No products match your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const total = p.stockQuantity + p.reservedStock;
                    const isOutOfStock = p.stockQuantity <= 0;
                    const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;

                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#E5E7EB]/80 transition hover:bg-[#F8FAFC]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                              {p.imageUrl ? (
                                <img
                                  src={imageKitOptimizedUrl(p.imageUrl, IK_PRESETS.adminThumb)}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <PackageIcon className="size-5 text-[#6B7280]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#111827]">{p.name}</p>
                              <p className="truncate text-xs text-[#6B7280]">SKU: {p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-medium text-[#111827]">
                          {p.stockQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-[#6B7280]">
                          {p.reservedStock}
                        </td>
                        <td className="px-5 py-4 text-right text-[#111827]">
                          {total}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              <AlertTriangleIcon className="size-3" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                              <AlertTriangleIcon className="size-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                              onClick={() => setViewingLogsProduct(p)}
                            >
                              <HistoryIcon className="size-3.5" />
                              Logs
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium border border-[#E5E7EB] text-[#111827] transition hover:bg-white"
                              onClick={() => setAdjustingProduct(p)}
                            >
                              <ArrowRightLeftIcon className="size-3.5" />
                              Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adjustingProduct && (
        <AdminInventoryAdjustModal 
          product={adjustingProduct} 
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSuccess={() => {
            queryClient.invalidateQueries(["admin-products"]);
            setAdjustingProduct(null);
          }}
        />
      )}

      {viewingLogsProduct && (
        <AdminInventoryLogsModal
          product={viewingLogsProduct}
          isOpen={!!viewingLogsProduct}
          onClose={() => setViewingLogsProduct(null)}
        />
      )}
    </div>
  );
}
