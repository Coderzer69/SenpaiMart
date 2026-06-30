import { Show, SignInButton, useAuth, UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BellIcon,
  HeartIcon,
  MenuIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useCart } from "../store/cart.js";
import { useWishlist } from "../store/wishlist.js";
import BrandLogo from "./BrandLogo.jsx";
import { CartToast } from "./CartToast.jsx";
import { SearchBar } from "./SearchBar.jsx";

const Navbar = ({ sidebarOpen, onMenuToggle }) => {
  const { getToken, isSignedIn, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-400 ease-out border-b ${
        scrolled
          ? "border-base-300/80 bg-white/85 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
          : "border-transparent bg-[#F5F5F7]/80 shadow-none"
      }`}
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
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
            className="group flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
          >
            {sidebarOpen ? (
              <XIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
            ) : (
              <MenuIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
            )}
          </button>

          <Link
            to="/"
            className="group flex items-center gap-[10px] transition-all duration-300 active:scale-[0.97]"
            aria-label="SenpaiMart home"
          >
            <div className="transition-transform duration-400 ease-out group-hover:-rotate-6 group-hover:scale-110">
              <BrandLogo size={36} aria-hidden />
            </div>
            <span className="text-[21px] font-bold tracking-tight">
              <span className="text-[#1E293B] transition-colors duration-300 group-hover:text-black">Senpai</span>
              <span className="text-primary transition-colors duration-300 group-hover:text-primary/80">Mart</span>
            </span>
          </Link>
        </div>

        {/* Col 2 — Centre: search bar (truly centred via grid) */}
        <div className="w-[min(480px,40vw)] transition-transform duration-500 ease-out">
          <SearchBar />
        </div>

        {/* Col 3 — Right: icons + user (justify to right edge) */}
        <div className="flex items-center justify-end gap-0.5">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="group relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
            aria-label={
              wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"
            }
            title="Your wishlist"
          >
            <HeartIcon
              className={`size-5 transition-all duration-300 group-hover:scale-110 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_-2px_rgba(239,68,68,0.5)] transition-transform duration-300 group-hover:scale-110">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          {/* Notifications */}
          <button
            type="button"
            className="group flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
            aria-label="Notifications"
            title="Order updates appear in My Orders"
          >
            <BellIcon className="size-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" aria-hidden />
          </button>

          {/* Cart — desktop */}
          <div className="relative">
            <button
              type="button"
              onClick={openDrawer}
              className="group relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            >
              <ShoppingCartIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_-2px_rgba(255,107,74,0.5)] transition-transform duration-300 group-hover:scale-110">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
            <CartToast />
          </div>

          {/* Divider */}
          <div className="mx-1.5 h-6 w-px bg-base-300/60" />

          {/* Auth */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl px-5 text-[13px] shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-95"
              >
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="group flex cursor-pointer items-center gap-2 rounded-[14px] border border-transparent bg-transparent py-1 pl-1 pr-3 transition-all duration-300 hover:border-base-300 hover:bg-white/80 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] active:scale-[0.98]">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <UserButton
                  appearance={{
                    elements: { avatarBox: "h-7 w-7 ring-2 ring-transparent transition-all duration-300 group-hover:ring-[#E8E8ED]" },
                  }}
                />
              </div>
              <div className="min-w-0 transition-opacity duration-300 group-hover:opacity-80">
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
            className="group flex size-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#1E293B] active:scale-95"
          >
            {sidebarOpen ? (
              <XIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
            ) : (
              <MenuIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-[10px] transition-all duration-300 active:scale-[0.97]"
            aria-label="SenpaiMart home"
          >
            <div className="transition-transform duration-400 ease-out group-hover:-rotate-6 group-hover:scale-110">
              <BrandLogo size={30} aria-hidden />
            </div>
            <span className="text-[21px] font-bold tracking-tight">
              <span className="text-[#1E293B] transition-colors duration-300 group-hover:text-black">Senpai</span>
              <span className="text-primary transition-colors duration-300 group-hover:text-primary/80">Mart</span>
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right icons */}
          <Link
            to="/wishlist"
            className="group relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"}
          >
            <HeartIcon
              className={`size-5 transition-all duration-300 group-hover:scale-110 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_-2px_rgba(239,68,68,0.5)] transition-transform duration-300 group-hover:scale-110">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          {/* Cart — mobile */}
          <div className="relative">
            <button
              type="button"
              onClick={openDrawer}
              className="group relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            >
              <ShoppingCartIcon className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_-2px_rgba(255,107,74,0.5)] transition-transform duration-300 group-hover:scale-110">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
            <CartToast />
          </div>

          <div className="mx-1 h-5 w-px bg-base-300/60" />

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary btn-sm rounded-xl px-4 text-[12px] shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-95">
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="group transition-transform duration-300 hover:scale-105 active:scale-95">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-7 w-7 ring-2 ring-transparent transition-all duration-300 group-hover:ring-[#E8E8ED]" },
                }}
              />
            </div>
          </Show>
        </div>

        {/* Row 2: full-width search bar */}
        <div className="border-t border-[#F0F0F5]/50 px-4 pb-3 pt-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
