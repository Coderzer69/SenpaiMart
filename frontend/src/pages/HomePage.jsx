import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { CatalogProductCard } from "../components/CatalogProductCard.jsx";
import { CategoryIcons } from "../components/CategoryIcons.jsx";
import { FeatureCards } from "../components/FeatureCards.jsx";
import { HomeHero } from "../components/HomeHero.jsx";
import { PageError } from "../components/PageError.jsx";
import { useHomeCatalog } from "../hooks/useHomeCatalog.js";

function HomePage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const {
    products,
    categories,
    categoryChipsLoading,
    categoryFilter,
    error,
    loadingCategories,
    loadingList,
    setCategory,
  } = useHomeCatalog();

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((p) => {
      const haystack = `${p.name} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();
      return haystack.includes(searchQuery);
    });
  }, [products, searchQuery]);

  return (
    <div className="space-y-8">
      <HomeHero />

      <CategoryIcons
        categories={categories}
        loading={loadingCategories && categories.length === 0}
        activeCategory={categoryFilter}
        onSelect={setCategory}
      />

      <FeatureCards />

      <section id="catalog" className="scroll-mt-24">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-base-content md:text-2xl">
              {searchQuery ? "Search Results" : "Recommended For You"}
            </h2>
            {searchQuery ? (
              <p className="mt-1 text-sm text-muted">
                Showing matches for &ldquo;{searchQuery}&rdquo;
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                !categoryFilter
                  ? "bg-primary text-primary-content shadow-sm"
                  : "border border-base-300 bg-base-100 text-muted hover:text-base-content"
              }`}
              onClick={() => setCategory("")}
            >
              All
            </button>

            {categoryChipsLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="skeleton h-8 w-20 rounded-xl"
                    aria-hidden
                  />
                ))
              : categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                      categoryFilter === c
                        ? "bg-primary text-primary-content shadow-sm"
                        : "border border-base-300 bg-base-100 text-muted hover:text-base-content"
                    }`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
          </div>
        </div>

        {loadingList ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i}>
                <div className="skeleton aspect-[4/5] w-full rounded-2xl" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <PageError message="We couldn't load products. Please try again in a moment." />
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-base-300 bg-base-100 py-16 text-center text-muted">
            {searchQuery
              ? "No products match your search."
              : "No products in this category yet."}
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <CatalogProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default HomePage;
