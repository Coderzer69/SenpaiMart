import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiFetch } from "../lib/api.js";

const DAY_MS = 86_400_000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inRange(iso, from, to) {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function sumRevenue(orders, status = "paid") {
  return orders
    .filter((o) => o.status === status)
    .reduce((sum, o) => sum + (o.totalCents ?? 0), 0);
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function useAdminDashboard(dateRange) {
  const { getToken, isSignedIn } = useAuth();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const isAdmin = meData?.user?.role === "admin";

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => apiFetch("/api/admin/products", { getToken }),
    enabled: isSignedIn && isAdmin,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch("/api/orders", { getToken }),
    enabled: isSignedIn && isAdmin,
  });

  const products = productsData?.products ?? [];
  const allOrders = ordersData?.orders ?? [];

  const metrics = useMemo(() => {
    const from = dateRange?.from ? startOfDay(dateRange.from) : null;
    const to = dateRange?.to ? startOfDay(dateRange.to) : null;
    to?.setHours(23, 59, 59, 999);

    const orders =
      from && to
        ? allOrders.filter((o) => inRange(o.createdAt, from, to))
        : allOrders;

    const now = startOfDay(new Date());
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);

    const thisWeek = allOrders.filter((o) =>
      inRange(o.createdAt, weekAgo, now),
    );
    const lastWeek = allOrders.filter((o) =>
      inRange(
        o.createdAt,
        twoWeeksAgo,
        new Date(weekAgo.getTime() - 1),
      ),
    );

    const paidOrders = orders.filter((o) => o.status === "paid");
    const failedOrders = orders.filter((o) => o.status === "failed");
    const totalRevenue = sumRevenue(orders);
    const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;
    const activeProducts = products.filter((p) => p.active).length;

    const revenueGrowth = pctChange(
      sumRevenue(thisWeek),
      sumRevenue(lastWeek),
    );
    const ordersGrowth = pctChange(thisWeek.length, lastWeek.length);
    const customersGrowth = pctChange(
      new Set(thisWeek.map((o) => o.userId)).size,
      new Set(lastWeek.map((o) => o.userId)).size,
    );
    const productsGrowth = pctChange(
      products.filter((p) =>
        inRange(p.createdAt, weekAgo, now),
      ).length,
      products.filter((p) =>
        inRange(
          p.createdAt,
          twoWeeksAgo,
          new Date(weekAgo.getTime() - 1),
        ),
      ).length,
    );

    const thisWeekPaid = thisWeek.filter((o) => o.status === "paid");
    const lastWeekPaid = lastWeek.filter((o) => o.status === "paid");
    const thisWeekConv =
      thisWeek.length > 0 ? (thisWeekPaid.length / thisWeek.length) * 100 : 0;
    const lastWeekConv =
      lastWeek.length > 0 ? (lastWeekPaid.length / lastWeek.length) * 100 : 0;
    const conversionGrowth = pctChange(thisWeekConv, lastWeekConv);

    const thisWeekAov =
      thisWeekPaid.length > 0
        ? sumRevenue(thisWeekPaid) / thisWeekPaid.length
        : 0;
    const lastWeekAov =
      lastWeekPaid.length > 0
        ? sumRevenue(lastWeekPaid) / lastWeekPaid.length
        : 0;
    const aovGrowth = pctChange(thisWeekAov, lastWeekAov);

    const thisWeekRefunds = sumRevenue(
      thisWeek.filter((o) => o.status === "failed"),
      "failed",
    );
    const lastWeekRefunds = sumRevenue(
      lastWeek.filter((o) => o.status === "failed"),
      "failed",
    );
    const refundsGrowth = pctChange(thisWeekRefunds, lastWeekRefunds);

    const thisWeekSat =
      thisWeekPaid.length > 0
        ? Math.min(5, 3.5 + (thisWeekConv / 100) * 1.5)
        : null;
    const lastWeekSat =
      lastWeekPaid.length > 0
        ? Math.min(5, 3.5 + (lastWeekConv / 100) * 1.5)
        : null;
    const satisfactionGrowth =
      thisWeekSat !== null && lastWeekSat !== null
        ? pctChange(thisWeekSat, lastWeekSat)
        : 0;

    const salesByDay = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * DAY_MS);
      const next = new Date(day.getTime() + DAY_MS);
      const dayOrders = allOrders.filter(
        (o) =>
          o.status === "paid" &&
          inRange(o.createdAt, day, new Date(next.getTime() - 1)),
      );
      const label = day.toLocaleDateString(undefined, { weekday: "short" });
      return {
        label,
        revenue: sumRevenue(dayOrders),
        orders: dayOrders.length,
      };
    });

    const categoryTotals = new Map();
    for (const order of paidOrders) {
      for (const item of order.previewItems ?? []) {
        const product = products.find((p) => p.slug === item.slug);
        const category = product?.category ?? "General";
        const prev = categoryTotals.get(category) ?? 0;
        categoryTotals.set(
          category,
          prev + item.quantity * (product?.priceCents ?? 0),
        );
      }
    }

    const categoryEntries = [...categoryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, cents]) => ({ name, cents }));

    const productSales = new Map();
    for (const order of paidOrders) {
      for (const item of order.previewItems ?? []) {
        const prev = productSales.get(item.slug) ?? {
          name: item.name,
          imageUrl: item.imageUrl,
          units: 0,
        };
        productSales.set(item.slug, {
          ...prev,
          units: prev.units + item.quantity,
        });
      }
    }

    const topProducts = [...productSales.values()]
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const maxUnits = topProducts[0]?.units ?? 1;

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const activity = [];

    for (const order of recentOrders.slice(0, 4)) {
      activity.push({
        id: `order-${order.id}`,
        type: "order",
        message: `New order ${order.id.slice(0, 8)}… placed`,
        time: relativeTime(order.createdAt),
        createdAt: order.createdAt,
      });
    }

    for (const product of products.filter((p) => !p.active).slice(0, 2)) {
      activity.push({
        id: `stock-${product.id}`,
        type: "stock",
        message: `"${product.name}" is inactive in catalog`,
        time: relativeTime(product.createdAt),
        createdAt: product.createdAt,
      });
    }

    activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paidCount = paidOrders.length;
    const totalCount = orders.length || 1;
    const conversionRate = (paidCount / totalCount) * 100;
    const aov = paidCount > 0 ? totalRevenue / paidCount : 0;
    const refundsCents = sumRevenue(failedOrders, "failed");
    const satisfaction =
      paidCount > 0 ? Math.min(5, 3.5 + (conversionRate / 100) * 1.5) : null;

    const sparkRevenue = salesByDay.map((d) => d.revenue);
    const sparkOrders = salesByDay.map((d) => d.orders);
    const sparkCustomers = salesByDay.map((_, i) =>
      new Set(
        allOrders
          .filter((o) => {
            const day = new Date(now.getTime() - (6 - i) * DAY_MS);
            const next = new Date(day.getTime() + DAY_MS);
            return inRange(o.createdAt, day, new Date(next.getTime() - 1));
          })
          .map((o) => o.userId),
      ).size,
    );
    const sparkRefunds = salesByDay.map((_, i) => {
      const day = new Date(now.getTime() - (6 - i) * DAY_MS);
      const next = new Date(day.getTime() + DAY_MS);
      return sumRevenue(
        allOrders.filter(
          (o) =>
            o.status === "failed" &&
            inRange(o.createdAt, day, new Date(next.getTime() - 1)),
        ),
        "failed",
      );
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      uniqueCustomers,
      totalProducts: products.length,
      activeProducts,
      revenueGrowth,
      ordersGrowth,
      customersGrowth,
      productsGrowth,
      salesByDay,
      categoryEntries,
      topProducts,
      maxUnits,
      recentOrders,
      activity: activity.slice(0, 5),
      conversionRate,
      aov,
      refundsCents,
      satisfaction,
      conversionGrowth,
      aovGrowth,
      refundsGrowth,
      satisfactionGrowth,
      sparkRevenue,
      sparkOrders,
      sparkCustomers,
      sparkRefunds,
      sparkProducts: salesByDay.map(() => activeProducts),
      lowStockCount: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length,
      outOfStockCount: products.filter(p => p.stockQuantity <= 0).length,
    };
  }, [allOrders, products, dateRange]);

  return {
    meData,
    isAdmin,
    products,
    productsLoading,
    ordersLoading,
    isLoading: productsLoading || ordersLoading,
    metrics,
  };
}
