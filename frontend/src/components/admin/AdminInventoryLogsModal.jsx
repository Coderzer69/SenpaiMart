import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import { XIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export function AdminInventoryLogsModal({ product, isOpen, onClose }) {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-logs", product?.id],
    queryFn: () => apiFetch(`/api/admin/inventory/logs?productId=${product.id}`, { getToken }),
    enabled: !!product?.id && isOpen,
  });

  if (!isOpen || !product) return null;

  const logs = data?.logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Inventory Logs</h2>
            <p className="text-sm text-[#6B7280]">{product.name} (SKU: {product.slug})</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#F3F4F6] text-[#6B7280]">
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[#FF6B4A]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#6B7280]">No inventory logs found for this product.</p>
            </div>
          ) : (
            <div className="relative border-l border-[#E5E7EB] ml-4 space-y-8 pb-4">
              {logs.map((log) => {
                const isPositive = log.quantityChanged > 0;
                const isNegative = log.quantityChanged < 0;

                return (
                  <div key={log.id} className="relative pl-6">
                    <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-white ring-4 ring-white">
                      {isPositive ? (
                        <div className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <TrendingUpIcon className="size-3.5" />
                        </div>
                      ) : isNegative ? (
                        <div className="flex size-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <TrendingDownIcon className="size-3.5" />
                        </div>
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                          <div className="size-1.5 rounded-full bg-current" />
                        </div>
                      )}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {log.reason}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          isPositive ? "bg-green-50 text-green-700" : isNegative ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {isPositive ? "+" : ""}{log.quantityChanged}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#374151]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
