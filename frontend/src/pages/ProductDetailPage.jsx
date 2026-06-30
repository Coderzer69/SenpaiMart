import { Link } from "react-router";
import { ProductPageSkeleton } from "../components/LoadingSkeletons";
import { PageError } from "../components/PageError";
import { useProductPage } from "../hooks/useProductPage";
import {
  IK_PRESETS,
  imageKitOptimizedUrl,
  imageKitWatermarkedUrl,
} from "../lib/imagekitUrl";
import { useCart } from "../store/cart";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  ShoppingCartIcon,
  StarIcon,
} from "lucide-react";
import { formatPrice } from "../utils/format";

const HIGHLIGHTS = [
  "Secure checkout",
  "Support from your order after payment",
  "Specs listed for this catalog",
];

function ProductDetailPage() {
  const addItem = useCart((s) => s.addItem);
  const { product, isLoading, error } = useProductPage();

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <PageError
        message="Product not found."
        action={{ to: "/", label: "Back to shop" }}
      />
    );
  }

  const p = product;
  const category = p.category ?? "General";
  const watermarkedFullUrl = p.imageUrl
    ? imageKitWatermarkedUrl(p.imageUrl, IK_PRESETS.productHero)
    : null;

  return (
    <div className="max-w-5xl">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/" className="hover:text-primary">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/?category=${encodeURIComponent(category)}`}
          className="hover:text-primary"
        >
          {category}
        </Link>
        <span>/</span>
        <span className="text-base-content">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-(--shadow-card)">
          <figure className="aspect-square bg-base-200">
            {p.imageUrl ? (
              <img
                src={imageKitOptimizedUrl(p.imageUrl, IK_PRESETS.productHero)}
                alt=""
                className="h-full w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="h-full w-full" />
            )}
          </figure>

          {watermarkedFullUrl ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-base-300 px-4 py-3">
              <a
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                href={watermarkedFullUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden />
                Open full size
              </a>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col text-left">
          <span className="inline-flex w-fit rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {category}
          </span>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-base-content md:text-3xl">
            {p.name}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon
                  key={i}
                  className={`size-4 ${i <= 4 ? "fill-current" : ""}`}
                  aria-hidden
                />
              ))}
            </div>
            <span className="text-sm text-muted">Customer favorite</span>
          </div>

          <p className="mt-4 text-3xl font-bold tabular-nums text-primary">
            {formatPrice(p.priceCents, p.currency)}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
            {p.description}
          </p>

          <ul className="mt-6 space-y-2 rounded-2xl border border-base-300 bg-base-200/40 p-4">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 text-sm text-base-content/80"
              >
                <CheckIcon
                  className="size-4 shrink-0 text-success"
                  aria-hidden
                />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addItem(p.id)}
              className="btn btn-primary gap-2 rounded-2xl px-8 shadow-md"
            >
              <ShoppingCartIcon className="size-5" aria-hidden />
              Add to cart
            </button>

            <Link
              to="/"
              className="btn btn-ghost gap-2 rounded-2xl border border-base-300 px-6"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
