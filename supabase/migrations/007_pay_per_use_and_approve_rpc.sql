-- 001's tools.pricing_model CHECK omits 'pay-per-use', which the catalog and UI use.
ALTER TABLE tools DROP CONSTRAINT IF EXISTS tools_pricing_model_check;
ALTER TABLE tools ADD CONSTRAINT tools_pricing_model_check
  CHECK (pricing_model IN (
    'free',
    'freemium',
    'subscription',
    'one-time',
    'usage-based',
    'contact',
    'pay-per-use'
  ));

-- Claim a pending submission and insert the draft tool in one transaction.
-- If the insert fails, the submission is returned to pending.
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
AS $$
DECLARE
  claimed integer;
  attempt integer;
  use_slug text;
BEGIN
  UPDATE tool_submissions
    SET status = 'approved',
        reviewed_by = p_reviewed_by,
        reviewed_at = now()
    WHERE id = p_submission_id
      AND status = 'pending';

  GET DIAGNOSTICS claimed = ROW_COUNT;
  IF claimed <> 1 THEN
    RETURN 'not_pending';
  END IF;

  use_slug := p_slug;
  FOR attempt IN 1..3 LOOP
    BEGIN
      INSERT INTO tools (
        slug, name, website_url, description, tagline, source_url, status
      ) VALUES (
        use_slug, p_name, p_website_url, p_description, p_tagline, p_source_url, 'draft'
      );
      RETURN 'ok';
    EXCEPTION
      WHEN unique_violation THEN
        use_slug := p_slug || '-' || substr(md5(random()::text), 1, 6);
      WHEN OTHERS THEN
        UPDATE tool_submissions
          SET status = 'pending',
              reviewed_by = NULL,
              reviewed_at = NULL
          WHERE id = p_submission_id;
        RETURN 'draft_failed';
    END;
  END LOOP;

  UPDATE tool_submissions
    SET status = 'pending',
        reviewed_by = NULL,
        reviewed_at = NULL
    WHERE id = p_submission_id;
  RETURN 'draft_failed';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_tool_submission(uuid, uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_tool_submission(uuid, uuid, text, text, text, text, text, text) TO service_role;
