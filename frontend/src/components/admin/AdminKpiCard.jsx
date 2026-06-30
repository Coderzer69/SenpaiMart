import { AdminSparkline } from "./AdminSparkline.jsx";

function GrowthBadge({ value }) {
  const positive = value >= 0;
  return (
    <span
      className={`text-xs font-medium ${
        positive ? "text-[#22C55E]" : "text-[#EF4444]"
      }`}
    >
      {positive ? "+" : ""}
      {value.toFixed(1)}% vs last week
    </span>
  );
}

export function AdminKpiCard({
  title,
  value,
  growth,
  icon: Icon,
  iconBg,
  iconColor,
  sparkData,
  sparkColor,
}) {
  return (
    <article className="group rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <AdminSparkline data={sparkData} color={sparkColor} />
      </div>
      <p className="mt-4 text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#111827] tabular-nums">
        {value}
      </p>
      <div className="mt-2">
        <GrowthBadge value={growth} />
      </div>
    </article>
  );
}
