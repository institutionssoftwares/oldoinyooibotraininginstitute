GRANT SELECT ON public.password_reset_requests TO authenticated;
GRANT ALL ON public.password_reset_requests TO service_role;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY reset_requests_admin_read ON public.password_reset_requests FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));