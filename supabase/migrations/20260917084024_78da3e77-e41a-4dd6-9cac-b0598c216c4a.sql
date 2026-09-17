-- Move SECURITY DEFINER role helpers out of the API-exposed public schema.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.is_admin(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_staff(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_portal_staff(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_manage_content(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_manage_admissions(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_manage_academics(uuid) SET SCHEMA private;

-- Existing RLS policies keep working: they reference these functions by OID.
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION private.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION private.is_portal_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION private.can_manage_content(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION private.can_manage_admissions(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION private.can_manage_academics(uuid) FROM anon;

-- The app asks "am I staff?" over the Data API. Keep that available, but as a
-- SECURITY INVOKER function so it can only ever see rows RLS already allows.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','super_admin','staff')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;