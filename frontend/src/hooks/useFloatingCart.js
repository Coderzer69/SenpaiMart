import { useQuery } from "@tanstack/react-query";
import { useCart } from "../store/cart.js";
import { apiFetch } from "../lib/api.js";

export function useFloatingCart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);

  const { data, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiFetch("/api/products"),
    enabled: items.length > 0,
  });

  const products = data?.products ?? [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items.map((line) => ({
    line,
    product: byId.get(line.productId) ?? null,
  }));

  const subtotal = lines.reduce((sum, { line, product: p }) => {
    if (!p) return sum;
    return sum + p.priceCents * line.quantity;
  }, 0);

  const itemCount = items.reduce((n, line) => n + line.quantity, 0);

  return {
    items,
    lines,
    subtotal,
    itemCount,
    productsLoading,
    setQty,
    removeItem,
  };
}
