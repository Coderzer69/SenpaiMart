import { Link } from "react-router";
import { HeartIcon, ShoppingBagIcon } from "lucide-react";
import { CatalogProductCard } from "../components/CatalogProductCard.jsx";
import { useWishlistPage } from "../hooks/useWishlistPage.js";
import { useWishlist } from "../store/wishlist.js";

function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      {/* Animated empty heart */}
      <div className="relative flex size-24 items-center justify-center rounded-full bg-red-50">
        <HeartIcon
          className="size-12 text-red-200"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-base-content">
          Your wishlist is empty
        </h2>
        <p className="max-w-xs text-sm text-muted">
          Tap the{" "}
          <HeartIcon
            className="mb-0.5 inline size-3.5 text-muted"
            aria-hidden
          />{" "}
          on any product to save it here for later.
        </p>
      </div>
      <Link
        to="/"
        className="btn btn-primary gap-2 rounded-2xl px-8 shadow-md"
      >
        <ShoppingBagIcon className="size-4" aria-hidden />
        Browse products
      </Link>
    </div>
  );
}

function WishlistPage() {
  const { products, isLoading } = useWishlistPage();
  const wishlistCount = useWishlist((s) => s.ids.length);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-base-content md:text-3xl">
            <HeartIcon
              className={`size-7 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : "text-muted"}`}
              aria-hidden
            />
            My Wishlist
          </h1>
          {wishlistCount > 0 ? (
            <p className="mt-1 text-sm text-muted">
              {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
            </p>
          ) : null}
        </div>

        {wishlistCount > 0 ? (
          <Link
            to="/"
            className="btn btn-ghost btn-sm rounded-xl border border-base-300"
          >
            Continue shopping
          </Link>
        ) : null}
      </div>

      {/* Product grid */}
      {isLoading ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li key={i}>
              <div className="skeleton h-[330px] w-full rounded-2xl sm:h-[358px] lg:h-[368px]" />
            </li>
          ))}
        </ul>
      ) : products.length === 0 ? (
        <WishlistEmptyState />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <CatalogProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WishlistPage;
