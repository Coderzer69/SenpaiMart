import { useState } from "react";
import { AdminNavbar } from "./AdminNavbar.jsx";
import { AdminShellProvider } from "./AdminShellContext.jsx";
import { AdminSidebar } from "./AdminSidebar.jsx";

export function AdminLayout({ children, activeSection, onSectionChange, orderCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AdminShellProvider
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <div className="flex min-h-svh bg-[#F8FAFC] font-sans text-[#111827]">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminNavbar
            onMenuOpen={() => setMobileMenuOpen(true)}
            orderCount={orderCount}
          />

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
