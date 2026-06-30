import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { 
  UploadIcon, 
  XIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  FileIcon,
  DownloadIcon
} from "lucide-react";
import { apiFetch } from "../../lib/api.js";

const CHUNK_SIZE = 50;

function generateSlug(name) {
  return name.toString().toLowerCase().trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AdminBulkImportModal({ isOpen, onClose, getToken, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [result, setResult] = useState(null); // { successCount, skippedSlugs, failedRows }
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setFile(null);
      setParsedData([]);
      setErrors([]);
      setUploading(false);
      setProgress(0);
      setResult(null);
    }
  }, [isOpen]);

  const processData = (data) => {
    const validRows = [];
    const rowErrors = [];

    data.forEach((row, index) => {
      // Skip completely empty rows
      if (!row.name && !row.price) return;

      const errorsForThisRow = [];
      if (!row.name) errorsForThisRow.push("Missing name");
      
      let priceCents = 0;
      if (row.priceCents) {
        priceCents = parseInt(row.priceCents, 10);
      } else if (row.price) {
        priceCents = Math.round(parseFloat(row.price) * 100);
      } else {
        errorsForThisRow.push("Missing price");
      }

      if (isNaN(priceCents) || priceCents <= 0) {
        errorsForThisRow.push("Invalid price");
      }

      if (errorsForThisRow.length > 0) {
        rowErrors.push({ rowNumber: index + 1, originalRow: row, errors: errorsForThisRow });
      } else {
        validRows.push({
          originalIndex: index,
          name: String(row.name),
          slug: row.slug ? String(row.slug) : generateSlug(row.name),
          category: row.category ? String(row.category) : "General",
          description: row.description ? String(row.description) : "",
          priceCents,
          currency: row.currency ? String(row.currency).toLowerCase() : "usd",
          imageUrl: row.imageUrl ? String(row.imageUrl) : "",
          active: row.active !== undefined ? String(row.active).toLowerCase() === "true" : true,
          originalRow: row
        });
      }
    });

    setParsedData(validRows);
    setErrors(rowErrors);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResult(null);

    const nameParts = uploadedFile.name.split('.');
    const ext = nameParts[nameParts.length - 1].toLowerCase();

    if (ext === 'csv') {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: (err) => {
          alert("Error parsing CSV: " + err.message);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processData(data);
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      alert("Unsupported file format. Please upload a CSV or Excel file.");
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setUploading(true);
    setProgress(0);

    let totalSuccess = 0;
    let allSkippedSlugs = [];
    const failedRows = [...errors.map(e => e.originalRow)]; // Start with validation failures

    try {
      const chunks = [];
      for (let i = 0; i < parsedData.length; i += CHUNK_SIZE) {
        chunks.push(parsedData.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          const res = await apiFetch("/api/admin/products/bulk", {
            getToken,
            method: "POST",
            body: {
              products: chunk.map(item => {
                const { originalIndex, originalRow, ...productData } = item;
                return productData;
              })
            }
          });

          totalSuccess += res.successCount || 0;
          if (res.skippedSlugs) {
            allSkippedSlugs = [...allSkippedSlugs, ...res.skippedSlugs];
          }

          // Find rows that were skipped and add to failedRows
          if (res.skippedSlugs && res.skippedSlugs.length > 0) {
            const skippedSet = new Set(res.skippedSlugs);
            const chunkSkipped = chunk.filter(item => skippedSet.has(item.slug));
            failedRows.push(...chunkSkipped.map(i => i.originalRow));
          }

        } catch (err) {
          console.error("Chunk upload failed", err);
          // If a whole chunk fails, mark all as failed
          failedRows.push(...chunk.map(i => i.originalRow));
        }

        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      setResult({
        successCount: totalSuccess,
        skippedCount: allSkippedSlugs.length,
        failedRows,
        errorCount: errors.length
      });
      if (totalSuccess > 0) {
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during import.");
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const downloadFailedRows = () => {
    if (!result || !result.failedRows || result.failedRows.length === 0) return;
    const csv = Papa.unparse(result.failedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "failed_products.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4">
      <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#111827]">Bulk Import Products</h2>
          {!uploading && (
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#F3F4F6] text-[#6B7280]">
              <XIcon className="size-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!file && !result ? (
            <div 
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F8FAFC] py-16 transition-colors hover:border-[#FF6B4A]/50 hover:bg-[#FF6B4A]/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                className="hidden" 
              />
              <UploadIcon className="mb-4 size-10 text-[#9CA3AF]" />
              <p className="text-base font-semibold text-[#374151]">Click or drag file to upload</p>
              <p className="mt-1 text-sm text-[#6B7280]">Supports .csv and .xlsx</p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[#6B7280]">
                <AlertCircleIcon className="size-4" />
                <span>Required columns: <strong>name</strong>, <strong>price</strong></span>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#22C55E]/10">
                <CheckCircleIcon className="size-8 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827]">Import Complete</h3>
              <p className="mt-2 text-[#4B5563]">
                Successfully imported <strong>{result.successCount}</strong> products.
              </p>
              {(result.skippedCount > 0 || result.errorCount > 0) && (
                <p className="mt-1 text-[#EF4444]">
                  Skipped/Failed: <strong>{result.failedRows.length}</strong> products.
                </p>
              )}

              {result.failedRows.length > 0 && (
                <button 
                  onClick={downloadFailedRows}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
                >
                  <DownloadIcon className="size-4" />
                  Download Failed Rows (CSV)
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm border border-[#E5E7EB]">
                    <FileIcon className="size-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827]">{file.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {parsedData.length} valid rows • {errors.length} errors
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button 
                    onClick={() => setFile(null)} 
                    className="text-sm font-medium text-[#EF4444] hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {errors.length > 0 && (
                <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
                  <p className="font-semibold mb-2">Validation Errors ({errors.length})</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    {errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Row {e.rowNumber}: {e.errors.join(", ")}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>...and {errors.length - 5} more</li>
                    )}
                  </ul>
                  <p className="mt-2 text-xs opacity-80">These rows will be skipped during import.</p>
                </div>
              )}

              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E5E7EB]">
                  <h3 className="text-sm font-semibold text-[#374151]">Data Preview (First 5 rows)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-[#E5E7EB] text-xs text-[#6B7280]">
                      <tr>
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Slug</th>
                        <th className="px-4 py-2 font-medium">Category</th>
                        <th className="px-4 py-2 font-medium">Price (Cents)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] bg-white">
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium text-[#111827] truncate max-w-[150px]">{row.name}</td>
                          <td className="px-4 py-2 text-[#6B7280] truncate max-w-[150px]">{row.slug}</td>
                          <td className="px-4 py-2 text-[#6B7280]">{row.category}</td>
                          <td className="px-4 py-2 text-[#111827] tabular-nums">{row.priceCents}</td>
                        </tr>
                      ))}
                      {parsedData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[#6B7280]">No valid data to preview</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-[#374151]">Importing products...</span>
                    <span className="text-[#FF6B4A]">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                    <div 
                      className="h-full bg-[#FF6B4A] transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4">
          {result ? (
            <button 
              onClick={onClose}
              className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#374151]"
            >
              Close
            </button>
          ) : (
            <>
              <button 
                onClick={onClose}
                disabled={uploading}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#E5E7EB]"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={uploading || !file || parsedData.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF6B4A]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Importing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="size-4" />
                    Import {parsedData.length} Products
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
