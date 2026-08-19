import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import api from "../../services/api.js";

const MAX_SIZE_MB = 8;

/**
 * Renders an icon button that opens a file picker, uploads the chosen file,
 * and calls onUploaded(url) on success. Kept deliberately minimal (icon
 * trigger, not a full dropzone) so it drops into tight spaces like a chat
 * input bar or a form field row.
 */
export default function ImageUploadButton({ kind = "image", onUploaded, onError, size = 18, className = "" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const accept = kind === "document" ? "image/*,.pdf" : "image/*";

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError?.(`File is too large - max ${MAX_SIZE_MB}MB.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    setUploading(true);
    try {
      const { data } = await api.post("/uploads/", formData);
      onUploaded?.(data.url, file);
    } catch (err) {
      onError?.(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`grid place-items-center rounded-full transition-colors disabled:opacity-50 ${className}`}
        title={kind === "document" ? "Upload certification" : "Upload image"}
      >
        {uploading ? <Loader2 size={size} className="animate-spin" /> : <ImagePlus size={size} />}
      </button>
    </>
  );
}
