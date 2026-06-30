import { AdminSparkline } from "./AdminSparkline.jsx";
import { formatPrice } from "../../utils/format.js";

function MiniMetric({ title, value, change, sparkData, sparkColor, positiveGood = true }) {
  const isPositive = change >= 0;
  const changeColor =
    positiveGood === isPositive ? "text-[#22C55E]" : "text-[#EF4444]";

  return (
    <article className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[#6B7280]">{title}</p>
        <AdminSparkline data={sparkData} color={sparkColor} className="h-6 w-16" />
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-[#111827]">{value}</p>
      <p className={`mt-1 text-xs font-medium ${changeColor}`}>
        {isPositive ? "+" : ""}
        {change.toFixed(1)}% vs last week
      </p>
    </article>
  );
}

export function AdminBottomMetrics({
  conversionRate,
  aov,
  refundsCents,
  satisfaction,
  conversionGrowth,
  aovGrowth,
  refundsGrowth,
  satisfactionGrowth,
  sparkRevenue,
  sparkRefunds,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MiniMetric
        title="Conversion rate"
        value={`${conversionRate.toFixed(2)}%`}
        change={conversionGrowth}
        sparkData={sparkRevenue}
        sparkColor="#FF6B4A"
      />
      <MiniMetric
        title="Average order value"
        value={formatPrice(aov, "usd")}
        change={aovGrowth}
        sparkData={sparkRevenue}
        sparkColor="#22C55E"
      />
      <MiniMetric
        title="Refunds"
        value={formatPrice(refundsCents, "usd")}
        change={refundsGrowth}
        sparkData={sparkRefunds}
        sparkColor="#8B5CF6"
        positiveGood={false}
      />
      <MiniMetric
        title="Customer satisfaction"
        value={satisfaction ? `${satisfaction.toFixed(1)}/5` : "—"}
        change={satisfactionGrowth}
        sparkData={[4, 4.2, 4.4, satisfaction ?? 4.5]}
        sparkColor="#F59E0B"
      />
    </div>
  );
}
