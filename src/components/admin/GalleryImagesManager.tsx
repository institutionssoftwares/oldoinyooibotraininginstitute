import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MediaPickerDialog } from "@/components/admin/MediaPicker";
import { supabase } from "@/integrations/supabase/client";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
};

/** Photos inside one gallery album. */
export function GalleryImagesManager({ albumId }: { albumId: string }) {
  const qc = useQueryClient();
  const [pick, setPick] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = () => (supabase as any).from("gallery_images");

  const images = useQuery({
    queryKey: ["admin", "gallery_images", albumId],
    queryFn: async () => {
      const { data, error } = await table().select("*").eq("album_id", albumId).order("sort_order").order("created_at");
      if (error) throw new Error(error.message);
      return (data ?? []) as GalleryImage[];
    },
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "gallery_images", albumId] });

  const add = useMutation({
    mutationFn: async (urls: string[]) => {
      const rows = urls.map((url, i) => ({
        album_id: albumId,
        image_url: url,
        published: true,
        status: "published",
        sort_order: (images.data?.length ?? 0) + i,
      }));
      const { error } = await table().insert(rows);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Photos added");
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<GalleryImage> & { status?: string } }) => {
      const { error } = await table().update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await table().delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Photo removed");
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Album photos</h2>
          <p className="mt-1 text-xs text-muted-foreground">Photos shown on the public album page.</p>
        </div>
        <Button variant="navy" size="sm" onClick={() => setPick(true)}>
          <Plus className="size-4" /> Add photos
        </Button>
      </div>

      {images.isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading photos…</p>
      ) : images.data?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.data.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-lg border">
              <img src={img.image_url} alt={img.caption ?? ""} className="h-36 w-full bg-muted object-contain" loading="lazy" />
              <div className="flex flex-col gap-2 p-2">
                <Input
                  defaultValue={img.caption ?? ""}
                  placeholder="Caption"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    if (e.target.value !== (img.caption ?? "")) update.mutate({ id: img.id, values: { caption: e.target.value || null } });
                  }}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="flex items-center gap-1.5">
                    <Switch
                      checked={img.published}
                      onCheckedChange={(c) => update.mutate({ id: img.id, values: { published: c, status: c ? "published" : "draft" } })}
                      className="scale-75"
                    />
                    Visible
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    aria-label="Delete photo"
                    onClick={() => {
                      if (window.confirm("Remove this photo from the album?")) remove.mutate(img.id);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          No photos yet. Click “Add photos” to upload or pick from the media library.
        </p>
      )}

      <MediaPickerDialog open={pick} onOpenChange={setPick} multiple category="gallery" onSelect={(rows) => add.mutate(rows.map((r) => r.url))} />
    </section>
  );
}
