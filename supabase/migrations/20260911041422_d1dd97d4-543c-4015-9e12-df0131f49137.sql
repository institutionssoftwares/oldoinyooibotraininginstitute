-- ===== Role helper functions =====
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin','staff'));
$$;
CREATE OR REPLACE FUNCTION public.can_manage_content(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin','staff','content_manager'));
$$;
CREATE OR REPLACE FUNCTION public.can_manage_admissions(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin','staff','admissions_officer'));
$$;
CREATE OR REPLACE FUNCTION public.can_manage_academics(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin','staff','academic_officer'));
$$;
CREATE OR REPLACE FUNCTION public.is_portal_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin','staff','content_manager','finance_officer','admissions_officer','academic_officer','trainer'));
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid), public.can_manage_content(uuid), public.can_manage_admissions(uuid), public.can_manage_academics(uuid), public.is_portal_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid), public.can_manage_content(uuid), public.can_manage_admissions(uuid), public.can_manage_academics(uuid), public.is_portal_staff(uuid) TO authenticated, service_role;

-- Live-content helper
CREATE OR REPLACE FUNCTION public.content_is_live(_status text, _publish_at timestamptz)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT _status = 'published' OR (_status = 'scheduled' AND _publish_at IS NOT NULL AND _publish_at <= now());
$$;

-- Keep legacy published/archived booleans in sync with status
CREATE OR REPLACE FUNCTION public.sync_content_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS NULL THEN NEW.status := 'draft'; END IF;
  NEW.published := (NEW.status = 'published');
  NEW.archived := (NEW.status = 'archived');
  RETURN NEW;
END; $$;

-- Audit logging
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  content_type text NOT NULL,
  content_id text,
  summary text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_content_idx ON public.audit_logs (content_type, content_id);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rec jsonb;
  rid text;
  summ text;
  uemail text;
BEGIN
  rec := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  rid := COALESCE(rec->>'id', rec->>'key');
  summ := COALESCE(rec->>'title', rec->>'name', rec->>'full_name', rec->>'question', rec->>'student_name', rec->>'file_name', rec->>'key', rec->>'caption');
  SELECT email INTO uemail FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.audit_logs (user_id, user_email, action, content_type, content_id, summary, details)
  VALUES (
    auth.uid(), uemail, lower(TG_OP), TG_TABLE_NAME, rid, summ,
    CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('status_before', to_jsonb(OLD)->>'status', 'status_after', to_jsonb(NEW)->>'status') ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END; $$;
REVOKE EXECUTE ON FUNCTION public.log_content_change() FROM PUBLIC, anon, authenticated;

-- ===== Media library =====
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'public-media',
  path text NOT NULL,
  url text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  title text,
  description text,
  caption text,
  alt_text text,
  category text NOT NULL DEFAULT 'other',
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);
CREATE INDEX media_category_idx ON public.media (category, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT SELECT ON public.media TO anon;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_public_read ON public.media FOR SELECT TO anon, authenticated USING (bucket IN ('public-media','documents'));
CREATE POLICY media_content_manage ON public.media FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER media_audit AFTER INSERT OR UPDATE OR DELETE ON public.media FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== News =====
CREATE TABLE public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_categories TO authenticated;
GRANT ALL ON public.news_categories TO service_role;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY news_categories_read ON public.news_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY news_categories_manage ON public.news_categories FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
INSERT INTO public.news_categories (name, slug) VALUES
 ('General','general'),('Admissions','admissions'),('Events','events'),('Achievements','achievements'),('Community','community'),('Digital Skills','digital-skills')
ON CONFLICT DO NOTHING;

ALTER TABLE public.news_posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS og_image_url text;
UPDATE public.news_posts SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.news_posts ADD CONSTRAINT news_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
CREATE INDEX IF NOT EXISTS news_status_idx ON public.news_posts (status, publish_at, published_at DESC);
DROP POLICY IF EXISTS news_public_read ON public.news_posts;
DROP POLICY IF EXISTS news_staff_manage ON public.news_posts;
CREATE POLICY news_public_read ON public.news_posts FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY news_content_manage ON public.news_posts FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER news_sync_status BEFORE INSERT OR UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER news_audit AFTER INSERT OR UPDATE OR DELETE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Events =====
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS registration_link text,
  ADD COLUMN IF NOT EXISTS contact_info text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;
UPDATE public.events SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.events ADD CONSTRAINT events_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events (status, starts_at);
DROP POLICY IF EXISTS events_public_read ON public.events;
DROP POLICY IF EXISTS events_staff_manage ON public.events;
CREATE POLICY events_public_read ON public.events FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY events_content_manage ON public.events FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER events_sync_status BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER events_audit AFTER INSERT OR UPDATE OR DELETE ON public.events FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX event_registrations_event_idx ON public.event_registrations (event_id, created_at DESC);
GRANT INSERT ON public.event_registrations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_reg_public_insert ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY event_reg_staff_manage ON public.event_registrations FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));

