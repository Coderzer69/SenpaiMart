import { Link, NavLink, Outlet } from "react-router";
import { OrderDetailSkeleton } from "../components/LoadingSkeletons";
import { PageError } from "../components/PageError";
import { useOrderDetailPage } from "../hooks/useOrderDetailPage";
import {
  ArrowLeftIcon,
  CalendarIcon,
  HeadphonesIcon,
  LayoutListIcon,
  LockIcon,
  MessageCircleIcon,
} from "lucide-react";
import { formatOrderWhen, formatPrice } from "../utils/format";

const tabClass = ({ isActive }) =>
  `tab gap-2 whitespace-nowrap ${isActive ? "tab-active" : ""}`;

function OrderDetailPage() {
  const { id, order, items, paid, isLoading, error } = useOrderDetailPage();

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <PageError
        message="Order not found."
        action={{ to: "/orders", label: "Back to orders" }}
      />
    );
  }

  return (
    <div className="space-y-8 text-left">
      <Link
        to="/orders"
        className="btn btn-ghost btn-sm gap-2 px-0 text-base-content/70 hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to orders
      </Link>

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg">
        <div className="bg-linear-to-br from-primary/12 via-base-100 to-base-200/90 px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Order details
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-base-content sm:text-[32px]">
                {items?.[0]?.product?.name || "Order Details"}
              </h1>

              <p className="mt-2 text-[15px] font-medium text-[#6B7280]">
                {formatOrderWhen(order.createdAt, { dateStyle: "full" })}
              </p>
              
              <div className="mt-3 flex w-fit items-center gap-1.5 rounded-lg bg-[#FFF5F2] px-2.5 py-1.5 text-[13px] font-medium text-primary">
                <CalendarIcon className="size-4" aria-hidden />
                <span>
                  Ordered on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-base-300/80 pt-4 lg:border-t-0 lg:pt-0 lg:text-right">
              <span
                className={`badge badge-lg w-fit capitalize lg:ml-auto ${
                  paid
                    ? "badge-success"
                    : order.status === "pending"
                      ? "badge-warning"
                      : "badge-error"
                }`}
              >
                {order.status}
              </span>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Order total
                </p>
                <p className="text-2xl font-bold tabular-nums text-base-content sm:text-3xl">
                  {formatPrice(order.totalCents, "usd")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-base-300 bg-base-200/40 px-5 py-4 sm:px-8">
          <p className="max-w-3xl text-sm leading-relaxed text-base-content/80">
            Need help with shipping or returns? Open the{" "}
            <strong className="text-base-content">Support chat</strong> tab
            after payment. Video call links are shared in that thread; everyone
            joins with the same link.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 border-b border-base-300 pb-3">
          <HeadphonesIcon className="size-5 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content">
            Customer support
          </h2>
        </div>

        <div className="tabs tabs-boxed mt-3 w-fit flex-wrap bg-base-300/50 p-1">
          <NavLink to={`/orders/${id}`} end className={tabClass}>
            <LayoutListIcon className="size-4 shrink-0" aria-hidden />
            Summary
          </NavLink>

          {paid ? (
            <NavLink to={`/orders/${id}/chat`} className={tabClass}>
              <MessageCircleIcon className="size-4 shrink-0" aria-hidden />
              Support chat
            </NavLink>
          ) : (
            <span className="tab tab-disabled gap-2 cursor-not-allowed opacity-50">
              <LockIcon className="size-4 shrink-0" aria-hidden />
              Support chat
            </span>
          )}
        </div>

        {!paid ? (
          <div role="alert" className="alert alert-warning mt-4 text-sm">
            <LockIcon className="size-4 shrink-0" aria-hidden />
            <span>
              Support unlocks when this order is marked{" "}
              <strong className="text-base-content">paid</strong> (once payment
              is confirmed).
            </span>
          </div>
        ) : null}

        <div className="mt-5">
          <Outlet context={{ order, items, paid }} />
        </div>
      </div>
    </div>
  );
}
export default OrderDetailPage;
