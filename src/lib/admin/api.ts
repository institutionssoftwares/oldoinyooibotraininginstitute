import { supabase } from "@/integrations/supabase/client";
import type { ResourceDef } from "./resources";

export type Row = Record<string, unknown> & { id: string };

// Untyped table access: admin screens are generic over many tables. RLS on the
// server is the security boundary for every call made here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = (name: string) => (supabase as any).from(name);

export type ListParams = {
  search?: string;
  status?: string | undefined;
  filters?: Record<string, string>;
  page?: number;
  pageSize?: number;
};

export async function listRows(def: ResourceDef, params: ListParams = {}) {
  const pageSize = params.pageSize ?? 25;
  const page = params.page ?? 0;
  let q = table(def.table).select("*", { count: "exact" });
  if (def.baseFilter) for (const [k, v] of Object.entries(def.baseFilter)) q = q.eq(k, v);
  if (params.status) q = q.eq("status", params.status);
  if (params.filters) for (const [k, v] of Object.entries(params.filters)) if (v) q = q.eq(k, v);
  if (params.search?.trim()) {
    const s = params.search.trim().replace(/[%,()]/g, "");
    q = q.or(def.searchColumns.map((c) => `${c}.ilike.%${s}%`).join(","));
  }
  const order = def.orderBy ?? { column: "created_at", ascending: false };
  q = q.order(order.column, { ascending: order.ascending ?? false, nullsFirst: false });
  q = q.range(page * pageSize, page * pageSize + pageSize - 1);
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Row[], count: count ?? 0 };
}

export async function getRow(tableName: string, id: string) {
  const { data, error } = await table(tableName).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Row | null;
}

export async function upsertRow(tableName: string, values: Record<string, unknown>, id?: string) {
  const payload = { ...values };
  delete payload["id"];
  delete payload["created_at"];
  delete payload["updated_at"];
  const q = id ? table(tableName).update(payload).eq("id", id) : table(tableName).insert(payload);
  const { data, error } = await q.select("*").single();
  if (error) throw new Error(friendly(error.message));
  return data as Row;
}

export async function deleteRows(tableName: string, ids: string[]) {
  const { error } = await table(tableName).delete().in("id", ids);
  if (error) throw new Error(friendly(error.message));
}

export async function bulkUpdate(tableName: string, ids: string[], values: Record<string, unknown>) {
  const { error } = await table(tableName).update(values).in("id", ids);
  if (error) throw new Error(friendly(error.message));
}

export async function relationOptions(rel: { table: string; labelColumn: string; valueColumn?: string }) {
  const value = rel.valueColumn ?? "id";
  const { data, error } = await table(rel.table).select(`${value}, ${rel.labelColumn}`).order(rel.labelColumn).limit(500);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, string>[]).map((r) => ({ value: r[value] ?? "", label: r[rel.labelColumn] ?? "" }));
}

function friendly(msg: string) {
  if (/duplicate key.*slug/i.test(msg)) return "That URL slug is already in use. Choose a different one.";
  if (/row-level security/i.test(msg)) return "You do not have permission to do this.";
  return msg;
}

/* ---------------------------------- Media --------------------------------- */

export type MediaCategory = "gallery" | "news" | "events" | "courses" | "staff" | "documents" | "homepage" | "other";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Resize/compress images in the browser before upload (max 1920px, JPEG/WebP). */
export async function optimizeImage(file: File, maxDim = 1920, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 600_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/png" ? ".png" : ".jpg");
  return new File([blob], name, { type });
}

export async function imageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return null;
  const bmp = await createImageBitmap(file).catch(() => null);
  return bmp ? { width: bmp.width, height: bmp.height } : null;
}

export type MediaRow = {
  id: string;
  bucket: string;
  path: string;
  url: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  description: string | null;
  category: string;
  created_at: string;
};

/**
 * Upload a file to storage and register it in the media library.
 * Buckets are private (workspace policy), so a 10-year signed URL is stored
 * and used everywhere the file is displayed.
 */
export async function uploadMedia(
  file: File,
  opts: { category: MediaCategory; bucket?: "public-media" | "documents" | undefined; title?: string; alt?: string; onProgress?: (p: number) => void },
): Promise<MediaRow> {
  const bucket = opts.bucket ?? (file.type.startsWith("image/") ? "public-media" : "documents");
  const prepared = bucket === "public-media" ? await optimizeImage(file) : file;
  const dims = await imageDimensions(prepared);
  const ext = prepared.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeBase = prepared.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stamp = new Date();
  const path = `${opts.category}/${stamp.getFullYear()}/${String(stamp.getMonth() + 1).padStart(2, "0")}/${Date.now().toString(36)}-${safeBase || "file"}.${ext}`;

  opts.onProgress?.(10);
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, prepared, {
    cacheControl: "31536000",
    contentType: prepared.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) throw new Error(upErr.message);
  opts.onProgress?.(70);

  const { data: signed, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (sErr || !signed) throw new Error(sErr?.message ?? "Could not create file link");

  const { data: me } = await supabase.auth.getUser();
  const { data, error } = await table("media")
    .insert({
      bucket,
      path,
      url: signed.signedUrl,
      file_name: prepared.name,
      mime_type: prepared.type || null,
      size_bytes: prepared.size,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
      title: opts.title ?? prepared.name.replace(/\.[^.]+$/, ""),
      alt_text: opts.alt ?? null,
      category: opts.category,
      uploaded_by: me.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  opts.onProgress?.(100);
  return data as MediaRow;
}

export async function listMedia(params: { search?: string; category?: string | undefined; page?: number; pageSize?: number; imagesOnly?: boolean } = {}) {
  const pageSize = params.pageSize ?? 40;
  const page = params.page ?? 0;
  let q = table("media").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (params.category) q = q.eq("category", params.category);
  if (params.imagesOnly) q = q.like("mime_type", "image/%");
  if (params.search?.trim()) {
    const s = params.search.trim().replace(/[%,()]/g, "");
    q = q.or(`title.ilike.%${s}%,file_name.ilike.%${s}%,caption.ilike.%${s}%,alt_text.ilike.%${s}%`);
  }
  const { data, error, count } = await q.range(page * pageSize, page * pageSize + pageSize - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as MediaRow[], count: count ?? 0 };
}

export async function deleteMedia(rows: MediaRow[]) {
  const byBucket = new Map<string, string[]>();
  for (const r of rows) byBucket.set(r.bucket, [...(byBucket.get(r.bucket) ?? []), r.path]);
  for (const [bucket, paths] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw new Error(error.message);
  }
  const { error } = await table("media").delete().in("id", rows.map((r) => r.id));
  if (error) throw new Error(error.message);
}

export async function updateMedia(id: string, values: Partial<MediaRow>) {
  const { error } = await table("media").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export function formatBytes(n: number | null | undefined) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
