import { useState, useRef } from "react";
import JSZip from "jszip";
import imageCompression from "browser-image-compression";
import { uploadImageToImageKit } from "../../lib/imagekitUpload.js";
import { IK_PRESETS, imageKitOptimizedUrl } from "../../lib/imagekitUrl.js";
import { 
  UploadCloudIcon, 
  Trash2Icon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CrownIcon,
  ImageIcon,
  ArchiveIcon,
} from "lucide-react";

export function AdminProductImageGallery({ images, onChange, getToken, slug }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Reorder images
  function moveImage(index, direction) {
    if (index === 0 && direction === -1) return;
    if (index === images.length - 1 && direction === 1) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    onChange(newImages);
  }

  // Delete image
  function deleteImage(index) {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  }

  // Set primary
  function setPrimary(index) {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected); // Move to front
    onChange(newImages);
  }

  // Handle Drag & Drop
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }

  function handleFileInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Process selected or dropped files (images and zips)
  async function processFiles(files) {
    setIsUploading(true);
    setError(null);
    let extractedFiles = [];

    setUploadStatus("Processing files...");

    try {
      for (const file of files) {
        if (file.name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
          setUploadStatus(`Extracting ${file.name}...`);
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          
          for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
            if (!zipEntry.dir && relativePath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
              const blob = await zipEntry.async("blob");
              const extractedFile = new File([blob], relativePath.split('/').pop(), { type: blob.type });
              extractedFiles.push(extractedFile);
            }
          }
        } else if (file.type.startsWith("image/")) {
          extractedFiles.push(file);
        }
      }

      if (extractedFiles.length === 0) {
        throw new Error("No valid images found.");
      }

      const uploadedImages = [];
      const baseName = (slug?.trim() || "product").replace(/[^\w-]+/g, "-").slice(0, 50);
      
      let count = 0;
      for (const file of extractedFiles) {
        count++;
        setUploadStatus(`Compressing image ${count} of ${extractedFiles.length}...`);
        
        // Compression
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        
        setUploadStatus(`Uploading image ${count} of ${extractedFiles.length}...`);
        
        const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".jpg";
        
        const { url, fileId } = await uploadImageToImageKit(compressedFile, getToken, {
          fileName: `${baseName}-${Date.now()}-${count}${ext}`,
        });

        uploadedImages.push({ url, fileId });
      }

      onChange([...images, ...uploadedImages]);
      setUploadStatus("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-[#FF6B4A] bg-[#FF6B4A]/5" : "border-[#D1D5DB] bg-[#F8FAFC] hover:bg-[#F3F4F6]"
        }`}
      >
        <div className="mb-4 flex gap-3 text-[#9CA3AF]">
          <ImageIcon className="size-8" />
          <ArchiveIcon className="size-8" />
        </div>
        <h4 className="mb-1 text-base font-semibold text-[#111827]">Drag & Drop Images or a ZIP file</h4>
        <p className="mb-4 text-xs text-[#6B7280]">Supports JPG, PNG, WEBP, GIF, or a ZIP archive containing images. Images will be automatically compressed.</p>
        
        <input 
          type="file" 
          multiple 
          accept="image/png,image/jpeg,image/webp,image/gif,.zip,application/zip" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileInput}
          disabled={isUploading}
        />
        <button 
          type="button" 
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] shadow-sm ring-1 ring-inset ring-[#D1D5DB] transition hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <span className="loading loading-spinner loading-xs text-[#FF6B4A]" />
              {uploadStatus}
            </>
          ) : (
            <>
              <UploadCloudIcon className="size-4 text-[#FF6B4A]" />
              Browse Files
            </>
          )}
        </button>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-[#EF4444]">{error}</p>}
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => {
            const isPrimary = idx === 0;
            return (
              <div 
                key={img.fileId || idx} 
                className={`group relative flex aspect-square flex-col overflow-hidden rounded-xl border ${
                  isPrimary ? "border-[#FF6B4A] ring-1 ring-[#FF6B4A]" : "border-[#E5E7EB]"
                } bg-white shadow-sm transition-all hover:shadow-md`}
              >
                {/* Image */}
                <div className="relative flex-1 bg-[#F8FAFC] p-2">
                  <img 
                    src={imageKitOptimizedUrl(img.url, IK_PRESETS.formPreview)} 
                    alt={`Product image ${idx + 1}`}
                    className="size-full object-contain"
                  />
                  {isPrimary && (
                    <div className="absolute left-2 top-2 rounded-lg bg-[#FF6B4A] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                      <CrownIcon className="size-3" /> Primary
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-white p-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, -1)}
                      className="rounded p-1 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowLeftIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 1)}
                      className="rounded p-1 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowRightIcon className="size-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="rounded p-1 text-[#6B7280] transition hover:bg-[#FFF5F3] hover:text-[#FF6B4A]"
                        title="Set as Primary"
                      >
                        <CrownIcon className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage(idx)}
                      className="rounded p-1 text-[#6B7280] transition hover:bg-red-50 hover:text-[#EF4444]"
                      title="Delete Image"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
