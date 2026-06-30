import { useState, useMemo } from "react";
import { PlusIcon, Trash2Icon, RefreshCwIcon, SaveIcon } from "lucide-react";
import { formatPrice } from "../../utils/format.js";

export function AdminProductVariants({ 
  baseProduct, 
  allProducts, // Full list to find existing variants
  saveMutation, 
  deleteMutation
}) {
  const [attributes, setAttributes] = useState([
    { name: "Size", values: ["S", "M", "L"] }
  ]);
  const [generating, setGenerating] = useState(false);

  // Find existing variants for this base product
  const existingVariants = useMemo(() => {
    return allProducts.filter(p => p.parentProductId === baseProduct.id);
  }, [allProducts, baseProduct.id]);

  function handleAddAttribute() {
    setAttributes([...attributes, { name: "", values: [] }]);
  }

  function handleRemoveAttribute(index) {
    const newAttrs = [...attributes];
    newAttrs.splice(index, 1);
    setAttributes(newAttrs);
  }

  function handleAttributeNameChange(index, value) {
    const newAttrs = [...attributes];
    newAttrs[index].name = value;
    setAttributes(newAttrs);
  }

  function handleAttributeValuesChange(index, valueStr) {
    const newAttrs = [...attributes];
    newAttrs[index].values = valueStr.split(",").map(v => v.trim()).filter(v => v);
    setAttributes(newAttrs);
  }

  // Cartesian product generator
  function generateCombinations(attrs) {
    const validAttrs = attrs.filter(a => a.name && a.values.length > 0);
    if (validAttrs.length === 0) return [];

    let combos = [[]];
    for (const attr of validAttrs) {
      const nextCombos = [];
      for (const combo of combos) {
        for (const val of attr.values) {
          nextCombos.push([...combo, { name: attr.name, value: val }]);
        }
      }
      combos = nextCombos;
    }
    return combos;
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const combos = generateCombinations(attributes);
      
      for (const combo of combos) {
        // Check if this exact combination already exists
        const exists = existingVariants.some(v => {
          if (v.variantAttributes.length !== combo.length) return false;
          return combo.every(c => 
            v.variantAttributes.some(va => va.name === c.name && va.value === c.value)
          );
        });

        if (!exists) {
          // Generate a slug extension
          const slugExt = combo.map(c => c.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")).join("-");
          
          const payload = {
            name: `${baseProduct.name} - ${combo.map(c => c.value).join(" ")}`,
            slug: `${baseProduct.slug}-${slugExt}-${Math.random().toString(36).slice(2, 6)}`,
            category: baseProduct.category,
            categoryId: baseProduct.categoryId,
            brandId: baseProduct.brandId,
            description: baseProduct.description,
            priceCents: baseProduct.priceCents, // Copy base price
            currency: baseProduct.currency,
            images: baseProduct.images, // Copy base images
            parentProductId: baseProduct.id,
            variantAttributes: combo,
            active: true,
          };
          
          await saveMutation.mutateAsync({ body: payload });
        }
      }
    } catch (err) {
      console.error("Variant generation failed:", err);
      alert("Failed to generate some variants.");
    } finally {
      setGenerating(false);
    }
  }

  function handleDeleteVariant(id) {
    if (window.confirm("Delete this variant?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#111827]">Product Variants</h3>
          <p className="text-sm text-[#6B7280]">Generate combinations of sizes, colors, materials, etc.</p>
        </div>
      </div>

      {/* Option Configurator */}
      <div className="mb-6 space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <h4 className="text-sm font-semibold text-[#374151]">Configure Options</h4>
        
        {attributes.map((attr, idx) => (
          <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[#6B7280]">Option Name (e.g., Color)</label>
              <input 
                type="text" 
                className="input input-bordered w-full"
                value={attr.name}
                onChange={(e) => handleAttributeNameChange(idx, e.target.value)}
                placeholder="Size, Color, Material..."
              />
            </div>
            <div className="flex-[2]">
              <label className="mb-1 block text-xs font-medium text-[#6B7280]">Values (comma separated)</label>
              <input 
                type="text" 
                className="input input-bordered w-full"
                value={attr.values.join(", ")}
                onChange={(e) => handleAttributeValuesChange(idx, e.target.value)}
                placeholder="Red, Green, Blue"
              />
            </div>
            <button 
              type="button"
              className="btn btn-square btn-ghost shrink-0 text-red-500 hover:bg-red-50"
              onClick={() => handleRemoveAttribute(idx)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <button 
            type="button"
            className="btn btn-ghost btn-sm gap-2"
            onClick={handleAddAttribute}
          >
            <PlusIcon className="size-4" /> Add another option
          </button>

          <button 
            type="button"
            className="btn btn-primary btn-sm gap-2"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <span className="loading loading-spinner loading-xs" /> : <RefreshCwIcon className="size-4" />}
            Generate Variants
          </button>
        </div>
      </div>

      {/* Existing Variants Table */}
      {existingVariants.length > 0 && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#6B7280] uppercase">
              <tr>
                <th className="px-4 py-3 border-b border-[#E5E7EB]">Variant</th>
                <th className="px-4 py-3 border-b border-[#E5E7EB]">Price</th>
                <th className="px-4 py-3 border-b border-[#E5E7EB]">Stock</th>
                <th className="px-4 py-3 border-b border-[#E5E7EB] w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {existingVariants.map(v => (
                <tr key={v.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-medium text-[#111827]">
                    {v.variantAttributes.map(a => a.value).join(" / ")}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {formatPrice(v.priceCents, v.currency)}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {v.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => handleDeleteVariant(v.id)}
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
