import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Wishlist store — persisted to localStorage as "SenpaiMart-wishlist".
 * Internally uses a plain array (serialisable) but exposes Set-like helpers.
 */
export const useWishlist = create(
  persist(
    (set, get) => ({
      /** Array of product IDs that are wishlisted */
      ids: [],

      /** Toggle a product in/out of the wishlist */
      toggleItem(productId) {
        const ids = get().ids;
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
        } else {
          set({ ids: [...ids, productId] });
        }
      },

      /** Returns true if the product is currently wishlisted */
      isWishlisted(productId) {
        return get().ids.includes(productId);
      },

      /** Number of wishlisted items */
      count() {
        return get().ids.length;
      },

      /** Clear all wishlisted items */
      clear() {
        set({ ids: [] });
      },
    }),
    { name: "SenpaiMart-wishlist" },
  ),
);