-- ===== Gallery =====
ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS location text;
UPDATE public.gallery_albums SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.gallery_albums ADD CONSTRAINT albums_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS albums_public_read ON public.gallery_albums;
DROP POLICY IF EXISTS albums_staff_manage ON public.gallery_albums;
CREATE POLICY albums_public_read ON public.gallery_albums FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY albums_content_manage ON public.gallery_albums FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER albums_sync_status BEFORE INSERT OR UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER albums_audit AFTER INSERT OR UPDATE OR DELETE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS taken_at date,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.gallery_images ADD CONSTRAINT images_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
CREATE INDEX IF NOT EXISTS gallery_images_album_idx ON public.gallery_images (album_id, sort_order);
DROP POLICY IF EXISTS gallery_images_public_read ON public.gallery_images;
DROP POLICY IF EXISTS gallery_images_staff_manage ON public.gallery_images;
CREATE POLICY gallery_images_public_read ON public.gallery_images FOR SELECT TO anon, authenticated
  USING (public.content_is_live(status, publish_at) AND EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = gallery_images.album_id AND public.content_is_live(a.status, a.publish_at)));
CREATE POLICY gallery_images_content_manage ON public.gallery_images FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER images_sync_status BEFORE INSERT OR UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER images_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER images_audit AFTER INSERT OR UPDATE OR DELETE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Announcements =====
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  audience text NOT NULL DEFAULT 'public',
  priority text NOT NULL DEFAULT 'normal',
  image_url text,
  attachment_url text,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','unpublished','archived')),
  publish_at timestamptz,
  published boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX announcements_live_idx ON public.announcements (status, audience, starts_at DESC);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_public_read ON public.announcements FOR SELECT TO anon, authenticated
  USING (audience = 'public' AND public.content_is_live(status, publish_at) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY announcements_portal_read ON public.announcements FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND audience IN ('students','staff','trainers') AND public.content_is_live(status, publish_at) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY announcements_content_manage ON public.announcements FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER announcements_sync_status BEFORE INSERT OR UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER announcements_audit AFTER INSERT OR UPDATE OR DELETE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Testimonials =====
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  photo_url text,
  testimonial text NOT NULL,
  course_name text,
  year text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','unpublished','archived')),
  publish_at timestamptz,
  published boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY testimonials_public_read ON public.testimonials FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY testimonials_content_manage ON public.testimonials FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER testimonials_sync_status BEFORE INSERT OR UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER testimonials_audit AFTER INSERT OR UPDATE OR DELETE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Homepage sections =====
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  body text,
  image_url text,
  cta_label text,
  cta_link text,
  secondary_cta_label text,
  secondary_cta_link text,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY homepage_public_read ON public.homepage_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY homepage_content_manage ON public.homepage_sections FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER homepage_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER homepage_audit AFTER INSERT OR UPDATE OR DELETE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.log_content_change();
INSERT INTO public.homepage_sections (key, title, subtitle, body, cta_label, cta_link, secondary_cta_label, secondary_cta_link, sort_order) VALUES
 ('hero', 'Skills that build futures in Loitokitok', 'Oldoinyo Oibor Training Institute', 'Accredited technical, vocational and digital skills training behind KPLC, Loitokitok Town.', 'Apply Now', '/apply', 'Explore Courses', '/courses', 1),
 ('about', 'About OOTI', 'Who we are', NULL, 'Learn more', '/about', NULL, NULL, 2),
 ('why', 'Why choose OOTI', 'Practical, accredited, affordable', NULL, NULL, NULL, NULL, NULL, 3),
 ('departments', 'Our departments', 'Five departments, one campus', NULL, 'All departments', '/departments', NULL, NULL, 4),
 ('courses', 'Featured courses', 'Popular programmes', NULL, 'View all courses', '/courses', NULL, NULL, 5),
 ('digital', 'Digital skills', 'Future-ready training', NULL, 'Browse digital skills', '/digital-skills', NULL, NULL, 6),
 ('admissions', 'Admissions are open', 'Join OOTI', 'Apply online in minutes or visit the campus office.', 'Apply online', '/apply', 'Admissions info', '/admissions', 7),
 ('news', 'Latest news', 'From the campus', NULL, 'All news', '/news', NULL, NULL, 8),
 ('events', 'Upcoming events', 'Mark your calendar', NULL, 'All events', '/events', NULL, NULL, 9),
 ('gallery', 'Campus gallery', 'Life at OOTI', NULL, 'View gallery', '/gallery', NULL, NULL, 10),
 ('testimonials', 'What our students say', 'Testimonials', NULL, NULL, NULL, NULL, NULL, 11),
 ('success', 'Student success', 'Graduate stories', NULL, 'More stories', '/student-success', NULL, NULL, 12),
 ('contact', 'Talk to us', 'Visit, call or WhatsApp', NULL, 'Contact us', '/contact', NULL, NULL, 13)
ON CONFLICT (key) DO NOTHING;

-- ===== Courses / Departments =====
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published', ADD COLUMN IF NOT EXISTS publish_at timestamptz, ADD COLUMN IF NOT EXISTS og_image_url text;
UPDATE public.courses SET status = CASE WHEN archived THEN 'archived' WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.courses ADD CONSTRAINT courses_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS courses_public_read ON public.courses;
DROP POLICY IF EXISTS courses_staff_manage ON public.courses;
CREATE POLICY courses_public_read ON public.courses FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY courses_content_manage ON public.courses FOR ALL TO authenticated USING (public.can_manage_content(auth.uid()) OR public.can_manage_academics(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()) OR public.can_manage_academics(auth.uid()));
CREATE TRIGGER courses_sync_status BEFORE INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER courses_audit AFTER INSERT OR UPDATE OR DELETE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published', ADD COLUMN IF NOT EXISTS publish_at timestamptz;
UPDATE public.departments SET status = CASE WHEN archived THEN 'archived' WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.departments ADD CONSTRAINT departments_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS departments_public_read ON public.departments;
DROP POLICY IF EXISTS departments_staff_manage ON public.departments;
CREATE POLICY departments_public_read ON public.departments FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY departments_content_manage ON public.departments FOR ALL TO authenticated USING (public.can_manage_content(auth.uid()) OR public.can_manage_academics(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()) OR public.can_manage_academics(auth.uid()));
CREATE TRIGGER departments_sync_status BEFORE INSERT OR UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER departments_audit AFTER INSERT OR UPDATE OR DELETE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Staff directory =====
ALTER TABLE public.staff_profiles
  ADD COLUMN IF NOT EXISTS staff_number text,
  ADD COLUMN IF NOT EXISTS specialization text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
UPDATE public.staff_profiles SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.staff_profiles ADD CONSTRAINT staff_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS staff_public_read ON public.staff_profiles;
DROP POLICY IF EXISTS staff_staff_manage ON public.staff_profiles;
CREATE POLICY staff_public_read ON public.staff_profiles FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY staff_content_manage ON public.staff_profiles FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER staff_sync_status BEFORE INSERT OR UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER staff_audit AFTER INSERT OR UPDATE OR DELETE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Success stories =====
ALTER TABLE public.success_stories
  ADD COLUMN IF NOT EXISTS graduation_year text,
  ADD COLUMN IF NOT EXISTS achievement text,
  ADD COLUMN IF NOT EXISTS quote text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_obtained boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.success_stories SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.success_stories ADD CONSTRAINT stories_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS stories_public_read ON public.success_stories;
DROP POLICY IF EXISTS stories_staff_manage ON public.success_stories;
CREATE POLICY stories_public_read ON public.success_stories FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at) AND consent_obtained);
CREATE POLICY stories_content_manage ON public.success_stories FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER stories_sync_status BEFORE INSERT OR UPDATE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER stories_updated_at BEFORE UPDATE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER stories_audit AFTER INSERT OR UPDATE OR DELETE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== FAQs =====
ALTER TABLE public.faqs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.faqs SET status = CASE WHEN published THEN 'published' ELSE 'draft' END;
ALTER TABLE public.faqs ADD CONSTRAINT faqs_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS faqs_public_read ON public.faqs;
DROP POLICY IF EXISTS faqs_staff_manage ON public.faqs;
CREATE POLICY faqs_public_read ON public.faqs FOR SELECT TO anon, authenticated USING (public.content_is_live(status, publish_at));
CREATE POLICY faqs_content_manage ON public.faqs FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER faqs_sync_status BEFORE INSERT OR UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.sync_content_status();
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER faqs_audit AFTER INSERT OR UPDATE OR DELETE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Documents =====
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS size_bytes bigint,
  ADD COLUMN IF NOT EXISTS media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
