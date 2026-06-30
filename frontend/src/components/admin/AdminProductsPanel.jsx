import { useAdminProductsPage } from "../../hooks/useAdminProductsPage.js";
import { AdminProductsTableSkeleton } from "../LoadingSkeletons.jsx";
import { IK_PRESETS, imageKitOptimizedUrl } from "../../lib/imagekitUrl.js";
import {
  PackageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { formatPrice } from "../../utils/format.js";
import { AdminProductForm } from "../AdminProductForm.jsx";
import { useAdminShell } from "./AdminShellContext.jsx";

export function AdminProductsPanel() {
  const { searchQuery } = useAdminShell();
  const {
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products,
    isLoading,
    saveMutation,
    deleteMutation,
    getToken,
  } = useAdminProductsPage();

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q)
    );
  });

  function handleDeleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    deleteMutation.mutate(product.id);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your catalog — create, edit, and deactivate items.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[14px] bg-[#FF6B4A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <PlusIcon className="size-4" aria-hidden />
          Add product
        </button>
      </div>

      {isLoading ? (
        <AdminProductsTableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <th className="px-5 py-3">Preview</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Active</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-[#6B7280]"
                    >
                      {searchQuery.trim()
                        ? "No products match your search."
                        : "No products yet. Add your first product."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#E5E7EB]/80 transition hover:bg-[#F8FAFC]"
                    >
                      <td className="px-5 py-4">
                        <div className="relative size-14 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                          {p.imageUrl ? (
                            <img
                              src={imageKitOptimizedUrl(
                                p.imageUrl,
                                IK_PRESETS.adminThumb,
                              )}
                              alt=""
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <PackageIcon
                                className="size-5 text-[#6B7280]"
                                aria-hidden
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-[#111827]">
                        {p.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">
                          {p.category ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#6B7280]">
                        {p.slug}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-[#111827]">
                        {formatPrice(p.priceCents, p.currency)}
                      </td>
                      <td className="px-5 py-4">
                        {p.active ? (
                          <span className="inline-flex rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#E5E7EB] px-2.5 py-0.5 text-xs font-semibold text-[#6B7280]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                            onClick={() => {
                              setEditing(p);
                              setModalOpen(true);
                            }}
                          >
                            <PencilIcon className="size-3.5" aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#EF4444] transition hover:bg-[#EF4444]/10"
                            disabled={
                              deleteMutation.isPending &&
                              deleteMutation.variables === p.id
                            }
                            onClick={() => handleDeleteProduct(p)}
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === p.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Trash2Icon className="size-3.5" aria-hidden />
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

      <dialog className={`modal ${modalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-lg rounded-[18px] border border-[#E5E7EB]">
          <h3 className="text-lg font-bold text-[#111827]">
            {editing ? "Edit product" : "New product"}
          </h3>
          <AdminProductForm
            key={editing?.id ?? "new"}
            initial={editing}
            saving={saveMutation.isPending}
            error={saveMutation.isError}
            getToken={getToken}
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onSubmit={(body) => saveMutation.mutate({ body, id: editing?.id })}
          />
        </div>
        <button
          type="button"
          className="modal-backdrop bg-[#111827]/40"
          onClick={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          aria-label="Close dialog"
        />
      </dialog>
    </div>
  );
}
