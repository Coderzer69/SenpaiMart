import { Show, SignInButton, useAuth, UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  BellIcon,
  HeartIcon,
  MenuIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useCart } from "../store/cart.js";
import { useWishlist } from "../store/wishlist.js";
import { SearchBar } from "./SearchBar.jsx";

const SenpaiLogoIcon = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props} xmlns="http://www.w3.org/2000/svg">
    {/* Dome */}
    <path d="M 35 25 C 35 15, 65 15, 65 25 Z" />
    {/* Kasagi (Top curved bar) */}
    <path d="M 5 25 Q 50 18 95 25 L 95 32 Q 50 25 5 32 Z" />
    {/* Nuki (Second horizontal bar) */}
    <rect x="10" y="42" width="80" height="6" rx="2" />
    {/* Hashira (Pillars) */}
    <rect x="22" y="28" width="8" height="62" rx="2" />
    <rect x="70" y="28" width="8" height="62" rx="2" />
    {/* Bottom Base */}
    <rect x="15" y="86" width="70" height="6" rx="2" />
    {/* Shopping Bag */}
    <rect x="34" y="54" width="32" height="34" rx="4" />
    <path d="M 42 54 v -5 a 8 8 0 0 1 16 0 v 5" stroke="currentColor" strokeWidth="4" fill="none" />
    {/* Kanji */}
    <text x="50" y="80" fill="#fff" fontSize="22" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">先</text>
  </svg>
);

const Navbar = ({ sidebarOpen, onMenuToggle }) => {
  const { getToken, isSignedIn, user } = useAuth();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const role = meData?.user?.role;

  const openDrawer = useCart((s) => s.openDrawer);
  const cartCount = useCart((s) =>
    s.items.reduce((n, line) => n + line.quantity, 0),
  );

  const wishlistCount = useWishlist((s) => s.ids.length);

  const displayName =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Guest";

  return (
    <header
      className="sticky top-0 z-40 border-b border-[#E8E8ED] bg-[#F5F5F7]/95 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-md"
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      {/*
        Desktop (md+): 3-column grid — left/right share equal flex basis so the
        centre column is always pixel-perfect centred in the full navbar width.

        Mobile (<md): 2-row layout — top row has hamburger+logo and icons,
        bottom row has the full-width search bar.
      */}

      {/* ── Desktop row (md+): 3-col grid ───────────────────────────────── */}
      <div className="hidden h-[70px] items-center px-5 md:grid md:[grid-template-columns:1fr_auto_1fr]">

        {/* Col 1 — Left: hamburger + logo */}
        <div className="flex items-center gap-[14px]">
          <button
            type="button"
            id="sidebar-toggle-btn"
            onClick={onMenuToggle}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#1E293B] active:bg-black/10"
          >
            {sidebarOpen ? (
              <XIcon className="size-5" aria-hidden />
            ) : (
              <MenuIcon className="size-5" aria-hidden />
            )}
          </button>

          <Link
            to="/"
            className="flex items-center gap-[10px] transition-opacity hover:opacity-80"
            aria-label="SenpaiMart home"
          >
            <SenpaiLogoIcon className="size-[32px] shrink-0 text-[#FF6B4A]" aria-hidden />
            <span className="text-[21px] font-bold tracking-tight">
              <span className="text-[#1E293B]">Senpai</span>
              <span className="text-[#FF6B4A]">Mart</span>
            </span>
          </Link>
        </div>

        {/* Col 2 — Centre: search bar (truly centred via grid) */}
        <div className="w-[min(480px,40vw)]">
          <SearchBar />
        </div>

        {/* Col 3 — Right: icons + user (justify to right edge) */}
        <div className="flex items-center justify-end gap-0.5">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827]"
            aria-label={
              wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"
            }
            title="Your wishlist"
          >
            <HeartIcon
              className={`size-5 transition-colors ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-bold leading-none text-white shadow-sm">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          {/* Notifications */}
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827]"
            aria-label="Notifications"
            title="Order updates appear in My Orders"
          >
            <BellIcon className="size-5" aria-hidden />
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={openDrawer}
            className="relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827]"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingCartIcon className="size-5" aria-hidden />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>

          {/* Divider */}
          <div className="mx-1.5 h-6 w-px bg-[#E8E8ED]" />

          {/* Auth */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl px-4 text-[13px]"
              >
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-xl border border-[#E8E8ED] bg-white/70 py-1 pl-1 pr-3 shadow-sm backdrop-blur-sm">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-7 w-7 ring-2 ring-[#E8E8ED]" },
                }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-tight text-[#111827]">
                  Hi, {displayName}
                </p>
                {role === "admin" || role === "support" ? (
                  <span className="text-[10px] font-medium capitalize text-primary">
                    {role}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#6B7280]">Member</span>
                )}
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* ── Mobile layout (<md): 2 rows ────────────────────────────────── */}
      <div className="md:hidden">
        {/* Row 1: hamburger + logo + icons */}
        <div className="flex h-[70px] items-center gap-[14px] px-4">
          {/* Hamburger */}
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#1E293B] active:bg-black/10"
          >
            {sidebarOpen ? (
              <XIcon className="size-5" aria-hidden />
            ) : (
              <MenuIcon className="size-5" aria-hidden />
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-[10px] transition-opacity hover:opacity-80"
            aria-label="SenpaiMart home"
          >
            <SenpaiLogoIcon className="size-[32px] shrink-0 text-[#FF6B4A]" aria-hidden />
            <span className="text-[21px] font-bold tracking-tight">
              <span className="text-[#1E293B]">Senpai</span>
              <span className="text-[#FF6B4A]">Mart</span>
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right icons */}
          <Link
            to="/wishlist"
            className="relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827]"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"}
          >
            <HeartIcon
              className={`size-5 transition-colors ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-bold leading-none text-white shadow-sm">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            className="relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827]"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingCartIcon className="size-5" aria-hidden />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>

          <div className="mx-1 h-5 w-px bg-[#E8E8ED]" />

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary btn-sm rounded-xl px-3 text-[12px]">
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-7 w-7 ring-2 ring-[#E8E8ED]" },
              }}
            />
          </Show>
        </div>

        {/* Row 2: full-width search bar */}
        <div className="border-t border-[#F0F0F5] px-4 pb-3 pt-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
