import { createServerFn } from "@tanstack/react-start";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const MAX_FILES = 10;
const MAX_BYTES = 8 * 1024 * 1024;

/** Public: anyone can send institution photos; they stay hidden until an admin approves them. */
export const submitGalleryPhotos = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid form");
    const name = String(data.get("name") ?? "").trim().slice(0, 120);
    const phone = String(data.get("phone") ?? "").trim().slice(0, 30);
    const caption = String(data.get("caption") ?? "").trim().slice(0, 300);
    const files = data.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (name.length < 2) throw new Error("Please enter your name.");
    if (!files.length) throw new Error("Please choose at least one photo.");
    if (files.length > MAX_FILES) throw new Error(`You can send up to ${MAX_FILES} photos at a time.`);
    for (const f of files) {
      if (!f.type.startsWith("image/")) throw new Error(`${f.name} is not a photo.`);
      if (f.size > MAX_BYTES) throw new Error(`${f.name} is larger than 8 MB.`);
    }
    return { name, phone, caption, files };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let count = 0;
    for (const file of data.files) {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `submissions/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("public-media")
        .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      if (upErr) throw new Error("Upload failed, please try again.");
      const { data: signed } = await supabaseAdmin.storage.from("public-media").createSignedUrl(path, TEN_YEARS);
      if (!signed) throw new Error("Upload failed, please try again.");
      const { error } = await supabaseAdmin.from("gallery_images").insert({
        image_url: signed.signedUrl,
        caption: data.caption || null,
        status: "draft",
        published: false,
        is_submission: true,
        submitter_name: data.name,
        submitter_phone: data.phone || null,
      });
      if (error) throw new Error("Could not save photo, please try again.");
      count++;
    }
    return { count };
  });
