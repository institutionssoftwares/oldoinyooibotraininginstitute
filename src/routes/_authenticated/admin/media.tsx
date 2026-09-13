import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MediaThumb } from "@/components/admin/MediaPicker";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteMedia, formatBytes, listMedia, updateMedia, type MediaRow } from "@/lib/admin/api";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaLibraryRoute,
});

const CATEGORIES = ["gallery", "news", "events", "courses", "staff", "documents", "homepage", "other"];

function MediaLibraryRoute() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);

  const media = useQuery({
    queryKey: ["media", "library", { search, category, page }],
    queryFn: () => listMedia({ search, category: category || undefined, page, pageSize: 36 }),
    placeholderData: keepPreviousData,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["media"] });

  const remove = useMutation({
    mutationFn: (rows: MediaRow[]) => deleteMedia(rows),
    onSuccess: () => {
      toast.success("Deleted");
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rows = media.data?.rows ?? [];
  const count = media.data?.count ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Media library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every photo and document on the website. Upload once, reuse anywhere.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search files…" className="pl-9" />
        </div>
        <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MediaUploader category="gallery" onUploaded={() => void invalidate()} />

      {media.isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
      ) : rows.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <figure key={m.id} className="group overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-muted">
                <MediaThumb media={m} />
              </div>
              <figcaption className="flex flex-col gap-1.5 p-3">
                <Input
                  defaultValue={m.title ?? ""}
                  placeholder="Title"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    if (e.target.value !== (m.title ?? "")) void updateMedia(m.id, { title: e.target.value || null }).then(invalidate);
                  }}
                />
                <Input
                  defaultValue={m.alt_text ?? ""}
                  placeholder="Alt text (for accessibility)"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    if (e.target.value !== (m.alt_text ?? "")) void updateMedia(m.id, { alt_text: e.target.value || null }).then(invalidate);
                  }}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{m.category} · {formatBytes(m.size_bytes)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    aria-label="Delete file"
                    onClick={() => {
                      if (window.confirm("Delete this file? Pages using it will lose the image.")) remove.mutate([m]);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No files yet — drag images onto the box above to upload them.
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{count} files</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={rows.length < 36} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
