import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  Trash2Icon,
  FolderIcon,
  FolderOpenIcon,
  ArrowUpDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { AdminCategoryFormModal } from "./AdminCategoryFormModal.jsx";

export function AdminCategoriesPanel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterParent, setFilterParent] = useState("all"); // 'all' | 'root' | 'child'
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiFetch("/api/admin/categories", { getToken }),
  });

  const allCategories = data?.categories ?? [];

  // Build a name-map for parent lookup
  const nameMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c.name])),
    [allCategories],
  );

  const filtered = useMemo(() => {
    let result = allCategories.filter((c) => {
      if (filterStatus === "active" && !c.active) return false;
      if (filterStatus === "inactive" && c.active) return false;
      if (filterParent === "root" && c.parentId) return false;
      if (filterParent === "child" && !c.parentId) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      let va, vb;
      if (sortBy === "products") {
        va = a.productCount;
        vb = b.productCount;
      } else if (sortBy === "createdAt") {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      } else {
        va = a.name.toLowerCase();
        vb = b.name.toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allCategories, search, filterStatus, filterParent, sortBy, sortDir]);

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/api/admin/categories/${id}`, { getToken, method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setSelectedIds(new Set());
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) =>
      apiFetch("/api/admin/categories/bulk-delete", {
        getToken,
        method: "POST",
        body: { ids: [...ids] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setSelectedIds(new Set());
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ body, id }) =>
      id
        ? apiFetch(`/api/admin/categories/${id}`, { getToken, method: "PATCH", body })
        : apiFetch("/api/admin/categories", { getToken, method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setModalOpen(false);
      setEditing(null);
    },
  });

  function handleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  }

  function handleDelete(cat) {
    if (!window.confirm(`Delete category "${cat.name}"? Its child categories will be re-parented.`)) return;
    deleteMutation.mutate(cat.id);
  }

  function handleBulkDelete() {
    if (!window.confirm(`Delete ${selectedIds.size} selected categories? Their children will be re-parented.`)) return;
    bulkDeleteMutation.mutate(selectedIds);
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  }

  const renderSortIcon = (col) =>
    sortBy === col ? (
      <span className="ml-1 text-[#FF6B4A]">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <ArrowUpDownIcon className="ml-1 inline-block size-3 text-[#9CA3AF]" />
    );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Categories</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your category hierarchy — parent categories, subcategories, images, and slugs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-[14px] bg-[#FF6B4A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90"
        >
          <PlusIcon className="size-4" />
          Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF6B4A]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filterParent}
          onChange={(e) => setFilterParent(e.target.value)}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF6B4A]"
        >
          <option value="all">All Levels</option>
          <option value="root">Root Only</option>
          <option value="child">Subcategories Only</option>
        </select>

        <select
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [col, dir] = e.target.value.split("-");
            setSortBy(col);
            setSortDir(dir);
          }}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF6B4A]"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="products-desc">Most Products</option>
          <option value="products-asc">Fewest Products</option>
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
        </select>
      </div>

      {/* Stats bar + Bulk actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total", value: allCategories.length, color: "text-[#111827]" },
            { label: "Root", value: allCategories.filter((c) => !c.parentId).length, color: "text-[#3B82F6]" },
            { label: "Subcategories", value: allCategories.filter((c) => !!c.parentId).length, color: "text-[#8B5CF6]" },
            { label: "Active", value: allCategories.filter((c) => c.active).length, color: "text-[#16A34A]" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium">
              <span className="text-[#6B7280]">{s.label}:</span>
              <span className={`font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#EF4444]/90 disabled:opacity-60"
          >
            {bulkDeleteMutation.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            Delete {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-xl bg-[#E5E7EB]" />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-[#D1D5DB]"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">Image</th>
                  <th className="cursor-pointer px-4 py-3 select-none hover:text-[#111827]" onClick={() => handleSort("name")}>
                    Name {renderSortIcon("name")}
                  </th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="cursor-pointer px-4 py-3 select-none text-right hover:text-[#111827]" onClick={() => handleSort("products")}>
                    Products {renderSortIcon("products")}
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#6B7280]">
                      {search.trim() ? "No categories match your search." : "No categories yet. Add your first category."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => {
                    const isChild = !!cat.parentId;
                    const parentName = cat.parentId ? nameMap.get(cat.parentId) : null;
                    return (
                      <tr key={cat.id} className={`border-b border-[#E5E7EB]/80 transition hover:bg-[#F8FAFC] ${selectedIds.has(cat.id) ? "bg-[#FFF5F3]" : ""}`}>
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-[#D1D5DB]"
                            checked={selectedIds.has(cat.id)}
                            onChange={() => toggleSelect(cat.id)}
                          />
                        </td>
                        {/* Image */}
                        <td className="px-4 py-4">
                          <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center">
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                            ) : isChild ? (
                              <FolderOpenIcon className="size-5 text-[#9CA3AF]" />
                            ) : (
                              <FolderIcon className="size-5 text-[#9CA3AF]" />
                            )}
                          </div>
                        </td>
                        {/* Name + slug */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {isChild && <ChevronRightIcon className="size-3.5 shrink-0 text-[#D1D5DB]" />}
                            <div>
                              <p className="font-semibold text-[#111827]">{cat.name}</p>
                              <p className="text-xs text-[#9CA3AF] font-mono">{cat.slug}</p>
                            </div>
                          </div>
                        </td>
                        {/* Parent */}
                        <td className="px-4 py-4">
                          {parentName ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
                              <FolderIcon className="size-3" />
                              {parentName}
                            </span>
                          ) : (
                            <span className="text-xs text-[#D1D5DB]">Root</span>
                          )}
                        </td>
                        {/* Product count */}
                        <td className="px-4 py-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-semibold text-[#374151]">
                            {cat.productCount}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          {cat.active ? (
                            <span className="inline-flex rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">Active</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-[#E5E7EB] px-2.5 py-0.5 text-xs font-semibold text-[#6B7280]">Inactive</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditing(cat); setModalOpen(true); }}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                            >
                              <PencilIcon className="size-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              disabled={deleteMutation.isPending && deleteMutation.variables === cat.id}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#EF4444] transition hover:bg-[#EF4444]/10"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === cat.id ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <Trash2Icon className="size-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <AdminCategoryFormModal
          isOpen={modalOpen}
          editing={editing}
          allCategories={allCategories}
          saving={saveMutation.isPending}
          error={saveMutation.isError}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSubmit={(body) => saveMutation.mutate({ body, id: editing?.id })}
        />
      )}
    </div>
  );
}
