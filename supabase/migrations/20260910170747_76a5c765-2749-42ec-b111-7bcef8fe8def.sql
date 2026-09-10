DROP POLICY IF EXISTS applications_public_insert ON public.applications;
REVOKE INSERT, SELECT, UPDATE, DELETE ON public.applications FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.application_ref_seq TO service_role, authenticated;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('submitted','under_review','accepted','rejected','waitlisted'));

CREATE INDEX IF NOT EXISTS applications_reference_phone_idx ON public.applications (reference, phone);
CREATE INDEX IF NOT EXISTS applications_status_created_idx ON public.applications (status, created_at DESC);