import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { XIcon, DownloadIcon } from "lucide-react";
import { formatPrice } from "../../utils/format.js";

export function AdminExportModal({
  isOpen,
  onClose,
  allProducts,
  filteredProducts,
  selectedIds,
}) {
  const [exportScope, setExportScope] = useState("all"); // 'all', 'filtered', 'selected'
  const [exportFormat, setExportFormat] = useState("csv"); // 'csv', 'xlsx'

  if (!isOpen) return null;

  function generateExportData() {
    let source = allProducts;
    if (exportScope === "filtered") source = filteredProducts;
    if (exportScope === "selected") {
      source = allProducts.filter((p) => selectedIds.has(p.id));
    }

    return source.map((p) => ({
      ID: p.id,
      Name: p.name,
      Slug: p.slug,
      Category: p.category ?? "",
      BrandID: p.brandId ?? "",
      Price: formatPrice(p.priceCents, p.currency),
      Currency: p.currency.toUpperCase(),
      Stock: p.stockQuantity,
      Reserved: p.reservedStock,
      LowStockThreshold: p.lowStockThreshold,
      Active: p.active ? "Yes" : "No",
      CreatedAt: new Date(p.createdAt).toISOString(),
    }));
  }

  function handleExport() {
    const data = generateExportData();
    if (data.length === 0) {
      alert("No products to export.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `senpaimart_products_${exportScope}_${timestamp}`;

    if (exportFormat === "csv") {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportFormat === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#111827]">Export Products</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Export Scope
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 hover:bg-[#F8FAFC]">
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={exportScope === "all"}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <div>
                  <p className="text-sm font-medium text-[#111827]">All Products</p>
                  <p className="text-xs text-[#6B7280]">{allProducts.length} total</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 hover:bg-[#F8FAFC]">
                <input
                  type="radio"
                  name="exportScope"
                  value="filtered"
                  checked={exportScope === "filtered"}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <div>
                  <p className="text-sm font-medium text-[#111827]">Filtered Products</p>
                  <p className="text-xs text-[#6B7280]">
                    {filteredProducts.length} matching search
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 ${
                  selectedIds.size === 0
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-[#F8FAFC]"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="selected"
                  checked={exportScope === "selected"}
                  disabled={selectedIds.size === 0}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <div>
                  <p className="text-sm font-medium text-[#111827]">Selected Products</p>
                  <p className="text-xs text-[#6B7280]">
                    {selectedIds.size} checked items
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Export Format
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm text-[#111827]">CSV</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="exportFormat"
                  value="xlsx"
                  checked={exportFormat === "xlsx"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm text-[#111827]">Excel (.xlsx)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#E5E7EB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#374151]"
          >
            <DownloadIcon className="size-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
