-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM ('admin','staff','trainer','student','applicant');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_staff" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "user_roles_select_own_or_staff" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_staff_manage" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ DEPARTMENTS ============
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  head_name text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  published boolean NOT NULL DEFAULT true,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_public_read" ON public.departments FOR SELECT TO anon, authenticated
  USING (published AND NOT archived);
CREATE POLICY "departments_staff_manage" ON public.departments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COURSES ============
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  course_code text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'Technical',
  description text,
  duration text,
  entry_requirement text,
  minimum_grade text,
  exam_body text,
  level text,
  units jsonb NOT NULL DEFAULT '[]'::jsonb,
  fee numeric,
  mode_of_study text,
  intake text,
  instructor text,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  accepting_applications boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  archived boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT TO anon, authenticated
  USING (published AND NOT archived);
CREATE POLICY "courses_staff_manage" ON public.courses FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NEWS ============
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  image_url text,
  category text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news_posts FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "news_staff_manage" ON public.news_posts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER news_updated_at BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EVENTS ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  image_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON public.events FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "events_staff_manage" ON public.events FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ GALLERY ============
CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_albums TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "albums_public_read" ON public.gallery_albums FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "albums_staff_manage" ON public.gallery_albums FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_images_public_read" ON public.gallery_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.published));
CREATE POLICY "gallery_images_staff_manage" ON public.gallery_images FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ DOCUMENTS / DOWNLOADS ============
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_public_read" ON public.documents FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "documents_staff_manage" ON public.documents FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ STAFF DIRECTORY ============
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  bio text,
  photo_url text,
  email text,
  phone text,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_public_read" ON public.staff_profiles FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "staff_staff_manage" ON public.staff_profiles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ FAQS & SUCCESS STORIES ============
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "faqs_staff_manage" ON public.faqs FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  course_name text,
  story text NOT NULL,
  photo_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.success_stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.success_stories TO authenticated;
GRANT ALL ON public.success_stories TO service_role;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories_public_read" ON public.success_stories FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "stories_staff_manage" ON public.success_stories FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ APPLICATIONS ============
CREATE SEQUENCE public.application_ref_seq START 1000;

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('OOTI-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.application_ref_seq')::text, 5, '0')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  national_id text,
  date_of_birth date,
  gender text,
  county text,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  course_name text,
  intake text,
  previous_school text,
  highest_qualification text,
  mean_grade text,
  guardian_name text,
  guardian_phone text,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
GRANT USAGE ON SEQUENCE public.application_ref_seq TO anon, authenticated, service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_public_insert" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "applications_select_own_or_staff" ON public.applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "applications_staff_manage" ON public.applications FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CONTACT MESSAGES ============
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  subject text,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_staff_manage" ON public.contact_messages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ SEED DATA ============
INSERT INTO public.site_settings (key, value) VALUES
 ('institution', '{"name":"Oldoinyo Oibor Training Institute","short_name":"OOTI","location":"Loitokitok Town, behind KPLC","phone":"0748573166","whatsapp":"254748573166","email":"oldoinyooiborti@gmail.com","motto":"We lead, inspire and bring difference.","mission":"TO PROVIDE QUALITY TECHNICAL AND VOCATIONAL EDUCATION, TRAINING AND COMPETENCIES THAT EQUIPS TRAINEES WITH KNOWLEDGE, SKILLS, VALUES AND ATTITUDES RELEVANT FOR THE LABOUR MARKET LOCALLY AND GLOBALLY.","vision":"TO BE A LEADING CENTRE OF EXCELLENCE IN THE PROVISION OF QUALITY TECHNICAL, VOCATIONAL AND EDUCATIONAL TRAINING."}'::jsonb);

INSERT INTO public.departments (name, slug, description, sort_order) VALUES
 ('Department of Building / Plumbing','building-plumbing','Practical training in plumbing and building services, from artisan grades to competency-based levels.',1),
 ('Department of Cosmetology','cosmetology','Hands-on beauty therapy, hairdressing and grooming training for employment and self-employment.',2),
 ('Department of Electrical Engineering','electrical-engineering','Electrical installation and engineering training aligned to NITA and CDACC standards.',3),
 ('Department of Computing and Informatics','computing-informatics','Information technology, computing and programming training for the digital economy.',4),
 ('Digital Skills','digital-skills','Practical digital skills for employment, freelancing, entrepreneurship and the modern workplace.',5);

