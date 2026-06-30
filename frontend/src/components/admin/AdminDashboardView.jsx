import { useAuth } from "@clerk/react";
import {
  PackageIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard.js";
import { formatPrice } from "../../utils/format.js";
import { useAdminShell } from "./AdminShellContext.jsx";
import { AdminActivityFeed } from "./AdminActivityFeed.jsx";
import { AdminBottomMetrics } from "./AdminBottomMetrics.jsx";
import { AdminCategoryChart } from "./AdminCategoryChart.jsx";
import { AdminKpiCard } from "./AdminKpiCard.jsx";
import { AdminRecentOrders } from "./AdminRecentOrders.jsx";
import { AdminSalesChart } from "./AdminSalesChart.jsx";
import { AdminTopProducts } from "./AdminTopProducts.jsx";

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 w-80 max-w-full rounded-2xl bg-[#E5E7EB]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-[18px] bg-[#E5E7EB]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 rounded-[18px] bg-[#E5E7EB] lg:col-span-2" />
        <div className="h-72 rounded-[18px] bg-[#E5E7EB]" />
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const { user } = useAuth();
  const { dateRange, searchQuery } = useAdminShell();
  const { isLoading, metrics } = useAdminDashboard(dateRange);

  const displayName =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Admin";

  if (isLoading) return <AdminDashboardSkeleton />;

  const m = metrics;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
            {greetingForHour(new Date().getHours())}, {displayName}!{" "}
            <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
      </header>

      {(m.lowStockCount > 0 || m.outOfStockCount > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <PackageIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Inventory Alert</h3>
            <p className="text-xs">
              You have {m.lowStockCount > 0 ? <strong>{m.lowStockCount} low stock</strong> : ""}
              {m.lowStockCount > 0 && m.outOfStockCount > 0 ? " and " : ""}
              {m.outOfStockCount > 0 ? <strong>{m.outOfStockCount} out of stock</strong> : ""} 
              {" "}products. Please review your inventory.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          title="Total revenue"
          value={formatPrice(m.totalRevenue, "usd")}
          growth={m.revenueGrowth}
          icon={ShoppingBagIcon}
          iconBg="#FF6B4A15"
          iconColor="#FF6B4A"
          sparkData={m.sparkRevenue}
          sparkColor="#FF6B4A"
        />
        <AdminKpiCard
          title="Total orders"
          value={m.totalOrders.toLocaleString()}
          growth={m.ordersGrowth}
          icon={ShoppingCartIcon}
          iconBg="#22C55E15"
          iconColor="#22C55E"
          sparkData={m.sparkOrders}
          sparkColor="#22C55E"
        />
        <AdminKpiCard
          title="Total customers"
          value={m.uniqueCustomers.toLocaleString()}
          growth={m.customersGrowth}
          icon={UsersIcon}
          iconBg="#8B5CF615"
          iconColor="#8B5CF6"
          sparkData={m.sparkCustomers}
          sparkColor="#8B5CF6"
        />
        <AdminKpiCard
          title="Total products"
          value={m.totalProducts.toLocaleString()}
          growth={m.productsGrowth}
          icon={PackageIcon}
          iconBg="#F59E0B15"
          iconColor="#F59E0B"
          sparkData={m.sparkProducts}
          sparkColor="#F59E0B"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminSalesChart data={m.salesByDay} />
        </div>
        <AdminCategoryChart
          categories={m.categoryEntries}
          totalRevenue={m.totalRevenue}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AdminRecentOrders
            orders={m.recentOrders}
            searchQuery={searchQuery}
          />
        </div>
        <div className="space-y-4">
          <AdminTopProducts
            products={m.topProducts}
            maxUnits={m.maxUnits}
          />
          <AdminActivityFeed activity={m.activity} />
        </div>
      </div>

      <AdminBottomMetrics
        conversionRate={m.conversionRate}
        aov={m.aov}
        refundsCents={m.refundsCents}
        satisfaction={m.satisfaction}
        conversionGrowth={m.conversionGrowth}
        aovGrowth={m.aovGrowth}
        refundsGrowth={m.refundsGrowth}
        satisfactionGrowth={m.satisfactionGrowth}
        sparkRevenue={m.sparkRevenue}
        sparkRefunds={m.sparkRefunds}
      />
    </div>
  );
}
