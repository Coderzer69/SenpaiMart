/**
 * CartToast — a small "Added to Cart" confirmation that pops up
 * below the Navbar cart icon whenever an item is added to the cart.
 *
 * It subscribes to `lastAddedAt` in the cart store (set by every addItem call)
 * and debounces rapid clicks so only one toast is visible at a time.
 *
 * Rendered inside Navbar, positioned absolutely relative to the cart button wrapper.
 */
import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon } from "lucide-react";
import { useCart } from "../store/cart.js";

const VISIBLE_MS = 1800; // how long the toast stays fully visible
const FADE_MS    = 300;  // CSS transition duration (must match the CSS below)

export function CartToast() {
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const [phase, setPhase] = useState("hidden"); // "hidden" | "enter" | "visible" | "leave"
  const timerRef = useRef(null);
  const prevRef  = useRef(0);

  useEffect(() => {
    // Ignore the initial 0 value on mount
    if (!lastAddedAt || lastAddedAt === prevRef.current) return;
    prevRef.current = lastAddedAt;

    // Cancel any running hide timer so duplicate clicks restart the timer
    clearTimeout(timerRef.current);

    // If already showing, jump straight to visible (no flicker)
    setPhase((p) => (p === "hidden" ? "enter" : "visible"));

    // enter → visible (one frame later so CSS transition fires)
    const rafId = requestAnimationFrame(() => setPhase("visible"));

    // visible → leave after VISIBLE_MS
    timerRef.current = setTimeout(() => {
      setPhase("leave");
      // leave → hidden after CSS fade completes
      timerRef.current = setTimeout(() => setPhase("hidden"), FADE_MS);
    }, VISIBLE_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerRef.current);
    };
  }, [lastAddedAt]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        /* fade + slide-up: enter starts at opacity-0 / translateY(6px) */
        opacity:   phase === "visible" ? 1 : 0,
        transform: phase === "visible" ? "translateY(0)" : "translateY(6px)",
        transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
      }}
      className="
        pointer-events-none absolute left-1/2 top-full z-50
        mt-2 -translate-x-1/2 whitespace-nowrap
        flex items-center gap-1.5
        rounded-xl border border-green-200/80
        bg-white/95 px-3 py-1.5
        text-xs font-semibold text-green-700
        shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12),0_0_0_1px_rgba(34,197,94,0.08)]
        backdrop-blur-sm
      "
    >
      <CheckCircleIcon className="size-3.5 shrink-0 text-green-500" aria-hidden />
      Added to Cart
    </div>
  );
}
