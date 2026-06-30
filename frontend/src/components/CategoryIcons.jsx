import { categoryIconFor } from "./Sidebar.jsx";

const palette = [
  "bg-orange-50 text-primary",
  "bg-indigo-50 text-secondary",
  "bg-emerald-50 text-emerald-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-rose-50 text-rose-500",
  "bg-amber-50 text-amber-600",
];

export function CategoryIcons({
  categories,
  loading,
  activeCategory,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2">
            <div className="skeleton size-16 rounded-full" />
            <div className="skeleton h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const allCategories = ["All", ...categories];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {allCategories.map((cat, i) => {
        const Icon =
          cat === "All" ? categoryIconFor("all") : categoryIconFor(cat);
        const isActive =
          cat === "All" ? !activeCategory : activeCategory === cat;
        const color = palette[i % palette.length];

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat === "All" ? "" : cat)}
            className={`group flex shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-1 transition ${
              isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
            }`}
          >
            <span
              className={`flex size-16 items-center justify-center rounded-full transition ${color} ${
                isActive
                  ? "ring-2 ring-primary ring-offset-2"
                  : "group-hover:scale-105"
              }`}
            >
              <Icon className="size-7" aria-hidden />
            </span>
            <span
              className={`max-w-[4.5rem] truncate text-xs font-medium ${
                isActive ? "text-primary" : "text-muted"
              }`}
            >
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
