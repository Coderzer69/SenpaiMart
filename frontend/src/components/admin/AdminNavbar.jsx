import { Show, UserButton, useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import { apiFetch } from "../../lib/api.js";
import { useAdminShell } from "./AdminShellContext.jsx";

function formatDateRange(from, to) {
  const opts = { month: "short", day: "numeric" };
  const f = from.toLocaleDateString(undefined, opts);
  const t = to.toLocaleDateString(undefined, { ...opts, year: "numeric" });
  return `${f} – ${t}`;
}

export function AdminNavbar({ onMenuOpen, orderCount = 0 }) {
  const { getToken, isSignedIn, user } = useAuth();
  const { searchQuery, setSearchQuery, dateRange, setDateRange } =
    useAdminShell();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const displayName =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Admin";

  const roleLabel = meData?.user?.role === "admin" ? "Administrator" : "Staff";

  const notificationCount = Math.min(orderCount, 9);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/90 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          className="rounded-xl p-2 text-[#6B7280] transition hover:bg-[#F8FAFC] lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </button>

        <div className="hidden min-w-0 flex-1 lg:block">
          <label className="relative block max-w-2xl">
            <SearchIcon
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products, customers..."
              className="w-full rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-11 pr-4 text-sm text-[#111827] outline-none transition placeholder:text-[#6B7280] focus:border-[#FF6B4A]/40 focus:bg-white focus:ring-2 focus:ring-[#FF6B4A]/15"
              aria-label="Search admin dashboard"
            />
          </label>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-3 lg:flex-none">
          <div className="relative hidden md:block">
            <CalendarIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
            <select
              className="appearance-none rounded-[18px] border border-[#E5E7EB] bg-white py-2 pl-9 pr-8 text-xs font-medium text-[#111827] outline-none transition hover:border-[#FF6B4A]/30 focus:border-[#FF6B4A]/40 focus:ring-2 focus:ring-[#FF6B4A]/15"
              value="7d"
              onChange={(e) => {
                const to = new Date();
                const from = new Date();
                if (e.target.value === "7d") from.setDate(from.getDate() - 6);
                else if (e.target.value === "30d")
                  from.setDate(from.getDate() - 29);
                else from.setDate(from.getDate() - 89);
                setDateRange({ from, to });
              }}
              aria-label="Date range filter"
            >
              <option value="7d">{formatDateRange(dateRange.from, dateRange.to)}</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
          </div>

          <button
            type="button"
            className="relative rounded-xl p-2.5 text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
            aria-label={
              notificationCount > 0
                ? `Notifications, ${notificationCount} new`
                : "Notifications"
            }
          >
            {notificationCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            ) : null}
            <BellIcon className="size-5" aria-hidden />
          </button>

          <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] py-1 pl-1 pr-3">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8 ring-2 ring-[#E5E7EB]" },
                }}
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold leading-tight text-[#111827]">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#6B7280]">{roleLabel}</p>
              </div>
            </div>
          </Show>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] px-4 pb-3 pt-0 lg:hidden md:px-6">
        <label className="relative block">
          <SearchIcon
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-11 pr-4 text-sm outline-none focus:border-[#FF6B4A]/40 focus:ring-2 focus:ring-[#FF6B4A]/15"
            aria-label="Search admin dashboard"
          />
        </label>
      </div>
    </header>
  );
}
