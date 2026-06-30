import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { useWishlist } from "../store/wishlist.js";

/**
 * Fetches all products and returns only those that are currently in the wishlist.
 * Automatically stays in sync with the wishlist store.
 */
export function useWishlistPage() {
  const wishlistIds = useWishlist((s) => s.ids);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiFetch("/api/products"),
    // Keep data fresh in the background
    staleTime: 30_000,
  });

  const allProducts = productsData?.products ?? [];

  // Filter to only wishlisted products, preserving wishlist order
  const products = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  return { products, isLoading, wishlistIds };
}
