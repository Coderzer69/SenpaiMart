import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellIcon, CheckCheckIcon, InboxIcon, Loader2Icon } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api.js";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/api/notifications", { getToken }),
    enabled: isSignedIn,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        getToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/notifications/read-all", {
        method: "PATCH",
        getToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-all duration-300 hover:bg-black/5 hover:text-[#111827] active:scale-95"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <BellIcon className={`size-5 transition-transform duration-300 group-hover:scale-110 ${unreadCount > 0 ? 'group-hover:rotate-12' : ''}`} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_-2px_rgba(239,68,68,0.5)] transition-transform duration-300 group-hover:scale-110">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-base-300 bg-white shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] outline-none ring-0 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
            <h3 className="font-semibold text-base-content">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <CheckCheckIcon className="size-3.5" />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain py-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-muted">
                <Loader2Icon className="size-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-base-200 text-muted">
                  <InboxIcon className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content">All caught up!</p>
                  <p className="text-xs text-muted">No new notifications</p>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    {notification.link ? (
                      <Link
                        to={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-base-200/50 ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-base-200/50 ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <NotificationContent notification={notification} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notification }) {
  return (
    <>
      <div className="mt-1 flex size-2 shrink-0 rounded-full">
        {!notification.isRead && <div className="size-full rounded-full bg-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-base-content">
          {notification.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {notification.message}
        </p>
        <p className="mt-1.5 text-[10px] font-medium text-muted/70">
          {new Date(notification.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </>
  );
}
