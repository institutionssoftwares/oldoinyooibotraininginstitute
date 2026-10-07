ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS is_submission boolean NOT NULL DEFAULT false;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS submitter_name text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS submitter_phone text;