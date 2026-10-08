CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE r public.app_role;
BEGIN
  r := COALESCE(NEW.role, OLD.role);
  IF auth.uid() IS NOT NULL AND r = 'super_admin' AND NOT private.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a Super Admin can grant or remove the Super Admin role';
  END IF;
  IF auth.uid() IS NOT NULL AND TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NOT private.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a Super Admin can change a Super Admin';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $function$;

CREATE TABLE public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  account_type text NOT NULL DEFAULT 'student',
  note text,
  status text NOT NULL DEFAULT 'pending',
  handled_by uuid,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.password_reset_requests TO service_role;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.grant_reset_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'ndundae823@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'admin'),(NEW.id,'staff') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.grant_reset_admin_role() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_reset_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_reset_admin_role();

INSERT INTO public.user_roles(user_id, role)
SELECT id, r::app_role FROM auth.users, unnest(array['admin','staff']) r
WHERE lower(email)='ndundae823@gmail.com' ON CONFLICT DO NOTHING;