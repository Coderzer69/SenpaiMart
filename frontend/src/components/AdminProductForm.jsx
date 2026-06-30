import { useState, useEffect } from "react";
import { AdminProductImageGallery } from "./admin/AdminProductImageGallery.jsx";
import { AdminProductVariants } from "./admin/AdminProductVariants.jsx";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl.js";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";

export function AdminProductForm({
  initial,
  saving,
  error,
  getToken,
  onCancel,
  onSubmit,
  allProducts,
  saveMutation,
  deleteMutation,
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceCents, setPriceCents] = useState(
    initial ? String(initial.priceCents / 100) : "",
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "usd");
  const [active, setActive] = useState(initial?.active ?? true);

  // Seed images array from legacy fields if it's empty but a legacy image exists
  const defaultImages = initial?.images?.length > 0
    ? initial.images
    : (initial?.imageUrl ? [{ url: initial.imageUrl, fileId: initial.imageKitFileId }] : []);

  const [images, setImages] = useState(defaultImages);

  const { data: brandsData } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => apiFetch("/api/admin/brands", { getToken }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiFetch("/api/admin/categories", { getToken }),
  });

  const brands = brandsData?.brands ?? [];
  const categoriesList = categoriesData?.categories ?? [];

  // When categoryId changes, automatically update the legacy category string for storefront compatibility
  useEffect(() => {
    if (categoryId) {
      const selected = categoriesList.find((c) => c.id === categoryId);
      if (selected) setCategory(selected.name);
    }
  }, [categoryId, categoriesList]);

  function handleSubmit(e) {
    e.preventDefault();
    const dollars = Number.parseFloat(priceCents);
    if (Number.isNaN(dollars) || dollars <= 0) return;

    const body = {
      slug: slug.trim(),
      name: name.trim(),
      category: category.trim() || "General",
      categoryId: categoryId || null,
      brandId: brandId || null,
      description: description.trim(),
      priceCents: Math.round(dollars * 100),
      currency: currency.trim().toLowerCase(),
      images: images,
      active,
    };

    if (initial) {
      const patch = {};
      if (body.name !== initial.name) patch.name = body.name;
      if (body.category !== (initial.category ?? "General"))
        patch.category = body.category;
      if (body.categoryId !== (initial.categoryId ?? null))
        patch.categoryId = body.categoryId;
      if (body.brandId !== (initial.brandId ?? null))
        patch.brandId = body.brandId;
      if (body.description !== initial.description)
        patch.description = body.description;
      if (body.priceCents !== initial.priceCents)
        patch.priceCents = body.priceCents;
      if (body.currency !== initial.currency) patch.currency = body.currency;

      // Simple JSON stringify comparison to see if images array changed
      if (JSON.stringify(body.images) !== JSON.stringify(defaultImages)) {
        patch.images = body.images;
      }

      if (body.active !== initial.active) patch.active = body.active;
      if (Object.keys(patch).length === 0) {
        onCancel();
        return;
      }
      onSubmit(patch);
    } else {
      onSubmit(body);
    }
  }

  return (
    <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="form-control w-full">
        <span className="label-text">Slug</span>
        <input
          className="input input-bordered w-full"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          disabled={Boolean(initial)}
        />
      </label>

      <label className="form-control w-full">
        <span className="label-text">Name</span>
        <input
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="form-control w-full">
          <span className="label-text">Brand</span>
          <select
            className="select select-bordered w-full"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">— None —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control w-full">
          <span className="label-text">Linked Category</span>
          <select
            className="select select-bordered w-full"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— None —</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-control w-full">
        <span className="label-text">Legacy Category (Storefront String)</span>
        <input
          className="input input-bordered w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Audio, Workspace"
          required
        />
      </label>

      <label className="form-control w-full">
        <span className="label-text">Description</span>
        <textarea
          className="textarea textarea-bordered h-24 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="form-control">
          <span className="label-text">Price (USD)</span>
          <input
            className="input input-bordered"
            type="number"
            step="0.01"
            min="0.01"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            required
          />
        </label>

        <label className="form-control">
          <span className="label-text">Currency</span>
          <input
            className="input input-bordered"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-control w-full">
        <span className="label-text mb-2 font-semibold">Image Gallery</span>
        <AdminProductImageGallery
          images={images}
          onChange={setImages}
          getToken={getToken}
          slug={slug}
        />
      </div>

      <label className="label cursor-pointer justify-start gap-3 mt-2">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          disabled={saving}
        />
        <span className="label-text">Active (visible in store)</span>
      </label>

      {/* Render Variants Configurator only if editing an existing product */}
      {initial && allProducts && (
        <AdminProductVariants
          baseProduct={initial}
          allProducts={allProducts}
          saveMutation={saveMutation}
          deleteMutation={deleteMutation}
        />
      )}

      {error ? (
        <div className="alert alert-error mt-2 rounded-xl py-2 text-sm shadow-sm">
          Save failed (check slug unique &amp; fields).
        </div>
      ) : null}

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
