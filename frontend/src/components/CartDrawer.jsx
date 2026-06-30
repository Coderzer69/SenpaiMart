import { Show, SignInButton, useAuth } from "@clerk/react";
import { LockIcon, MinusIcon, PlusIcon, ShoppingCartIcon, Trash2Icon, XIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useFloatingCart } from "../hooks/useFloatingCart.js";
import { useCart } from "../store/cart.js";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl.js";
import { formatPrice } from "../utils/format.js";
import { apiFetch } from "../lib/api.js";

export function CartDrawer() {
  const location = useLocation();
  const { getToken } = useAuth();
  const { isDrawerOpen, closeDrawer } = useCart();
  const {
    items,
    lines,
    subtotal,
    itemCount,
    productsLoading,
    setQty,
    removeItem,
  } = useFloatingCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  async function checkout() {
    setCheckoutLoading(true);
    try {
      const body = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const res = await apiFetch("/api/checkout", {
        getToken,
        method: "POST",
        body,
      });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[360px] max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-[#E8E8ED] px-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#111827]">
            <ShoppingCartIcon className="size-5 text-primary" aria-hidden />
            Your Cart
            {itemCount > 0 ? (
              <span className="text-sm font-medium text-[#6B7280]">
                ({itemCount})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827] active:bg-black/10"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCartIcon className="size-12 text-[#9CA3AF] mb-4" aria-hidden />
              <p className="text-base font-semibold text-[#111827]">Your cart is empty</p>
              <p className="mt-1 text-sm text-[#6B7280]">Looks like you haven't added anything yet.</p>
              <button onClick={closeDrawer} className="btn btn-primary mt-6 rounded-xl shadow-sm">
                Start Shopping
              </button>
            </div>
          ) : productsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="size-20 rounded-xl bg-[#F5F5F7]" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-[#E8E8ED]" />
                    <div className="h-4 w-1/4 rounded bg-[#E8E8ED]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map(({ line, product: p }) => (
                <li key={line.productId} className="flex gap-4 group">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-[#E8E8ED] bg-[#F5F5F7]">
                    {p?.imageUrl ? (
                      <img
                        src={imageKitOptimizedUrl(p.imageUrl, IK_PRESETS.cartThumb)}
                        alt=""
                        className="size-full object-cover mix-blend-multiply"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="line-clamp-2 text-sm font-medium leading-tight text-[#111827]">
                        {p?.name ?? "Product"}
                      </p>
                      <button
                        type="button"
                        className="p-1 -mr-1 -mt-1 text-[#9CA3AF] transition-colors hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                        onClick={() => removeItem(line.productId)}
                        aria-label="Remove item"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex h-8 items-center rounded-lg border border-[#E8E8ED] bg-[#F9F9FB]">
                        <button
                          type="button"
                          className="flex h-full w-8 items-center justify-center text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827] rounded-l-lg"
                          onClick={() => setQty(line.productId, line.quantity - 1)}
                        >
                          <MinusIcon className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#111827] tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-full w-8 items-center justify-center text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827] rounded-r-lg"
                          onClick={() => setQty(line.productId, Math.min(99, line.quantity + 1))}
                        >
                          <PlusIcon className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-primary truncate pl-2">
                        {p ? formatPrice(p.priceCents * line.quantity, p.currency) : "—"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#E8E8ED] bg-[#F9F9FB] p-5">
            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827]">
                  {formatPrice(subtotal, lines[0]?.product?.currency ?? "usd")}
                </span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between border-t border-[#E8E8ED] pt-3 font-bold text-base">
                <span className="text-[#111827]">Total</span>
                <span className="text-primary">
                  {formatPrice(subtotal, lines[0]?.product?.currency ?? "usd")}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="btn btn-outline w-full rounded-xl bg-white text-[#111827] border-[#E8E8ED] hover:bg-[#F5F5F7] hover:border-[#D1D1D6] shadow-sm"
              >
                View Cart
              </Link>

              <Show when="signed-in">
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkoutLoading}
                  className="btn btn-primary w-full gap-2 rounded-xl shadow-sm"
                >
                  {checkoutLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <LockIcon className="size-4" aria-hidden />
                  )}
                  Checkout ({itemCount})
                </button>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-primary w-full rounded-xl shadow-sm">
                    Sign in to checkout
                  </button>
                </SignInButton>
              </Show>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
