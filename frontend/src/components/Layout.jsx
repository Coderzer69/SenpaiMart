import { useState } from "react";
import { useLocation } from "react-router";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { CartDrawer } from "./CartDrawer.jsx";

const SIDEBAR_WIDTH = 272; // px — keep in sync with Sidebar.jsx w-68

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return <StoreLayout>{children}</StoreLayout>;
}

function StoreLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-svh flex-col bg-[#F5F5F7] text-base-content">
      {/* Sticky navbar — always full width at the top */}
      <Navbar
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Body: sidebar + content side-by-side via CSS transition */}
      <div className="relative flex flex-1 overflow-x-hidden">
        {/* Sidebar — slides in from left, pushes content */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarWidth={SIDEBAR_WIDTH}
        />

        {/* Main content area — shifts right when sidebar is open */}
        <div
          className={`sidebar-content-area flex min-w-0 flex-1 flex-col ${
            sidebarOpen ? "lg:ml-[272px]" : "ml-0"
          }`}
        >
          <div className="flex flex-1 gap-6 px-4 py-6 md:px-6 lg:gap-8">
            <main className="min-w-0 flex-1">{children}</main>
          </div>
          <Footer />
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}

export default Layout;
