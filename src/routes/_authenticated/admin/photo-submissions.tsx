import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/photo-submissions")({
  head: () => ({ meta: [{ title: "Photo submissions | OOTI Admin" }, { name: "robots", content: "noindex" }] }),
  component: PhotoSubmissions,
});

function PhotoSubmissions() {
  const qc = useQueryClient();
  const [albumFor, setAlbumFor] = useState<Record<string, string>>({});

  const albums = useQuery({
    queryKey: ["admin", "albums-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("id,title").eq("archived", false).order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const pending = useQuery({
    queryKey: ["admin", "photo-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,image_url,caption,submitter_name,submitter_phone,created_at")
        .eq("is_submission", true)
        .eq("status", "draft")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "photo-submissions"] });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const album_id = albumFor[id] || albums.data?.[0]?.id;
      if (!album_id) throw new Error("Create a gallery album first.");
      const { error } = await supabase.from("gallery_images").update({ album_id, status: "published", published: true }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast.success("Approved — now visible in the gallery"); void refresh(); },
    onError: (e) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast.success("Photo rejected"); void refresh(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Photo submissions</h1>
      <p className="mt-1 text-sm text-muted-foreground">Photos sent by the public. Choose an album and approve to publish them.</p>
      {pending.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !pending.data?.length ? (
        <p className="mt-6 rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">No photos waiting for approval.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.data.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-xl border bg-card">
              <a href={img.image_url} target="_blank" rel="noreferrer">
                <img src={img.image_url} alt={img.caption ?? ""} className="h-52 w-full bg-muted object-contain" loading="lazy" />
              </a>
              <figcaption className="grid gap-2 p-3 text-sm">
                <p className="font-medium">{img.submitter_name}{img.submitter_phone ? ` · ${img.submitter_phone}` : ""}</p>
                {img.caption ? <p className="text-muted-foreground">{img.caption}</p> : null}
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={albumFor[img.id] ?? albums.data?.[0]?.id ?? ""}
                  onChange={(e) => setAlbumFor((s) => ({ ...s, [img.id]: e.target.value }))}
                  aria-label="Album"
                >
                  {(albums.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => approve.mutate(img.id)}><Check className="size-4" /> Approve</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => window.confirm("Reject and delete this photo?") && reject.mutate(img.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
