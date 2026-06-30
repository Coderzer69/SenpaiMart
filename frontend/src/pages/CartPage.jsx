import {
  HeadphonesIcon,
  LockIcon,
  LogInIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import useCartPage from "../hooks/useCartPage";
import EmptyCart from "../components/EmptyCart";
import { CartSkeleton } from "../components/LoadingSkeletons";
import { PageError } from "../components/PageError";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl";
import { Link } from "react-router";
import { formatPrice } from "../utils/format";
import { Show, SignInButton } from "@clerk/react";

function CartPage() {
  const {
    checkout,
    checkoutLoading,
    items,
    lines,
    productsError,
    productsLoading,
    removeItem,
    setQty,
    subtotal,
  } = useCartPage();

  return (
    <div className="mx-auto max-w-4xl text-left">
      <h1 className="mb-8 flex items-center gap-3 text-2xl font-bold text-base-content md:text-3xl">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingCartIcon className="size-5" aria-hidden />
        </span>
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : productsLoading ? (
        <CartSkeleton lines={items.length} />
      ) : productsError ? (
        <PageError message="Could not load product details. Refresh the page or try again shortly." />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4">
            {lines.map(({ line, product: p }) => (
              <li
                key={line.productId}
                className="flex gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-(--shadow-card)"
              >
                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-base-200">
                  {p?.imageUrl ? (
                    <img
                      src={imageKitOptimizedUrl(
                        p.imageUrl,
                        IK_PRESETS.cartThumb,
                      )}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {p ? (
                        <Link
                          to={`/product/${p.slug}`}
                          className="hover:text-primary"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        "Unknown product"
                      )}
                    </div>
                    {p ? (
                      <p className="text-sm text-muted">
                        {formatPrice(p.priceCents, p.currency)} each
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-base-300 bg-base-200/50">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() =>
                            setQty(line.productId, line.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="size-4" aria-hidden />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() =>
                            setQty(
                              line.productId,
                              Math.min(99, line.quantity + 1),
                            )
                          }
                          disabled={line.quantity >= 99}
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="size-4" aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                        aria-label="Remove from cart"
                      >
                        <Trash2Icon className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-lg font-bold tabular-nums">
                    {p
                      ? formatPrice(p.priceCents * line.quantity, p.currency)
                      : "-"}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-base-300 bg-base-100 p-6 shadow-(--shadow-card)">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-base-content">
                  {formatPrice(subtotal, lines[0]?.product?.currency ?? "usd")}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between border-t border-base-300 pt-3 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(subtotal, lines[0]?.product?.currency ?? "usd")}
                </span>
              </div>
            </div>

            <Show when="signed-in">
              <button
                type="button"
                onClick={checkout}
                disabled={checkoutLoading}
                aria-busy={checkoutLoading}
                className="btn btn-primary mt-6 w-full gap-2 rounded-2xl shadow-md"
              >
                {checkoutLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <LockIcon className="size-4" aria-hidden />
                )}
                {checkoutLoading ? "Opening checkout…" : "Checkout securely"}
              </button>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="btn btn-outline btn-primary mt-6 w-full gap-2 rounded-2xl"
                >
                  <LogInIcon className="size-4" aria-hidden />
                  Sign in to checkout
                </button>
              </SignInButton>
            </Show>

            <p className="mt-4 flex items-start gap-2 text-xs text-muted">
              <HeadphonesIcon
                className="mt-0.5 size-3.5 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                After payment, open your order for{" "}
                <strong className="text-base-content">support chat</strong>.
              </span>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
