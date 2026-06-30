import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import { XIcon, PlusIcon, MinusIcon } from "lucide-react";

export function AdminInventoryAdjustModal({ product, isOpen, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !product) return null;

  const handleAdjust = (amount) => {
    setAdjustment(prev => prev + amount);
  };

  const newStock = product.stockQuantity + adjustment;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (adjustment === 0) return onClose();
    if (!reason.trim()) {
      setError("Please provide a reason for the adjustment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch("/api/admin/inventory/adjust", {
        getToken,
        method: "POST",
        body: {
          productId: product.id,
          change: adjustment,
          reason: reason.trim(),
        },
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to adjust stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#111827]">Adjust Stock</h2>
          {!loading && (
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#F3F4F6] text-[#6B7280]">
              <XIcon className="size-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#111827]">{product.name}</p>
            <p className="text-xs text-[#6B7280]">SKU: {product.slug}</p>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl bg-[#F8FAFC] p-4 border border-[#E5E7EB]">
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Current Stock</p>
              <p className="text-2xl font-bold text-[#111827]">{product.stockQuantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                className="flex size-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]"
              >
                <MinusIcon className="size-4" />
              </button>
              <div className="w-16 text-center">
                <span className={`text-lg font-bold ${adjustment > 0 ? "text-[#16A34A]" : adjustment < 0 ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
                  {adjustment > 0 ? `+${adjustment}` : adjustment === 0 ? "0" : adjustment}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="flex size-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-[#6B7280]">New Stock</p>
              <p className="text-2xl font-bold text-[#111827]">{newStock}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#374151]">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
            >
              <option value="">Select a reason...</option>
              <option value="Restock">Restock</option>
              <option value="Damage">Damage</option>
              <option value="Theft / Loss">Theft / Loss</option>
              <option value="Inventory Count">Inventory Count</option>
              <option value="Other">Other</option>
            </select>
            {reason === "Other" && (
              <input 
                type="text" 
                placeholder="Specify reason..."
                className="mt-2 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>

          {error && <p className="mt-4 text-sm text-[#EF4444]">{error}</p>}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || adjustment === 0 || !reason}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <span className="loading loading-spinner loading-xs" />}
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
