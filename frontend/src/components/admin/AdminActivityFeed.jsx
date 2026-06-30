import {
  AlertTriangleIcon,
  ShoppingCartIcon,
} from "lucide-react";

const iconMap = {
  order: { icon: ShoppingCartIcon, bg: "bg-[#FF6B4A]/10", color: "text-[#FF6B4A]" },
  stock: {
    icon: AlertTriangleIcon,
    bg: "bg-[#F59E0B]/10",
    color: "text-[#F59E0B]",
  },
};

export function AdminActivityFeed({ activity }) {
  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">Activity feed</h2>
        <p className="mt-0.5 text-sm text-[#6B7280]">Recent store events</p>
      </div>

      {activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          No recent activity.
        </p>
      ) : (
        <ul className="space-y-4">
          {activity.map((item) => {
            const meta = iconMap[item.type] ?? iconMap.order;
            const Icon = meta.icon;
            return (
              <li key={item.id} className="flex gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                >
                  <Icon className={`size-4 ${meta.color}`} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 border-b border-[#E5E7EB]/70 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm text-[#111827]">{item.message}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{item.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
