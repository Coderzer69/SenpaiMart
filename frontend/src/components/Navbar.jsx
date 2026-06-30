import { Show, SignInButton, useAuth, UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  BellIcon,
  HeartIcon,
  MenuIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useCart } from "../store/cart.js";
import { SearchBar } from "./SearchBar.jsx";

const Navbar = ({ onMenuOpen }) => {
  const { getToken, isSignedIn, user } = useAuth();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const role = meData?.user?.role;

  const cartCount = useCart((s) =>
    s.items.reduce((n, line) => n + line.quantity, 0),
  );

  const displayName =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Guest";

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square shrink-0 lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </button>

        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:gap-2 lg:flex-none">
          <Link
            to="/cart"
            className="btn btn-ghost btn-sm btn-square relative hidden sm:flex"
            aria-label="Wishlist (opens cart)"
            title="Saved items — view cart"
          >
            <HeartIcon className="size-5 text-muted" aria-hidden />
          </Link>

          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square relative hidden md:flex"
            aria-label="Notifications"
            title="Order updates appear in My Orders"
          >
            <BellIcon className="size-5 text-muted" aria-hidden />
          </button>

          <Link
            to="/cart"
            className="btn btn-ghost btn-sm btn-square relative indicator"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          >
            {cartCount > 0 ? (
              <span className="indicator-item badge badge-primary badge-xs min-w-4 px-1 font-sans text-[10px] tabular-nums">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
            <ShoppingCartIcon className="size-5" aria-hidden />
          </Link>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary btn-sm px-4">
                Sign in
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-2xl border border-base-300 bg-base-200/40 py-1 pl-1 pr-3">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8 ring-2 ring-base-300" },
                }}
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold leading-tight">
                  Hi, {displayName}
                </p>
                {role === "admin" || role === "support" ? (
                  <span className="text-[10px] font-medium capitalize text-primary">
                    {role}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted">Member</span>
                )}
              </div>
            </div>
          </Show>
        </div>
      </div>

      <div className="border-t border-base-300 px-4 pb-3 lg:hidden md:px-6">
        <SearchBar />
      </div>
    </header>
  );
};

export default Navbar;
