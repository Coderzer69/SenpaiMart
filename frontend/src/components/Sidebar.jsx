import { Show, SignInButton, useAuth, UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid2X2Icon,
  HeadphonesIcon,
  HomeIcon,
  LogInIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useCart } from "../store/cart.js";
import BrandLogo from "./BrandLogo.jsx";

const mainNav = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/#catalog", label: "Categories", icon: Grid2X2Icon, hash: true },
  { to: "/cart", label: "Cart", icon: ShoppingCartIcon },
];

const accountNav = [
  { to: "/orders", label: "My Orders", icon: PackageIcon, signedIn: true },
];

function NavLink({ item, onNavigate }) {
  const location = useLocation();
  const isActive =
    item.end
      ? location.pathname === item.to
      : item.hash
        ? location.pathname === "/" && location.hash === "#catalog"
        : location.pathname.startsWith(item.to);

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-[#374151] hover:bg-[#F5F5F7] hover:text-[#111827]"
      }`}
    >
      <item.icon className="size-5 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

/**
 * Sidebar — always a slide-in drawer (no persistent desktop column).
 * Position: fixed, full-height, slides in with CSS transform.
 * The Layout shifts page content via margin-left to "push" (not overlay) on desktop.
 */
export function Sidebar({ open, onClose, sidebarWidth = 272 }) {
  const { getToken, isSignedIn } = useAuth();
  const cartCount = useCart((s) =>
    s.items.reduce((n, line) => n + line.quantity, 0),
  );

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const role = meData?.user?.role;

  return (
    <>
      {/* Backdrop — only visible on small screens (desktop pushes instead) */}
      <div
        className={`fixed inset-0 z-30 bg-neutral/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        style={{
          width: sidebarWidth,
          transform: open ? "translateX(0)" : `translateX(-${sidebarWidth}px)`,
        }}
        className="fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r border-[#E8E8ED] bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out"
        aria-label="Site navigation"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#F0F0F5] px-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 font-semibold text-[15px] text-[#111827] transition-opacity hover:opacity-80"
          >
            <BrandLogo size={32} />
            SenpaiMart
          </Link>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F5F5F7] hover:text-[#111827]"
            onClick={onClose}
            aria-label="Close menu"
          >
            <XIcon className="size-4.5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
            Menu
          </p>
          {mainNav.map((item) => (
            <NavLink key={item.label} item={item} onNavigate={onClose} />
          ))}

          <Show when="signed-in">
            <p className="mb-1.5 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Account
            </p>
            {accountNav.map((item) => (
              <NavLink key={item.label} item={item} onNavigate={onClose} />
            ))}
            {role === "admin" ? (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-secondary transition-all hover:bg-secondary/10"
              >
                <SettingsIcon className="size-5 shrink-0" aria-hidden />
                Admin
              </Link>
            ) : null}
          </Show>
        </nav>

        {/* Footer cards */}
        <div className="shrink-0 space-y-2.5 border-t border-[#F0F0F5] p-3">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 p-4">
            <div className="flex items-start gap-3">
              <SparklesIcon className="size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  Premium Support
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                  Chat &amp; video help on paid orders
                </p>
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
                >
                  View orders →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E8E8ED] bg-[#F9F9FB] px-4 py-3 text-xs text-[#6B7280]">
            <HeadphonesIcon className="size-4 shrink-0 text-primary" aria-hidden />
            <span>Order-scoped support after checkout</span>
          </div>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary btn-sm w-full gap-2 rounded-xl">
                <LogInIcon className="size-4" aria-hidden />
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3 rounded-xl border border-[#E8E8ED] bg-[#F9F9FB] px-3 py-2.5">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-9 w-9 ring-2 ring-[#E8E8ED]" },
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">Your account</p>
                {role === "admin" || role === "support" ? (
                  <span className="badge badge-primary badge-xs capitalize">
                    {role}
                  </span>
                ) : (
                  <p className="text-xs text-[#6B7280]">
                    {cartCount} item{cartCount === 1 ? "" : "s"} in cart
                  </p>
                )}
              </div>
            </div>
          </Show>
        </div>
      </aside>
    </>
  );
}

export function categoryIconFor(name) {
  const key = (name ?? "").toLowerCase();
  if (key.includes("audio") || key.includes("music")) return TagIcon;
  if (key.includes("wear") || key.includes("fashion")) return SparklesIcon;
  if (key.includes("travel")) return PackageIcon;
  if (key.includes("workspace") || key.includes("home")) return HomeIcon;
  return Grid2X2Icon;
}
