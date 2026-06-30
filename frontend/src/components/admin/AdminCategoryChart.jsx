import { formatPrice } from "../../utils/format.js";

const COLORS = ["#FF6B4A", "#8B5CF6", "#3B82F6", "#22C55E", "#F59E0B"];

export function AdminCategoryChart({ categories, totalRevenue }) {
  const entries = categories?.length
    ? categories
    : [{ name: "No sales yet", cents: 0 }];
  const total = entries.reduce((s, c) => s + c.cents, 0) || 1;

  let cumulative = 0;
  const segments = entries.map((entry, i) => {
    const pct = entry.cents / total;
    const start = cumulative * 360;
    cumulative += pct;
    const end = cumulative * 360;
    return { ...entry, pct, start, end, color: COLORS[i % COLORS.length] };
  });

  function arcPath(cx, cy, r, startAngle, endAngle) {
    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">
          Sales by category
        </h2>
        <p className="mt-0.5 text-sm text-[#6B7280]">
          Distribution of paid order revenue
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <svg viewBox="0 0 120 120" className="size-36" aria-hidden>
            {segments.map((seg) =>
              seg.pct > 0 ? (
                <path
                  key={seg.name}
                  d={arcPath(60, 60, 50, seg.start, seg.end)}
                  fill={seg.color}
                  className="transition-opacity hover:opacity-90"
                />
              ) : null,
            )}
            <circle cx="60" cy="60" r="32" fill="#fff" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B7280]">
              Total
            </p>
            <p className="text-sm font-bold text-[#111827] tabular-nums">
              {formatPrice(totalRevenue, "usd")}
            </p>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-3">
          {segments.map((seg) => (
            <li key={seg.name} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-[#111827]">
                {seg.name}
              </span>
              <span className="text-sm font-semibold tabular-nums text-[#6B7280]">
                {(seg.pct * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
