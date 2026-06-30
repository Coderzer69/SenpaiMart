import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function SearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    const next = new URLSearchParams(searchParams);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    navigate({ pathname: "/", search: next.toString() ? `?${next}` : "" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full max-w-2xl items-center gap-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 ${className}`}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, categories..."
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-base-content placeholder:text-muted outline-none"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="flex h-full shrink-0 items-center justify-center bg-primary px-4 py-2.5 text-primary-content transition hover:bg-primary/90"
        aria-label="Search"
      >
        <SearchIcon className="size-5" aria-hidden />
      </button>
    </form>
  );
}
