import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, ImageIcon, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { listMedia, type MediaCategory, type MediaRow } from "@/lib/admin/api";
import { MediaUploader } from "./MediaUploader";

type PickerProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (rows: MediaRow[]) => void;
  multiple?: boolean;
  imagesOnly?: boolean;
  category?: MediaCategory;
};

export function MediaPickerDialog({ open, onOpenChange, onSelect, multiple, imagesOnly = true, category = "other" }: PickerProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaRow[]>([]);
  const media = useQuery({
    queryKey: ["media", { search, imagesOnly }],
    queryFn: () => listMedia({ search, imagesOnly, pageSize: 60 }),
    enabled: open,
  });

  const toggle = (row: MediaRow) => {
    if (!multiple) {
      onSelect([row]);
      onOpenChange(false);
      return;
    }
    setSelected((s) => (s.some((x) => x.id === row.id) ? s.filter((x) => x.id !== row.id) : [...s, row]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(96vw,64rem)] max-w-none overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or file name…" className="pl-9" />
            </div>
            <MediaUploader
              compact
              category={category}
              accept={imagesOnly ? "image/*" : "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"}
              bucket={imagesOnly ? "public-media" : undefined}
              onUploaded={(rows) => {
                void media.refetch();
                if (!multiple) {
                  onSelect(rows.slice(0, 1));
                  onOpenChange(false);
                } else setSelected((s) => [...rows, ...s]);
              }}
              className="md:w-56"
            />
          </div>
          <div className="max-h-[52vh] overflow-y-auto">
            {media.isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading media…</p>
            ) : media.data?.rows.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {media.data.rows.map((m) => {
                  const on = selected.some((x) => x.id === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m)}
                      className={cn("group relative aspect-square overflow-hidden rounded-lg border bg-muted text-left", on && "ring-2 ring-primary")}
                      title={m.title ?? m.file_name}
                    >
                      <MediaThumb media={m} />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-[10px] text-white">{m.title ?? m.file_name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No files yet. Upload your first file above.</p>
            )}
          </div>
          {multiple ? (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">{selected.length} selected</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSelected([])}>Clear</Button>
                <Button
                  variant="navy"
                  disabled={selected.length === 0}
                  onClick={() => {
                    onSelect(selected);
                    setSelected([]);
                    onOpenChange(false);
                  }}
                >
                  Use {selected.length || ""} file{selected.length === 1 ? "" : "s"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MediaThumb({ media, className }: { media: Pick<MediaRow, "url" | "mime_type" | "file_name" | "alt_text">; className?: string }) {
  if (media.mime_type?.startsWith("image/")) {
    return <img src={media.url} alt={media.alt_text ?? ""} className={cn("size-full object-cover", className)} loading="lazy" />;
  }
  return (
    <div className={cn("flex size-full flex-col items-center justify-center gap-1 p-2 text-muted-foreground", className)}>
      <FileText className="size-6" />
      <span className="line-clamp-2 text-center text-[10px]">{media.file_name}</span>
    </div>
  );
}

/** Single image/file field with preview, picker and clear. */
export function MediaField({
  value,
  onChange,
  imagesOnly = true,
  category = "other",
  label,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  imagesOnly?: boolean;
  category?: MediaCategory;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {value ? (
          imagesOnly || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value) ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <FileText className="size-8 text-muted-foreground" />
          )
        ) : (
          <ImageIcon className="size-8 text-muted-foreground/60" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "Change" : `Choose ${label ?? (imagesOnly ? "image" : "file")}`}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="size-4" /> Remove
          </Button>
        ) : null}
      </div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} imagesOnly={imagesOnly} category={category} onSelect={(rows) => rows[0] && onChange(rows[0].url)} />
    </div>
  );
}