UPDATE public.documents SET visibility = CASE WHEN is_public THEN 'public' ELSE 'staff' END;
ALTER TABLE public.documents ADD CONSTRAINT documents_visibility_check CHECK (visibility IN ('public','students','staff','admin'));
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check CHECK (status IN ('draft','published','scheduled','unpublished','archived'));
DROP POLICY IF EXISTS documents_public_read ON public.documents;
DROP POLICY IF EXISTS documents_staff_manage ON public.documents;
CREATE POLICY documents_public_read ON public.documents FOR SELECT TO anon, authenticated USING (visibility = 'public' AND public.content_is_live(status, publish_at));
CREATE POLICY documents_students_read ON public.documents FOR SELECT TO authenticated USING (visibility = 'students' AND public.content_is_live(status, publish_at) AND (public.has_role(auth.uid(), 'student') OR public.is_portal_staff(auth.uid())));
CREATE POLICY documents_staff_read ON public.documents FOR SELECT TO authenticated USING (visibility = 'staff' AND public.content_is_live(status, publish_at) AND public.is_portal_staff(auth.uid()));
CREATE POLICY documents_admin_read ON public.documents FOR SELECT TO authenticated USING (visibility = 'admin' AND public.is_admin(auth.uid()));
CREATE POLICY documents_content_manage ON public.documents FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER documents_audit AFTER INSERT OR UPDATE OR DELETE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Site settings: admins only =====
DROP POLICY IF EXISTS site_settings_staff_manage ON public.site_settings;
CREATE POLICY site_settings_admin_manage ON public.site_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER site_settings_audit AFTER INSERT OR UPDATE OR DELETE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Contact messages: content + admissions staff =====
DROP POLICY IF EXISTS contact_staff_manage ON public.contact_messages;
CREATE POLICY contact_staff_manage ON public.contact_messages FOR ALL TO authenticated USING (public.is_staff(auth.uid()) OR public.can_manage_admissions(auth.uid())) WITH CHECK (public.is_staff(auth.uid()) OR public.can_manage_admissions(auth.uid()));

