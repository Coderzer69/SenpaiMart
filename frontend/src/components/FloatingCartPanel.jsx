import { Show, SignInButton, useAuth } from "@clerk/react";
import {
  LockIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useState } from "react";
import { useFloatingCart } from "../hooks/useFloatingCart.js";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl.js";
import { formatPrice } from "../utils/format.js";
import { apiFetch } from "../lib/api.js";

export function FloatingCartPanel() {
  const location = useLocation();
  const { getToken } = useAuth();
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

  const hiddenRoutes = ["/cart", "/admin", "/checkout/return"];
  const hide =
    hiddenRoutes.some((p) => location.pathname.startsWith(p)) ||
    location.pathname.includes("/call");

  if (hide) return null;

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
    <aside className="hidden w-80 shrink-0 xl:block 2xl:w-88">
      <div className="sticky top-[4.5rem] max-h-[calc(100svh-5.5rem)] overflow-y-auto rounded-2xl border border-base-300 bg-base-100 p-5 shadow-(--shadow-card)">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-base-content">
            <ShoppingCartIcon className="size-5 text-primary" aria-hidden />
            My Cart
            {itemCount > 0 ? (
              <span className="badge badge-primary badge-sm font-sans">
                {itemCount}
              </span>
            ) : null}
          </h2>
          <Link
            to="/cart"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 px-4 py-8 text-center">
            <ShoppingCartIcon
              className="mx-auto size-10 text-base-content/25"
              aria-hidden
            />
            <p className="mt-3 text-sm font-medium text-base-content">
              Your cart is empty
            </p>
            <p className="mt-1 text-xs text-muted">
              Add items from the catalog
            </p>
            <Link to="/#catalog" className="btn btn-primary btn-sm mt-4">
              Browse products
            </Link>
          </div>
        ) : productsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {lines.map(({ line, product: p }) => (
                <li
                  key={line.productId}
                  className="flex gap-3 rounded-2xl border border-base-300 bg-base-200/30 p-2.5"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-base-300">
                    {p?.imageUrl ? (
                      <img
                        src={imageKitOptimizedUrl(
                          p.imageUrl,
                          IK_PRESETS.cartThumb,
                        )}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p?.name ?? "Product"}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {p
                        ? formatPrice(p.priceCents * line.quantity, p.currency)
                        : "—"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square min-h-0 h-6 w-6"
                        onClick={() =>
                          setQty(line.productId, line.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="min-w-5 text-center text-xs tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square min-h-0 h-6 w-6"
                        onClick={() =>
                          setQty(
                            line.productId,
                            Math.min(99, line.quantity + 1),
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square ml-auto min-h-0 h-6 w-6 text-error"
                        onClick={() => removeItem(line.productId)}
                        aria-label="Remove"
                      >
                        <Trash2Icon className="size-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-base-300 pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-base-content">
                  {formatPrice(
                    subtotal,
                    lines[0]?.product?.currency ?? "usd",
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between border-t border-base-300 pt-2 font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(
                    subtotal,
                    lines[0]?.product?.currency ?? "usd",
                  )}
                </span>
              </div>
            </div>

            <Show when="signed-in">
              <button
                type="button"
                onClick={checkout}
                disabled={checkoutLoading}
                className="btn btn-primary mt-4 w-full gap-2 shadow-md"
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
                <button type="button" className="btn btn-primary mt-4 w-full">
                  Sign in to checkout
                </button>
              </SignInButton>
            </Show>
          </>
        )}
      </div>
    </aside>
  );
}
