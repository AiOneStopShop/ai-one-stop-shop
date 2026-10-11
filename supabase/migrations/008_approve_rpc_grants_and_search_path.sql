-- 007 revoked EXECUTE only FROM PUBLIC. Supabase also grants new functions
-- to anon and authenticated. Recreate with an empty search_path and lock
-- execute to service_role.

CREATE OR REPLACE FUNCTION public.approve_tool_submission(
  p_submission_id uuid,
  p_reviewed_by uuid,
  p_slug text,
  p_name text,
  p_website_url text,
  p_description text,
  p_tagline text,
  p_source_url text
) RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  claimed integer;
  attempt integer;
  use_slug text;
BEGIN
  UPDATE public.tool_submissions
    SET status = 'approved',
        reviewed_by = p_reviewed_by,
        reviewed_at = pg_catalog.now()
    WHERE id = p_submission_id
      AND status = 'pending';

  GET DIAGNOSTICS claimed = ROW_COUNT;
  IF claimed <> 1 THEN
    RETURN 'not_pending';
  END IF;

  use_slug := p_slug;
  FOR attempt IN 1..3 LOOP
    BEGIN
      INSERT INTO public.tools (
        slug, name, website_url, description, tagline, source_url, status
      ) VALUES (
        use_slug, p_name, p_website_url, p_description, p_tagline, p_source_url, 'draft'
      );
      RETURN 'ok';
    EXCEPTION
      WHEN unique_violation THEN
        use_slug := p_slug || '-' || pg_catalog.substr(pg_catalog.md5(pg_catalog.random()::text), 1, 6);
      WHEN OTHERS THEN
        UPDATE public.tool_submissions
          SET status = 'pending',
              reviewed_by = NULL,
              reviewed_at = NULL
          WHERE id = p_submission_id;
        RETURN 'draft_failed';
    END;
  END LOOP;

  UPDATE public.tool_submissions
    SET status = 'pending',
        reviewed_by = NULL,
        reviewed_at = NULL
    WHERE id = p_submission_id;
  RETURN 'draft_failed';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_tool_submission(uuid, uuid, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_tool_submission(uuid, uuid, text, text, text, text, text, text) TO service_role;
