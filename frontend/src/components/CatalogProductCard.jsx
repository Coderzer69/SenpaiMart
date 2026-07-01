import { useCallback, useRef } from "react";
import { Link } from "react-router";
import { HeartIcon, ShoppingCartIcon, StarIcon } from "lucide-react";
import { formatPrice } from "../utils/format.js";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl.js";
import { useCart } from "../store/cart.js";
import { useWishlist } from "../store/wishlist.js";

function displayRating(productId) {
  const seed = String(productId)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return (4 + (seed % 10) / 10).toFixed(1);
}

function reviewCount(productId) {
  const seed = String(productId)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return 12 + (seed % 180);
}

export function CatalogProductCard({ product }) {
  const addItem = useCart((s) => s.addItem);
  const toggleItem = useWishlist((s) => s.toggleItem);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const heartRef = useRef(null);
  const rating = displayRating(product.id);
  const reviews = reviewCount(product.id);
  const showBadge = product.id.charCodeAt(0) % 3 === 0;

  const primaryImageUrl = product.images?.length > 0 
    ? product.images[0].url 
    : product.imageUrl;

  const handleHeartClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem(product.id);
      // Trigger pop animation
      const el = heartRef.current;
      if (!el) return;
      el.classList.remove("heart-pop");
      // Force reflow so the animation restarts if clicked quickly
      void el.offsetWidth;
      el.classList.add("heart-pop");
    },
    [product.id, toggleItem],
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-(--shadow-card) transition hover:-translate-y-1 hover:shadow-(--shadow-card-hover)">
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden"
      >
        <figure className="aspect-square bg-base-200">
          {primaryImageUrl ? (
            <img
              src={imageKitOptimizedUrl(
                primaryImageUrl,
                IK_PRESETS.catalogCard,
              )}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              No image
            </div>
          )}
        </figure>

        {showBadge ? (
          <span className="absolute left-3 top-3 rounded-xl bg-primary px-2.5 py-1 text-xs font-bold text-primary-content shadow-sm">
            Featured
          </span>
        ) : null}

        <button
          ref={heartRef}
          type="button"
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${
            wishlisted
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-base-100/90 text-muted hover:text-red-500"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleHeartClick}
        >
          <HeartIcon
            className={`size-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
            aria-hidden
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted">
          {product.category ?? "General"}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-base-content transition group-hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            <StarIcon className="size-3.5 fill-current" aria-hidden />
            <span className="text-xs font-semibold text-base-content">
              {rating}
            </span>
          </div>
          <span className="text-xs text-muted">({reviews})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold tabular-nums text-base-content">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="btn btn-primary btn-sm btn-square rounded-xl shadow-sm"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartIcon className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