-- ===== Applications: admissions staff + interview stage =====
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS interview_at timestamptz,
  ADD COLUMN IF NOT EXISTS interview_location text,
  ADD COLUMN IF NOT EXISTS interview_notes text,
  ADD COLUMN IF NOT EXISTS interview_score integer,
  ADD COLUMN IF NOT EXISTS staff_notes text;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check CHECK (status IN ('submitted','under_review','interview_scheduled','interviewed','accepted','rejected','waitlisted'));
DROP POLICY IF EXISTS applications_select_own_or_staff ON public.applications;
DROP POLICY IF EXISTS applications_staff_manage ON public.applications;
CREATE POLICY applications_select_own_or_staff ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.can_manage_admissions(auth.uid()));
CREATE POLICY applications_admissions_manage ON public.applications FOR ALL TO authenticated USING (public.can_manage_admissions(auth.uid())) WITH CHECK (public.can_manage_admissions(auth.uid()));
CREATE TRIGGER applications_audit AFTER UPDATE OR DELETE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Profiles / roles: admin visibility, super admin protection =====
DROP POLICY IF EXISTS profiles_select_own_or_staff ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own_or_staff ON public.profiles;
CREATE POLICY profiles_select_own_or_staff ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()) OR public.can_manage_admissions(auth.uid()));
CREATE POLICY profiles_update_own_or_admin ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS user_roles_admin_manage ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select_own_or_staff ON public.user_roles;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
CREATE POLICY user_roles_select_own_or_staff ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY user_roles_admin_manage ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role;
BEGIN
  r := COALESCE(NEW.role, OLD.role);
  IF r = 'super_admin' AND NOT public.has_role(auth.uid(), 'super_admin') AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Only a Super Admin can grant or remove the Super Admin role';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NOT public.has_role(auth.uid(), 'super_admin') AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Only a Super Admin can change a Super Admin';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
REVOKE EXECUTE ON FUNCTION public.protect_super_admin_role() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER user_roles_protect_super BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin_role();
CREATE TRIGGER user_roles_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- ===== Storage policies (buckets created via tool) =====
CREATE POLICY "public media read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id IN ('public-media','documents'));
CREATE POLICY "content managers upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('public-media','documents') AND public.can_manage_content(auth.uid()));
CREATE POLICY "content managers update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('public-media','documents') AND public.can_manage_content(auth.uid()));
CREATE POLICY "content managers delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('public-media','documents') AND public.can_manage_content(auth.uid()));
CREATE POLICY "private student docs own or staff read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'private-student-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));
CREATE POLICY "private student docs own or staff write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'private-student-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));
CREATE POLICY "private student docs staff delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'private-student-documents' AND public.is_staff(auth.uid()));