INSERT INTO public.courses (name, slug, department_id, category, duration, minimum_grade, exam_body, sort_order)
SELECT c.name, c.slug, d.id, c.category, c.duration, c.grade, c.body, c.ord
FROM (VALUES
 ('Plumbing Grade III','plumbing-grade-iii','building-plumbing','Technical','6 Months','Open','NITA',1),
 ('Plumbing Grade II','plumbing-grade-ii','building-plumbing','Technical','6 Months','Open','NITA',2),
 ('Plumbing Grade I','plumbing-grade-i','building-plumbing','Technical','9 Months','Open','NITA',3),
 ('Plumbing Level 3','plumbing-level-3','building-plumbing','Technical','6 Months','Open','CDACC',4),
 ('Plumbing Level 4','plumbing-level-4','building-plumbing','Technical','6 Months','D-','CDACC',5),
 ('Plumbing Level 5','plumbing-level-5','building-plumbing','Technical','1 Year','D','CDACC',6),
 ('Plumbing Level 6','plumbing-level-6','building-plumbing','Technical','2 Years','C-','CDACC',7),
 ('COS Grade III','cos-grade-iii','cosmetology','Vocational','6 Months','Open','NITA',1),
 ('COS Grade II','cos-grade-ii','cosmetology','Vocational','6 Months','Open','NITA',2),
 ('COS Grade I','cos-grade-i','cosmetology','Vocational','9 Months','Open','NITA',3),
 ('COS Level 3','cos-level-3','cosmetology','Vocational','6 Months','Open','CDACC',4),
 ('COS Level 4','cos-level-4','cosmetology','Vocational','6 Months','D-','CDACC',5),
 ('COS Level 5','cos-level-5','cosmetology','Vocational','1 Year','D','CDACC',6),
 ('COS Level 6','cos-level-6','cosmetology','Vocational','2 Years','C-','CDACC',7),
 ('Electrical Grade III','electrical-grade-iii','electrical-engineering','Technical','6 Months','Open','NITA',1),
 ('Electrical Grade II','electrical-grade-ii','electrical-engineering','Technical','6 Months','Open','NITA',2),
 ('Electrical Grade I','electrical-grade-i','electrical-engineering','Technical','9 Months','Open','NITA',3),
 ('Electrical Level 3','electrical-level-3','electrical-engineering','Technical','6 Months','Open','CDACC',4),
 ('Electrical Level 4','electrical-level-4','electrical-engineering','Technical','6 Months','D-','CDACC',5),
 ('Electrical Level 5','electrical-level-5','electrical-engineering','Technical','1 Year','D','CDACC',6),
 ('Electrical Level 6','electrical-level-6','electrical-engineering','Technical','2 Years','C-','CDACC',7),
 ('Computer Operator','computer-operator','computing-informatics','Computing','3 Months','Open','NITA',1),
 ('Computer Programming','computer-programming','computing-informatics','Computing','30 Hours Per Unit','Open','CDACC',2),
 ('ICT Level 5','ict-level-5','computing-informatics','Computing','2 Years','D+','CDACC',3),
 ('ICT Level 6','ict-level-6','computing-informatics','Computing','3 Years','C-','CDACC',4),
 ('Graphic','graphic','computing-informatics','Computing','3 Months','Open','CDACC',5),
 ('Operating Systems','operating-systems','computing-informatics','Computing','30 Hours Per Unit','Open','CDACC',6),
 ('Scripting','scripting','computing-informatics','Computing','2 Months','Open','CDACC',7),
 ('Computer Aided Design','computer-aided-design','computing-informatics','Computing','30 Hours Per Unit','Open','CDACC',8)
) AS c(name, slug, dept, category, duration, grade, body, ord)
JOIN public.departments d ON d.slug = c.dept;

INSERT INTO public.courses (name, slug, category, sort_order) VALUES
 ('Computer Packages','computer-packages','Short Course',1),
 ('Artificial Intelligence','artificial-intelligence-short','Short Course',2),
 ('Barbering','barbering','Short Course',3),
 ('Dreadlocks Styling','dreadlocks-styling','Short Course',4),
 ('Waxing','waxing','Short Course',5),
 ('Gel Polish','gel-polish','Short Course',6),
 ('Nail Art','nail-art','Short Course',7),
 ('Manicure & Pedicure','manicure-pedicure','Short Course',8);

INSERT INTO public.courses (name, slug, department_id, category, sort_order)
SELECT c.name, c.slug, d.id, 'Digital Skills', c.ord
FROM (VALUES
 ('Computer Packages (Digital Skills)','digital-computer-packages',1),
 ('Graphic Design','graphic-design',2),
 ('Website Development','website-development',3),
 ('Software Development','software-development',4),
 ('Digital Marketing','digital-marketing',5),
 ('Digital Freelancing Training & Mentorship','digital-freelancing',6),
 ('Artificial Intelligence (AI)','artificial-intelligence',7),
 ('Coding & Programming','coding-programming',8),
 ('Social Media Management','social-media-management',9),
 ('Content Creation','content-creation',10),
 ('Cybersecurity Basics','cybersecurity-basics',11),
 ('Virtual Assistance','virtual-assistance',12),
 ('Mobile App Development','mobile-app-development',13),
 ('Resume & Portfolio Building','resume-portfolio-building',14),
 ('Online Branding & Personal Branding','online-personal-branding',15),
 ('Digital Entrepreneurship','digital-entrepreneurship',16)
) AS c(name, slug, ord)
CROSS JOIN LATERAL (SELECT id FROM public.departments WHERE slug='digital-skills') d;