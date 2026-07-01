
import { PackageIcon } from "lucide-react";
import { IK_PRESETS, imageKitOptimizedUrl } from "../../lib/imagekitUrl.js";

export function AdminTopProducts({ products, maxUnits }) {
  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">Top products</h2>
        <p className="mt-0.5 text-sm text-[#6B7280]">Best sellers by units sold</p>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          No sales data yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => {
            const pct = maxUnits > 0 ? (product.units / maxUnits) * 100 : 0;
            return (
              <li key={product.name} className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  {product.imageUrl ? (
                    <img
                      src={imageKitOptimizedUrl(
                        product.imageUrl,
                        IK_PRESETS.adminThumb,
                      )}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <PackageIcon
                        className="size-4 text-[#6B7280]"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[#111827]">
                      {product.name}
                    </p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-[#6B7280]">
                      {product.units} sold
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-[#FF6B4A] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
