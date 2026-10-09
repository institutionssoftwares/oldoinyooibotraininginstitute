import { useCallback, useRef, useState } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { uploadMedia, type MediaCategory, type MediaRow } from "@/lib/admin/api";

type Props = {
  category: MediaCategory;
  accept?: string;
  multiple?: boolean;
  bucket?: "public-media" | "documents" | undefined;
  onUploaded: (rows: MediaRow[]) => void | Promise<void>;
  className?: string;
  compact?: boolean;
};

export function MediaUploader({ category, accept = "image/*", multiple = true, bucket, onUploaded, className, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(Boolean);
      if (list.length === 0 || uploadingRef.current) return;
      uploadingRef.current = true;
      setBusy(true);
      setProgress({ done: 0, total: list.length });
      let saved = 0;
      try {
        // Save each bounded batch before moving on; no total photo-count limit.
        for (let offset = 0; offset < list.length; offset += 4) {
          const results = await Promise.all(list.slice(offset, offset + 4).map(async (file) => {
            try {
              return await uploadMedia(file, { category, bucket });
            } catch (e) {
              toast.error(`Upload failed: ${file.name}`, { description: e instanceof Error ? e.message : String(e) });
              return null;
            } finally {
              setProgress((p) => ({ ...p, done: p.done + 1 }));
            }
          }));
          const rows = results.filter((r): r is MediaRow => r !== null);
          if (rows.length) {
            await onUploaded(rows);
            saved += rows.length;
          }
        }
        if (saved) toast.success(`${saved} file${saved > 1 ? "s" : ""} uploaded`);
      } catch (e) {
        toast.error("Files uploaded, but could not be added. They remain in the media library.", { description: e instanceof Error ? e.message : String(e) });
      } finally {
        uploadingRef.current = false;
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [category, bucket, onUploaded],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files"
      aria-disabled={busy}
      onClick={() => { if (!busy) inputRef.current?.click(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!busy) inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/60 hover:bg-muted/60",
        dragging && "border-primary bg-primary/5",
        compact ? "gap-1 px-4 py-4" : "gap-2 px-6 py-10",
        className,
      )}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={busy} className="sr-only" onChange={(e) => e.target.files && void handleFiles(e.target.files)} />
      {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : <CloudUpload className="size-6 text-primary" />}
      <p className="text-sm font-medium">
        {busy ? `Uploading ${progress.done}/${progress.total}…` : compact ? "Upload" : "Drag & drop files here, or click to browse"}
      </p>
      {!compact && !busy ? <p className="text-xs text-muted-foreground">{category === "gallery" ? "Gallery photos are uploaded at full original quality and size." : "Images are optimised automatically (max 1920px)."} {multiple ? "Select as many photos as you like — 40, 100 or more at once." : ""}</p> : null}
    </div>
  );
}
