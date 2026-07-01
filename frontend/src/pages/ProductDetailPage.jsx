import { Link } from "react-router";
import { useCallback, useRef, useState, useMemo } from "react";
import { ProductPageSkeleton } from "../components/LoadingSkeletons";
import { PageError } from "../components/PageError";
import { useProductPage } from "../hooks/useProductPage";
import {
  IK_PRESETS,
  imageKitOptimizedUrl,
  imageKitWatermarkedUrl,
} from "../lib/imagekitUrl";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  HeartIcon,
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
  const toggleItem = useWishlist((s) => s.toggleItem);
  const { product, variants, isLoading, error } = useProductPage();
  const wishlisted = useWishlist((s) =>
    product ? s.ids.includes(product.id) : false,
  );
  const heartRef = useRef(null);

  const handleHeartClick = useCallback(() => {
    if (!product) return;
    toggleItem(product.id);
    const el = heartRef.current;
    if (!el) return;
    el.classList.remove("heart-pop");
    void el.offsetWidth;
    el.classList.add("heart-pop");
  }, [product, toggleItem]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hasVariants = variants && variants.length > 0;
  
  const attributeNames = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(variants.flatMap(v => v.variantAttributes.map(a => a.name)))];
  }, [hasVariants, variants]);

  const [selectedOptions, setSelectedOptions] = useState(() => {
    if (hasVariants) {
      const defaults = {};
      const availableVariant = variants.find(v => v.stockQuantity > 0) || variants[0];
      availableVariant.variantAttributes.forEach(a => defaults[a.name] = a.value);
      return defaults;
    }
    return {};
  });

  const activeProduct = useMemo(() => {
    if (!hasVariants) return product;
    const match = variants.find(v => 
      v.variantAttributes.every(a => selectedOptions[a.name] === a.value)
    );
    return match || variants[0];
  }, [hasVariants, variants, product, selectedOptions]);

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <PageError
        message="Product not found."
        action={{ to: "/", label: "Back to shop" }}
      />
    );
  }

  const p = activeProduct;
  const category = product.category ?? "General";
  
  // Normalize gallery array from new `images` column or legacy `imageUrl`
  const gallery = p.images?.length > 0 
    ? p.images 
    : (p.imageUrl ? [{ url: p.imageUrl }] : (product.images?.length > 0 ? product.images : (product.imageUrl ? [{ url: product.imageUrl }] : [])));
    
  const currentImage = gallery[activeImageIndex]?.url;
  
  const watermarkedFullUrl = currentImage
    ? imageKitWatermarkedUrl(currentImage, IK_PRESETS.productHero)
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
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-(--shadow-card)">
            <figure className="aspect-square bg-base-200">
              {currentImage ? (
                <img
                  src={imageKitOptimizedUrl(currentImage, IK_PRESETS.productHero)}
                  alt=""
                  className="h-full w-full object-cover transition-opacity duration-300"
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

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative size-16 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImageIndex === idx 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imageKitOptimizedUrl(img.url, IK_PRESETS.formPreview)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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

          <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
            <p>SKU: <span className="font-medium text-base-content">{p.slug}</span></p>
            <p>Availability: <span className={`font-medium ${p.stockQuantity > 0 ? "text-success" : "text-error"}`}>
              {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}
            </span></p>
          </div>
          
          {hasVariants && (
            <div className="mt-6 flex flex-col gap-5 border-t border-base-300 pt-5">
              {attributeNames.map(attrName => {
                // Get all unique values for this attribute across all variants
                const uniqueValues = [...new Set(variants.map(v => 
                  v.variantAttributes.find(a => a.name === attrName)?.value
                ).filter(Boolean))];
                
                return (
                  <div key={attrName}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{attrName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueValues.map(val => {
                        const isSelected = selectedOptions[attrName] === val;
                        // Find if this option combination is in stock
                        const nextOptions = { ...selectedOptions, [attrName]: val };
                        const matchingVariant = variants.find(v => 
                          v.variantAttributes.every(a => nextOptions[a.name] === a.value)
                        );
                        const isOutOfStock = matchingVariant ? matchingVariant.stockQuantity <= 0 : true;

                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [attrName]: val }))}
                            className={`min-w-12 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                              isSelected 
                                ? "border-primary bg-primary text-primary-content shadow-md" 
                                : isOutOfStock
                                  ? "border-base-200 bg-base-100 text-muted opacity-50 cursor-not-allowed"
                                  : "border-base-300 bg-base-100 text-base-content hover:border-primary/50 hover:bg-base-200"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
            {product.description}
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
              disabled={p.stockQuantity <= 0}
              onClick={() => addItem(p.id)}
              className="btn btn-primary gap-2 rounded-2xl px-8 shadow-md disabled:bg-base-300 disabled:text-muted disabled:shadow-none"
            >
              <ShoppingCartIcon className="size-5" aria-hidden />
              {p.stockQuantity > 0 ? "Add to cart" : "Out of stock"}
            </button>

            <button
              ref={heartRef}
              type="button"
              onClick={handleHeartClick}
              className={`btn gap-2 rounded-2xl border px-6 transition-colors ${
                wishlisted
                  ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                  : "btn-ghost border-base-300 hover:text-red-500"
              }`}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon
                className={`size-4 transition-colors ${
                  wishlisted ? "fill-red-500 text-red-500" : ""
                }`}
                aria-hidden
              />
              {wishlisted ? "Wishlisted" : "Wishlist"}
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
