import { Show, SignInButton, useAuth, UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid2X2Icon,
  HeadphonesIcon,
  HomeIcon,
  LogInIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useCart } from "../store/cart.js";

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
      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <item.icon className="size-5 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
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

  const panel = (
    <aside className="flex h-full flex-col bg-base-100">
      <div className="flex items-center justify-between px-5 py-5 lg:px-6">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 font-bold text-lg text-base-content"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBagIcon className="size-5" aria-hidden />
          </span>
          SenpaiMart
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Menu
        </p>
        {mainNav.map((item) => (
          <NavLink key={item.label} item={item} onNavigate={onClose} />
        ))}

        <Show when="signed-in">
          <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </p>
          {accountNav.map((item) => (
            <NavLink key={item.label} item={item} onNavigate={onClose} />
          ))}
          {role === "admin" ? (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-secondary transition-all hover:bg-secondary/10"
            >
              <SettingsIcon className="size-5 shrink-0" aria-hidden />
              Admin
            </Link>
          ) : null}
        </Show>
      </nav>

      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-2xl bg-linear-to-br from-primary/15 via-primary/5 to-secondary/10 p-4">
          <div className="flex items-start gap-3">
            <SparklesIcon className="size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-base-content">
                Premium Support
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
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

        <div className="flex items-center gap-2 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-xs text-muted">
          <HeadphonesIcon className="size-4 shrink-0 text-primary" aria-hidden />
          <span>Order-scoped support after checkout</span>
        </div>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button type="button" className="btn btn-primary btn-sm w-full gap-2">
              <LogInIcon className="size-4" aria-hidden />
              Sign in
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 px-3 py-2">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9 ring-2 ring-base-300" },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Your account</p>
              {role === "admin" || role === "support" ? (
                <span className="badge badge-primary badge-xs capitalize">
                  {role}
                </span>
              ) : (
                <p className="text-xs text-muted">
                  {cartCount} item{cartCount === 1 ? "" : "s"} in cart
                </p>
              )}
            </div>
          </div>
        </Show>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-base-300 bg-base-100 lg:block xl:w-72">
        <div className="sticky top-0 h-svh overflow-y-auto">{panel}</div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            {panel}
          </div>
        </div>
      ) : null}
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
