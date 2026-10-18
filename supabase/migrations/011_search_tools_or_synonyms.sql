-- 010's first apply AND-ed synonym terms. Recreate so expanded terms are OR'd.
CREATE OR REPLACE FUNCTION public.search_tools(
  q text DEFAULT NULL,
  category text DEFAULT NULL,
  price text DEFAULT NULL,
  free_only boolean DEFAULT false,
  "limit" integer DEFAULT 50,
  "offset" integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  tagline text,
  description text,
  website_url text,
  pricing_summary text,
  pricing_model text,
  has_free_tier boolean,
  platforms text[],
  features text[],
  logo_url text,
  editorial_score integer,
  editorial_why text,
  source_url text,
  last_verified_at timestamptz,
  status text,
  is_sponsored boolean,
  created_at timestamptz,
  updated_at timestamptz,
  tags text[],
  search_rank double precision,
  result_total integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_raw text;
  v_safe text;
  v_expanded text;
  v_tsquery pg_catalog.tsquery;
  v_limit integer;
  v_offset integer;
  v_category text;
  v_price text;
  v_free boolean;
BEGIN
  v_raw := pg_catalog.left(pg_catalog.btrim(COALESCE(q, ''::text)), 100);
  v_safe := pg_catalog.regexp_replace(v_raw, '[&|!:*()<>''"]', ' ', 'g');
  v_safe := pg_catalog.regexp_replace(v_safe, '\s+', ' ', 'g');
  v_safe := pg_catalog.btrim(v_safe);
  v_expanded := v_safe;

  IF v_safe ~* '\mwriting\M' THEN
    v_expanded := v_expanded || ' copy content grammar copywriting copywriter';
  END IF;
  IF v_safe ~* '\mcopy\M' THEN
    v_expanded := v_expanded || ' writing content copywriting';
  END IF;
  IF v_safe ~* '\mcontent\M' THEN
    v_expanded := v_expanded || ' writing copy';
  END IF;
  IF v_safe ~* '\mgrammar\M' THEN
    v_expanded := v_expanded || ' writing';
  END IF;
  IF v_safe ~* '\mimage\M' OR v_safe ~* '\mart\M' THEN
    v_expanded := v_expanded || ' image art generation generate images';
  END IF;
  IF v_safe ~* '\mcode\M' OR v_safe ~* '\mcoding\M' THEN
    v_expanded := v_expanded || ' code coding developer development copilot programmer';
  END IF;
  IF v_safe ~* '\mvideo\M' THEN
    v_expanded := v_expanded || ' video film podcast recording';
  END IF;
  IF v_safe ~* '\mvoice\M' OR v_safe ~* '\maudio\M' THEN
    v_expanded := v_expanded || ' voice audio speech tts cloning podcast';
  END IF;
  IF v_safe ~* '\mchatbot\M' OR v_safe ~* '\massistant\M' THEN
    v_expanded := v_expanded || ' chatbot assistant chat';
  END IF;

  v_tsquery := NULL;
  IF v_expanded <> '' THEN
    BEGIN
      v_tsquery := pg_catalog.websearch_to_tsquery(
        'english'::regconfig,
        pg_catalog.regexp_replace(v_expanded, '\s+', ' or ', 'g')
      );
    EXCEPTION WHEN OTHERS THEN
      v_tsquery := NULL;
    END;
  END IF;

  v_limit := LEAST(GREATEST(COALESCE("limit", 50), 1), 50);
  v_offset := GREATEST(COALESCE("offset", 0), 0);
  v_category := NULLIF(pg_catalog.btrim(COALESCE(category, ''::text)), 'all'::text);
  v_price := NULLIF(pg_catalog.btrim(COALESCE(price, ''::text)), 'all'::text);
  v_free := COALESCE(free_only, false);

  RETURN QUERY
  SELECT
    t.id,
    t.slug,
    t.name,
    t.tagline,
    t.description,
    t.website_url,
    t.pricing_summary,
    t.pricing_model,
    t.has_free_tier,
    t.platforms,
    t.features,
    t.logo_url,
    t.editorial_score,
    t.editorial_why,
    t.source_url,
    t.last_verified_at,
    t.status,
    t.is_sponsored,
    t.created_at,
    t.updated_at,
    t.tags,
    (
      CASE
        WHEN v_tsquery IS NULL THEN 0::double precision
        ELSE COALESCE(pg_catalog.ts_rank_cd(t.search_vector, v_tsquery), 0::real) * 2.0
      END
      + CASE
          WHEN v_safe = '' THEN 0::double precision
          ELSE GREATEST(
            extensions.similarity(t.name, v_safe),
            extensions.word_similarity(v_safe, t.name)
          )
        END
      + CASE
          WHEN v_safe = '' THEN 0::double precision
          ELSE 0.5 * extensions.similarity(COALESCE(t.tagline, ''::text), v_safe)
        END
    ) AS search_rank,
    COUNT(*) OVER()::integer AS result_total
  FROM public.tools t
  WHERE t.status = 'published'
    AND (NOT v_free OR t.has_free_tier IS TRUE)
    AND (v_price IS NULL OR v_price = '' OR t.pricing_model = v_price)
    AND (
      v_category IS NULL OR v_category = ''
      OR EXISTS (
        SELECT 1
        FROM public.tool_categories tc
        JOIN public.categories c ON c.id = tc.category_id
        WHERE tc.tool_id = t.id
          AND c.slug = v_category
      )
    )
    AND (
      v_safe = ''
      OR (
        v_tsquery IS NOT NULL
        AND t.search_vector @@ v_tsquery
      )
      OR (
        v_safe <> ''
        AND GREATEST(
          extensions.similarity(t.name, v_safe),
          extensions.word_similarity(v_safe, t.name)
        ) >= 0.25
      )
      OR (
        v_safe <> ''
        AND extensions.similarity(COALESCE(t.tagline, ''::text), v_safe) >= 0.25
      )
    )
  ORDER BY
    search_rank DESC,
    t.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer) TO anon, authenticated, service_role;
