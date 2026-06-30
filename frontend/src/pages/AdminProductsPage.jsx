import { Navigate } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api.js";
import { AdminDashboardView } from "../components/admin/AdminDashboardView.jsx";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { AdminProductsPanel } from "../components/admin/AdminProductsPanel.jsx";
import { AdminInventoryPanel } from "../components/admin/AdminInventoryPanel.jsx";
import { AdminBrandsPanel } from "../components/admin/AdminBrandsPanel.jsx";
import { AdminCategoriesPanel } from "../components/admin/AdminCategoriesPanel.jsx";

function AdminProductsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch("/api/orders", { getToken }),
    enabled: isSignedIn && meData?.user?.role === "admin",
  });

  if (meData && meData.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const pendingOrders =
    ordersData?.orders?.filter((o) => o.status === "pending").length ?? 0;

  let section;
  if (activeSection === "products") {
    section = <AdminProductsPanel />;
  } else if (activeSection === "inventory") {
    section = <AdminInventoryPanel />;
  } else if (activeSection === "brands") {
    section = <AdminBrandsPanel />;
  } else if (activeSection === "categories") {
    section = <AdminCategoriesPanel />;
  } else {
    section = <AdminDashboardView />;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      orderCount={pendingOrders}
    >
      {section}
    </AdminLayout>
  );
}

export default AdminProductsPage;
