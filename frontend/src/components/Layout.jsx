import { useState } from "react";
import { useLocation } from "react-router";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { FloatingCartPanel } from "./FloatingCartPanel.jsx";

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return (
    <StoreLayout>{children}</StoreLayout>
  );
}

function StoreLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-base-200 text-base-content">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuOpen={() => setMobileMenuOpen(true)} />

        <div className="flex flex-1 gap-6 px-4 py-6 md:px-6 lg:gap-8">
          <main className="min-w-0 flex-1">{children}</main>
          <FloatingCartPanel />
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Layout;
