CREATE OR REPLACE FUNCTION public.content_is_live(_status text, _publish_at timestamptz)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT _status = 'published' OR (_status = 'scheduled' AND _publish_at IS NOT NULL AND _publish_at <= now());
$$;