import {
  MoreHorizontalIcon,
} from "lucide-react";
import { Link } from "react-router";
import { formatOrderWhen, formatPrice } from "../../utils/format.js";

const statusStyles = {
  paid: "bg-[#22C55E]/10 text-[#16A34A]",
  pending: "bg-[#F59E0B]/10 text-[#D97706]",
  failed: "bg-[#EF4444]/10 text-[#DC2626]",
};

const paymentStyles = {
  paid: "bg-[#22C55E]/10 text-[#16A34A]",
  pending: "bg-[#F59E0B]/10 text-[#D97706]",
  failed: "bg-[#EF4444]/10 text-[#DC2626]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] ?? "bg-[#E5E7EB] text-[#6B7280]"}`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const label =
    status === "paid" ? "Paid" : status === "pending" ? "Pending" : "Failed";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStyles[status] ?? "bg-[#E5E7EB] text-[#6B7280]"}`}
    >
      {label}
    </span>
  );
}

export function AdminRecentOrders({ orders, searchQuery }) {
  const filtered = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      (o.previewItems ?? []).some((i) => i.name?.toLowerCase().includes(q))
    );
  });

  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">
            Recent orders
          </h2>
          <p className="text-sm text-[#6B7280]">Latest store transactions</p>
        </div>
        <Link
          to="/orders"
          className="text-sm font-semibold text-[#FF6B4A] transition hover:text-[#FF6B4A]/80"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-[#6B7280]"
                >
                  No orders match your search.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#E5E7EB]/80 transition hover:bg-[#F8FAFC]"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-mono text-xs font-medium text-[#111827] hover:text-[#FF6B4A]"
                    >
                      {order.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/10 text-xs font-bold text-[#8B5CF6]">
                        {order.userId?.slice(0, 2).toUpperCase() ?? "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#111827]">
                          Customer
                        </p>
                        <p className="truncate text-xs text-[#6B7280]">
                          {order.userId?.slice(0, 12)}…
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#6B7280]">
                    {formatOrderWhen(order.createdAt, { dateStyle: "medium" })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 font-semibold tabular-nums text-[#111827]">
                    {formatPrice(order.totalCents, "usd")}
                  </td>
                  <td className="px-5 py-4">
                    <PaymentBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex rounded-lg p-1.5 text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                      aria-label={`Open order ${order.id.slice(0, 8)}`}
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
