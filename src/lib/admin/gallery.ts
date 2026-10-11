import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function listAlbums(): Promise<{ id: string; title: string }[]> {
  const { data, error } = await db.from("gallery_albums").select("id,title").eq("archived", false).order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Returns an album id, creating a published "Campus Life" album when none exists. */
export async function ensureAlbum(albumId?: string): Promise<string> {
  if (albumId) return albumId;
  const existing = await listAlbums();
  if (existing[0]) return existing[0].id;
  const { data, error } = await db
    .from("gallery_albums")
    .insert({ title: "Campus Life", slug: `campus-life-${Date.now().toString(36)}`, published: true, status: "published" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Adds photos (full original URLs, never cropped) to an album, published. */
export async function addPhotosToAlbum(albumId: string, photos: { url: string; caption?: string | null; mediaId?: string }[]) {
  const { data: last, error: lastError } = await db.from("gallery_images").select("sort_order").eq("album_id", albumId).order("sort_order", { ascending: false }).limit(1);
  if (lastError) throw new Error(lastError.message);
  const next = (last?.[0]?.sort_order ?? -1) + 1;
  const rows = photos.map((p, i) => ({
    album_id: albumId,
    image_url: p.url,
    caption: p.caption ?? null,
    media_id: p.mediaId ?? null,
    published: true,
    status: "published",
    sort_order: next + i,
  }));
  for (let o = 0; o < rows.length; o += 100) {
    const { error } = await db.from("gallery_images").insert(rows.slice(o, o + 100));
    if (error) throw new Error(error.message);
  }
  const { data: album } = await db.from("gallery_albums").select("cover_url").eq("id", albumId).maybeSingle();
  if (album && !album.cover_url && rows[0]) await db.from("gallery_albums").update({ cover_url: rows[0].image_url }).eq("id", albumId);
}
