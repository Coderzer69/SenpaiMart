import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  Trash2Icon,
  BuildingIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { AdminBrandFormModal } from "./AdminBrandFormModal.jsx";

export function AdminBrandsPanel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'products' | 'createdAt'
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => apiFetch("/api/admin/brands", { getToken }),
  });

  const brands = data?.brands ?? [];

  const filtered = useMemo(() => {
    let result = brands.filter((b) => {
      if (filterStatus === "active" && !b.active) return false;
      if (filterStatus === "inactive" && b.active) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      let valA, valB;
      if (sortBy === "products") {
        valA = a.productCount;
        valB = b.productCount;
      } else if (sortBy === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [brands, searchQuery, filterStatus, sortBy, sortDir]);

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/api/admin/brands/${id}`, { getToken, method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries(["admin-brands"]),
  });

  const saveMutation = useMutation({
    mutationFn: ({ body, id }) =>
      id
        ? apiFetch(`/api/admin/brands/${id}`, { getToken, method: "PATCH", body })
        : apiFetch("/api/admin/brands", { getToken, method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-brands"]);
      setModalOpen(false);
      setEditing(null);
    },
  });

  function handleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function handleDelete(brand) {
    if (!window.confirm(`Delete brand "${brand.name}"? Products linked to this brand will be unlinked.`)) return;
    deleteMutation.mutate(brand.id);
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
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Brands</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your brand catalog — logos, descriptions, and product associations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-[14px] bg-[#FF6B4A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90"
        >
          <PlusIcon className="size-4" />
          Add Brand
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2 pl-9 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [col, dir] = e.target.value.split("-");
            setSortBy(col);
            setSortDir(dir);
          }}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="products-desc">Most Products</option>
          <option value="products-asc">Fewest Products</option>
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex flex-wrap gap-3">
        {[
          { label: "Total", value: brands.length, color: "text-[#111827]" },
          { label: "Active", value: brands.filter((b) => b.active).length, color: "text-[#16A34A]" },
          { label: "Inactive", value: brands.filter((b) => !b.active).length, color: "text-[#6B7280]" },
          { label: "With Products", value: brands.filter((b) => b.productCount > 0).length, color: "text-[#FF6B4A]" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium">
            <span className="text-[#6B7280]">{stat.label}:</span>
            <span className={`font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#E5E7EB]" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <th className="px-5 py-3">Brand</th>
                  <th className="cursor-pointer px-4 py-3 select-none hover:text-[#111827]" onClick={() => handleSort("name")}>
                    Name {renderSortIcon("name")}
                  </th>
                  <th className="px-5 py-3">Description</th>
                  <th className="cursor-pointer px-4 py-3 select-none text-right hover:text-[#111827]" onClick={() => handleSort("products")}>
                    Products {renderSortIcon("products")}
                  </th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[#6B7280]">
                      {searchQuery.trim() ? "No brands match your search." : "No brands yet. Add your first brand."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((brand) => (
                    <tr
                      key={brand.id}
                      className="border-b border-[#E5E7EB]/80 transition hover:bg-[#F8FAFC]"
                    >
                      {/* Logo */}
                      <td className="px-5 py-4">
                        <div className="size-12 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center shrink-0">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt="" className="size-full object-contain p-1" loading="lazy" />
                          ) : (
                            <BuildingIcon className="size-5 text-[#9CA3AF]" />
                          )}
                        </div>
                      </td>
                      {/* Name + slug */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#111827]">{brand.name}</p>
                        <p className="text-xs text-[#9CA3AF] font-mono">{brand.slug}</p>
                      </td>
                      {/* Description */}
                      <td className="px-5 py-4 max-w-[260px]">
                        <p className="text-[#6B7280] text-xs line-clamp-2">
                          {brand.description || <span className="italic text-[#D1D5DB]">No description</span>}
                        </p>
                      </td>
                      {/* Product count */}
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-semibold text-[#374151]">
                          {brand.productCount}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        {brand.active ? (
                          <span className="inline-flex rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#E5E7EB] px-2.5 py-0.5 text-xs font-semibold text-[#6B7280]">
                            Inactive
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditing(brand); setModalOpen(true); }}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(brand)}
                            disabled={deleteMutation.isPending && deleteMutation.variables === brand.id}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#EF4444] transition hover:bg-[#EF4444]/10"
                          >
                            {deleteMutation.isPending && deleteMutation.variables === brand.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Trash2Icon className="size-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <AdminBrandFormModal
          isOpen={modalOpen}
          editing={editing}
          saving={saveMutation.isPending}
          error={saveMutation.isError}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSubmit={(body) => saveMutation.mutate({ body, id: editing?.id })}
        />
      )}
    </div>
  );
}
