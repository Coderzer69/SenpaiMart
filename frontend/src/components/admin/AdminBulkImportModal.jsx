import { useState, useRef, useEffect, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  UploadIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
  RotateCcwIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-react";
import { apiFetch } from "../../lib/api.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const CHUNK_SIZE = 50;

const SAMPLE_ROWS = [
  {
    name: "Wireless Headphones Pro",
    slug: "wireless-headphones-pro",
    category: "Electronics",
    description: "Premium noise-cancelling wireless headphones",
    price: "149.99",
    priceCents: "",
    currency: "usd",
    imageUrl: "",
    active: "true",
  },
  {
    name: "Leather Wallet",
    slug: "leather-wallet",
    category: "Accessories",
    description: "Slim genuine leather bifold wallet",
    price: "39.99",
    priceCents: "",
    currency: "usd",
    imageUrl: "",
    active: "true",
  },
  {
    name: "Running Shoes X500",
    slug: "",
    category: "Footwear",
    description: "Lightweight performance running shoes",
    price: "89.00",
    priceCents: "",
    currency: "usd",
    imageUrl: "https://example.com/shoe.jpg",
    active: "true",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name) {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function downloadCSV(rows, filename) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Mini toast hook ──────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Toast Portal ─────────────────────────────────────────────────────────────

function ToastPortal({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "border-green-200 bg-white text-green-800"
              : "border-red-200 bg-white text-red-800"
          }`}
          style={{ minWidth: 280, maxWidth: 380 }}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === "success" ? (
              <CheckCircleIcon className="size-4 text-green-500" aria-hidden />
            ) : (
              <AlertTriangleIcon className="size-4 text-red-500" aria-hidden />
            )}
          </div>
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button
            type="button"
            onClick={() => onRemove(t.id)}
            className="ml-1 shrink-0 rounded-lg p-0.5 text-current opacity-50 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminBulkImportModal({ isOpen, onClose, getToken, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState(null);

  // validRows: rows that pass local validation, ready to send
  const [validRows, setValidRows] = useState([]);
  // invalidRows: rows that failed local validation (will be skipped)
  const [invalidRows, setInvalidRows] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { successCount, skippedCount, errorCount, failedRows }

  const fileInputRef = useRef(null);
  const { toasts, addToast, removeToast } = useToast();

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFile(null);
      setIsDragging(false);
      setParseError(null);
      setValidRows([]);
      setInvalidRows([]);
      setUploading(false);
      setProgress(0);
      setResult(null);
    }
  }, [isOpen]);

  // ESC to close (when not uploading)
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape" && !uploading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, uploading, onClose]);

  // ── Parsing ────────────────────────────────────────────────────────────────

  function processRawData(data) {
    const valid = [];
    const invalid = [];

    data.forEach((row, index) => {
      // Skip fully empty rows
      const hasAnyData = Object.values(row).some(
        (v) => v !== null && v !== undefined && String(v).trim() !== ""
      );
      if (!hasAnyData) return;

      const rowErrors = [];

      // name required
      const name = row.name ? String(row.name).trim() : "";
      if (!name) rowErrors.push("Missing name");

      // price: accept priceCents (int) or price (dollars float)
      let priceCents = 0;
      if (row.priceCents && String(row.priceCents).trim() !== "") {
        priceCents = parseInt(String(row.priceCents).trim(), 10);
      } else if (row.price && String(row.price).trim() !== "") {
        priceCents = Math.round(parseFloat(String(row.price).trim()) * 100);
      } else {
        rowErrors.push("Missing price");
      }

      if (rowErrors.length === 0 && (isNaN(priceCents) || priceCents <= 0)) {
        rowErrors.push("Invalid price (must be a positive number)");
      }

      const slug = row.slug
        ? String(row.slug).trim()
        : name
          ? generateSlug(name)
          : "";

      if (!slug && rowErrors.length === 0) rowErrors.push("Cannot generate slug from name");

      if (rowErrors.length > 0) {
        invalid.push({
          rowNumber: index + 1,
          errors: rowErrors,
          preview: { name: row.name ?? "", price: row.price ?? row.priceCents ?? "" },
          originalRow: row,
        });
      } else {
        valid.push({
          originalIndex: index,
          name,
          slug,
          category: row.category ? String(row.category).trim() : "General",
          description: row.description ? String(row.description).trim() : "",
          priceCents,
          currency: row.currency ? String(row.currency).trim().toLowerCase() : "usd",
          imageUrl: row.imageUrl ? String(row.imageUrl).trim() : "",
          active:
            row.active !== undefined && row.active !== ""
              ? String(row.active).toLowerCase() === "true" ||
                String(row.active) === "1"
              : true,
          originalRow: row,
        });
      }
    });

    setValidRows(valid);
    setInvalidRows(invalid);
  }

  function handleFile(uploadedFile) {
    if (!uploadedFile) return;
    setParseError(null);
    setResult(null);
    setFile(uploadedFile);

    const ext = uploadedFile.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => processRawData(res.data),
        error: (err) => {
          setFile(null);
          setParseError(`CSV parse error: ${err.message}`);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          processRawData(XLSX.utils.sheet_to_json(ws));
        } catch (err) {
          setFile(null);
          setParseError(`Excel parse error: ${err.message}`);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      setParseError("Unsupported format. Please upload a .csv or .xlsx file.");
    }
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }

  function onInputChange(e) {
    handleFile(e.target.files?.[0]);
    // reset input value so the same file can be re-selected after Remove
    e.target.value = "";
  }

  // ── Sample template ────────────────────────────────────────────────────────

  function downloadSampleTemplate(format) {
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "senpaimart_import_template.xlsx");
    } else {
      downloadCSV(SAMPLE_ROWS, "senpaimart_import_template.csv");
    }
  }

  // ── Import logic ───────────────────────────────────────────────────────────

  async function handleImport() {
    if (validRows.length === 0) return;
    setUploading(true);
    setProgress(0);

    let totalSuccess = 0;
    let allSkippedSlugs = [];
    const serverFailedRows = [];

    try {
      const chunks = [];
      for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
        chunks.push(validRows.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const res = await apiFetch("/api/admin/products/bulk", {
            getToken,
            method: "POST",
            body: {
              products: chunk.map((chunkItem) => {
                const productData = { ...chunkItem };
                delete productData.originalIndex;
                delete productData.originalRow;
                return {
                  ...productData,
                  imageUrl: productData.imageUrl || undefined,
                };
              }),
            },
          });

          totalSuccess += res.successCount ?? 0;

          if (res.skippedSlugs?.length > 0) {
            allSkippedSlugs = [...allSkippedSlugs, ...res.skippedSlugs];
            const skippedSet = new Set(res.skippedSlugs);
            serverFailedRows.push(
              ...chunk
                .filter((item) => skippedSet.has(item.slug))
                .map((item) => item.originalRow)
            );
          }
        } catch (err) {
          console.error("Chunk upload failed:", err);
          serverFailedRows.push(...chunk.map((item) => item.originalRow));
        }

        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      const failedRows = [
        ...invalidRows.map((r) => r.originalRow),
        ...serverFailedRows,
      ];

      setResult({
        successCount: totalSuccess,
        skippedCount: allSkippedSlugs.length,
        errorCount: invalidRows.length,
        failedRows,
      });

      if (totalSuccess > 0) {
        onImportSuccess?.();
        addToast(
          "success",
          `Successfully imported ${totalSuccess} product${totalSuccess !== 1 ? "s" : ""}.`
        );
      } else {
        addToast("error", "No products were imported. Check your file and try again.");
      }
    } catch (err) {
      console.error("Import error:", err);
      addToast("error", "An unexpected error occurred during import.");
    } finally {
      setUploading(false);
    }
  }

  // ── Failed rows download ───────────────────────────────────────────────────

  function downloadFailedRows() {
    if (!result?.failedRows?.length) return;
    downloadCSV(result.failedRows, "failed_products.csv");
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  function resetModal() {
    setFile(null);
    setParseError(null);
    setValidRows([]);
    setInvalidRows([]);
    setProgress(0);
    setResult(null);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const totalRows = validRows.length + invalidRows.length;
  const hasFile = file !== null;
  const hasResult = result !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-sm"
        onClick={!uploading ? onClose : undefined}
        aria-modal="true"
        role="dialog"
        aria-label="Bulk import products"
      >
        {/* Modal panel — stop propagation so clicking inside doesn't close */}
        <div
          className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Bulk Import Products</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Upload a CSV or Excel file to create multiple products at once
              </p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Close"
              >
                <XIcon className="size-5" />
              </button>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ─ Step 1: Drop zone (no file yet, no result) ─ */}
            {!hasFile && !hasResult && (
              <div className="space-y-5">
                {/* Parse error banner */}
                {parseError && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-[#EF4444]" aria-hidden />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* Drop zone */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drop file here or click to select"
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 text-center transition-colors duration-150 ${
                    isDragging
                      ? "border-[#FF6B4A] bg-[#FF6B4A]/8"
                      : "border-[#D1D5DB] bg-[#F8FAFC] hover:border-[#FF6B4A]/60 hover:bg-[#FF6B4A]/4"
                  }`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onInputChange}
                    accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                    aria-hidden
                  />
                  <div
                    className={`mb-4 flex size-14 items-center justify-center rounded-2xl transition-colors ${
                      isDragging ? "bg-[#FF6B4A]/15" : "bg-[#F3F4F6]"
                    }`}
                  >
                    <UploadIcon
                      className={`size-7 transition-colors ${
                        isDragging ? "text-[#FF6B4A]" : "text-[#9CA3AF]"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <p className="text-base font-semibold text-[#374151]">
                    {isDragging ? "Drop your file here" : "Drag & drop or click to select"}
                  </p>
                  <p className="mt-1.5 text-sm text-[#6B7280]">
                    Supports <strong>.csv</strong> and <strong>.xlsx</strong>
                  </p>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280]">
                    <InfoIcon className="size-3.5 shrink-0 text-[#9CA3AF]" aria-hidden />
                    <span>
                      Required columns: <code className="font-mono font-semibold text-[#374151]">name</code>,{" "}
                      <code className="font-mono font-semibold text-[#374151]">price</code>
                      {" "}— Optional: slug, category, description, currency, imageUrl, active
                    </span>
                  </div>
                </div>

                {/* Sample template download */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheetIcon className="size-5 shrink-0 text-[#3B82F6]" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-[#374151]">Download sample template</p>
                      <p className="text-xs text-[#6B7280]">Shows the required column format with example data</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate("csv")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] shadow-sm transition hover:bg-[#F3F4F6]"
                    >
                      <DownloadIcon className="size-3.5" aria-hidden />
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate("xlsx")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] shadow-sm transition hover:bg-[#F3F4F6]"
                    >
                      <DownloadIcon className="size-3.5" aria-hidden />
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─ Step 2: Preview (file selected, no result yet) ─ */}
            {hasFile && !hasResult && (
              <div className="space-y-5">
                {/* File card */}
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
                      <FileSpreadsheetIcon className="size-5 text-[#3B82F6]" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#111827]">{file.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        {formatBytes(file.size)} ·{" "}
                        <span className="text-green-600 font-medium">{validRows.length} valid</span>
                        {invalidRows.length > 0 && (
                          <span className="text-red-500 font-medium"> · {invalidRows.length} invalid</span>
                        )}
                        {" "}of {totalRows} rows
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={resetModal}
                      className="ml-4 shrink-0 text-sm font-medium text-[#EF4444] transition hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Validation errors */}
                {invalidRows.length > 0 && (
                  <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                    <div className="mb-2.5 flex items-center gap-2">
                      <AlertCircleIcon className="size-4 shrink-0 text-[#EF4444]" aria-hidden />
                      <p className="text-sm font-semibold text-[#991B1B]">
                        {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} with validation errors
                        <span className="font-normal"> — will be skipped during import</span>
                      </p>
                    </div>
                    <ul className="space-y-1 pl-6 text-xs text-[#B91C1C]" style={{ listStyleType: "disc" }}>
                      {invalidRows.slice(0, 8).map((r, i) => (
                        <li key={i}>
                          Row {r.rowNumber}
                          {r.preview.name ? ` ("${r.preview.name}")` : ""}: {r.errors.join(", ")}
                        </li>
                      ))}
                      {invalidRows.length > 8 && (
                        <li className="opacity-70">…and {invalidRows.length - 8} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Data preview table */}
                <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                    <h3 className="text-sm font-semibold text-[#374151]">
                      Preview
                      {validRows.length > 5 && (
                        <span className="ml-1.5 font-normal text-[#6B7280]">
                          (showing first 5 of {validRows.length} valid rows)
                        </span>
                      )}
                    </h3>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {validRows.length} to import
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#E5E7EB] bg-white text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                        <tr>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Slug</th>
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5">Price (¢)</th>
                          <th className="px-4 py-2.5">Currency</th>
                          <th className="px-4 py-2.5">Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB] bg-white">
                        {validRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-[#F8FAFC]">
                            <td className="max-w-[160px] truncate px-4 py-2.5 font-medium text-[#111827]">
                              {row.name}
                            </td>
                            <td className="max-w-[140px] truncate px-4 py-2.5 font-mono text-xs text-[#6B7280]">
                              {row.slug}
                            </td>
                            <td className="px-4 py-2.5 text-[#6B7280]">
                              <span className="inline-flex rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs">
                                {row.category}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-[#111827]">
                              {row.priceCents.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-xs uppercase text-[#6B7280]">
                              {row.currency}
                            </td>
                            <td className="px-4 py-2.5">
                              {row.active ? (
                                <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-[#E5E7EB] px-2 py-0.5 text-xs font-semibold text-[#6B7280]">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {validRows.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-[#6B7280]">
                              No valid rows to preview
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Progress bar (shown while uploading) */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#374151]">Importing products…</span>
                      <span className="font-semibold text-[#FF6B4A]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                      <div
                        className="h-full rounded-full bg-[#FF6B4A] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="text-xs text-[#9CA3AF]">
                      Please don't close this window while importing…
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─ Step 3: Result screen ─ */}
            {hasResult && (
              <div className="flex flex-col items-center py-8 text-center">
                {result.successCount > 0 ? (
                  <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircleIcon className="size-10 text-green-500" aria-hidden />
                  </div>
                ) : (
                  <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#FEF2F2]">
                    <AlertTriangleIcon className="size-10 text-[#EF4444]" aria-hidden />
                  </div>
                )}

                <h3 className="text-xl font-bold text-[#111827]">
                  {result.successCount > 0 ? "Import Complete" : "Import Failed"}
                </h3>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
                    <p className="text-xs text-green-600">Imported</p>
                  </div>
                  {result.skippedCount > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-amber-700">{result.skippedCount}</p>
                      <p className="text-xs text-amber-600">Duplicate slugs skipped</p>
                    </div>
                  )}
                  {result.errorCount > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-red-700">{result.errorCount}</p>
                      <p className="text-xs text-red-600">Validation errors</p>
                    </div>
                  )}
                </div>

                {result.failedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadFailedRows}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-[#F9FAFB]"
                  >
                    <DownloadIcon className="size-4" aria-hidden />
                    Download Failed Rows ({result.failedRows.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4">
            {/* Left side: sample template shortcut (only on empty state) */}
            {!hasFile && !hasResult && (
              <button
                type="button"
                onClick={() => downloadSampleTemplate("csv")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] transition hover:text-[#374151]"
              >
                <DownloadIcon className="size-3.5" aria-hidden />
                Download template
              </button>
            )}
            {(hasFile || hasResult) && <div />}

            {/* Right side: action buttons */}
            <div className="flex items-center gap-3">
              {hasResult ? (
                <>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-[#F3F4F6]"
                  >
                    <RotateCcwIcon className="size-4" aria-hidden />
                    Import Another
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#374151]"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={uploading}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#E5E7EB] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={uploading || !hasFile || validRows.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <span className="loading loading-spinner loading-xs" aria-hidden />
                        Importing…
                      </>
                    ) : (
                      <>
                        <UploadIcon className="size-4" aria-hidden />
                        Import {validRows.length > 0 ? `${validRows.length} ` : ""}Products
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast portal — rendered outside the modal overlay */}
      <ToastPortal toasts={toasts} onRemove={removeToast} />
    </>
  );
}
