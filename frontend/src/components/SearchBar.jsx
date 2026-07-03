import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function SearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      className={`group flex w-full max-w-2xl items-center gap-0 overflow-hidden rounded-[18px] border border-base-300 bg-base-100/80 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:-translate-y-px focus-within:border-primary/40 focus-within:bg-base-100 focus-within:shadow-[0_8px_24px_-8px_rgba(255,107,74,0.15)] ${className}`}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, categories..."
        className="min-w-0 flex-1 bg-transparent px-5 py-2.5 text-[15px] text-base-content placeholder:text-muted outline-none"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="flex h-full shrink-0 items-center justify-center bg-primary px-5 py-2.5 text-primary-content transition-all duration-200 hover:bg-primary/90 active:scale-95"
        aria-label="Search"
      >
        <SearchIcon className="size-5 transition-transform duration-300 group-focus-within:scale-110" aria-hidden />
      </button>
    </form>
  );
}
