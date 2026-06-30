import { useMemo, useState } from "react";
import { formatPrice } from "../../utils/format.js";

export function AdminSalesChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const chartData = data?.length ? data : [{ label: "—", revenue: 0 }];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const width = 560;
  const height = 220;
  const padX = 24;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = useMemo(
    () =>
      chartData.map((d, i) => {
        const x =
          padX + (i / Math.max(chartData.length - 1, 1)) * chartW;
        const y = padY + chartH - (d.revenue / maxRevenue) * chartH;
        return { ...d, x, y };
      }),
    [chartData, maxRevenue, chartW, chartH],
  );

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const simpleArea = `${points[0]?.x ?? padX},${padY + chartH} ${linePath} ${points[points.length - 1]?.x ?? padX},${padY + chartH}`;

  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">
            Sales overview
          </h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Revenue trend for the last 7 days
          </p>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Sales revenue line chart"
        >
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={padY + chartH * (1 - t)}
              y2={padY + chartH * (1 - t)}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />
          ))}

          <polygon points={simpleArea} fill="url(#salesFill)" />
          <polyline
            points={linePath}
            fill="none"
            stroke="#FF6B4A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 6 : 4}
                fill="#FF6B4A"
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: ${formatPrice(p.revenue, "usd")}`}
              />
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-[#6B7280] text-[11px] font-medium"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {hovered !== null && points[hovered] ? (
          <div
            className="pointer-events-none absolute rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100 - 12}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold text-[#111827]">
              {points[hovered].label}
            </p>
            <p className="text-[#FF6B4A]">
              {formatPrice(points[hovered].revenue, "usd")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
