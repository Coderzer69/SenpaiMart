import { useState, useEffect } from "react";
import { XIcon, FolderIcon } from "lucide-react";

function generateSlug(name) {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function AdminCategoryFormModal({
  isOpen,
  editing,
  allCategories,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    parentId: "",
    active: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: editing.name ?? "",
        slug: editing.slug ?? "",
        description: editing.description ?? "",
        imageUrl: editing.imageUrl ?? "",
        parentId: editing.parentId ?? "",
        active: editing.active ?? true,
      });
      setSlugTouched(true);
    } else {
      setForm({ name: "", slug: "", description: "", imageUrl: "", parentId: "", active: true });
      setSlugTouched(false);
    }
  }, [editing, isOpen]);

  function handleNameChange(val) {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: slugTouched ? prev.slug : generateSlug(val),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      slug: form.slug,
      description: form.description,
      imageUrl: form.imageUrl || null,
      parentId: form.parentId || null,
      active: form.active,
    });
  }

  if (!isOpen) return null;

  // Prevent a category from being its own parent
  const parentOptions = allCategories.filter((c) => c.id !== editing?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#111827]">
            {editing ? "Edit Category" : "New Category"}
          </h2>
          {!saving && (
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#F3F4F6] text-[#6B7280]">
              <XIcon className="size-5" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[calc(85vh-70px)]">
          {/* Image preview */}
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <FolderIcon className="size-7 text-[#D1D5DB]" />
              )}
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-[#374151]">Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/category.png"
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#374151]">
              Category Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Electronics"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#374151]">
              Slug <span className="text-[#EF4444]">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. electronics"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((p) => ({ ...p, slug: e.target.value }));
              }}
              className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 font-mono text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
            />
          </div>

          {/* Parent category */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#374151]">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
              className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
            >
              <option value="">— None (Root Category) —</option>
              {parentOptions
                .filter((c) => !c.parentId) // Only show root categories as parents for simplicity
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Leave empty to create a top-level category.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#374151]">Description</label>
            <textarea
              rows={3}
              placeholder="A short description of this category..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full resize-none rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Active</p>
              <p className="text-xs text-[#6B7280]">Inactive categories are hidden from the storefront.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.active}
              onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                form.active ? "bg-[#FF6B4A]" : "bg-[#D1D5DB]"
              }`}
            >
              <span
                className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                  form.active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-[#EF4444]">
              Failed to save. Check your slug is unique and all required fields are filled.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90 disabled:opacity-60"
            >
              {saving && <span className="loading loading-spinner loading-xs" />}
              {editing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
