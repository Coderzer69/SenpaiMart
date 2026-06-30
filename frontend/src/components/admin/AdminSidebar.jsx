import { Show, UserButton, useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3Icon,
  ChevronDownIcon,
  CrownIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  XIcon,
} from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../../lib/api.js";
import { useAdminShell } from "./AdminShellContext.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { id: "products", label: "Products", icon: PackageIcon },
  { id: "orders", label: "Orders", icon: ShoppingCartIcon, href: "/orders" },
  { id: "analytics", label: "Analytics", icon: BarChart3Icon },
];

function NavItem({ item, isActive, onNavigate }) {
  const { onSectionChange } = useAdminShell();
  const baseClass =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200";

  if (item.href) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={`${baseClass} text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]`}
      >
        <item.icon className="size-[18px] shrink-0" aria-hidden />
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onSectionChange(item.id);
        onNavigate?.();
      }}
      className={`${baseClass} ${
        isActive
          ? "bg-[#FF6B4A]/10 text-[#FF6B4A] shadow-sm"
          : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <item.icon className="size-[18px] shrink-0" aria-hidden />
      {item.label}
    </button>
  );
}

export function AdminSidebar({ mobileOpen, onClose }) {
  const { getToken, isSignedIn, user } = useAuth();
  const { activeSection, onSectionChange } = useAdminShell();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Admin";

  const roleLabel =
    meData?.user?.role === "admin" ? "Administrator" : "Staff";

  const panel = (
    <aside className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-5 lg:px-6">
        <Link
          to="/admin"
          onClick={() => {
            onSectionChange("dashboard");
            onClose?.();
          }}
          className="flex items-center gap-2.5 font-bold text-lg text-[#111827]"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A]">
            <ShoppingBagIcon className="size-5" aria-hidden />
          </span>
          SenpaiMart
        </Link>
        <button
          type="button"
          className="rounded-xl p-2 text-[#6B7280] transition hover:bg-[#F8FAFC] lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2" aria-label="Admin">
        <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Menu
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={
              item.id === "analytics"
                ? activeSection === "analytics"
                : activeSection === item.id
            }
            onNavigate={onClose}
          />
        ))}

        <p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Store
        </p>
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
        >
          <StoreIcon className="size-[18px] shrink-0" aria-hidden />
          View storefront
        </Link>
        <button
          type="button"
          onClick={() => {
            onSectionChange("products");
            onClose?.();
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
        >
          <SettingsIcon className="size-[18px] shrink-0" aria-hidden />
          Catalog settings
        </button>
      </nav>

      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-linear-to-br from-[#FF6B4A]/10 via-white to-[#8B5CF6]/5 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FF6B4A]/15 text-[#FF6B4A]">
              <CrownIcon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Upgrade to Pro
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                Advanced analytics, bulk tools, and priority support.
              </p>
              <Link
                to="/orders"
                onClick={onClose}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#FF6B4A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#FF6B4A]/90"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>

        <Show when="signed-in">
          <div className="flex items-center gap-3 rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9 ring-2 ring-[#E5E7EB]" },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827]">
                {displayName}
              </p>
              <p className="text-xs text-[#6B7280]">{roleLabel}</p>
            </div>
            <ChevronDownIcon
              className="size-4 shrink-0 text-[#6B7280]"
              aria-hidden
            />
          </div>
        </Show>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden w-[260px] shrink-0 border-r border-[#E5E7EB] bg-white xl:w-[280px] lg:block">
        <div className="sticky top-0 h-svh overflow-y-auto">{panel}</div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#111827]/30 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl">
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}
