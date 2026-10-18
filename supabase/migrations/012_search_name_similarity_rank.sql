-- Prefer closest name (trigram + edit distance) when the original query
-- has no exact FTS hit. Boost writing/copy identity over generic Content FTS.

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA extensions;

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
  v_original_tsquery pg_catalog.tsquery;
  v_limit integer;
  v_offset integer;
  v_category text;
  v_price text;
  v_free boolean;
  v_writing_intent boolean;
BEGIN
  v_raw := pg_catalog.left(pg_catalog.btrim(COALESCE(q, ''::text)), 100);
  v_safe := pg_catalog.regexp_replace(v_raw, '[&|!:*()<>''"]', ' ', 'g');
  v_safe := pg_catalog.regexp_replace(v_safe, '\s+', ' ', 'g');
  v_safe := pg_catalog.btrim(v_safe);
  v_expanded := v_safe;
  v_writing_intent := v_safe ~* '\m(writing|copy|content|grammar)\M';

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
  v_original_tsquery := NULL;
  IF v_safe <> '' THEN
    BEGIN
      v_original_tsquery := pg_catalog.websearch_to_tsquery(
        'english'::regconfig,
        pg_catalog.regexp_replace(v_safe, '\s+', ' or ', 'g')
      );
    EXCEPTION WHEN OTHERS THEN
      v_original_tsquery := NULL;
    END;
  END IF;
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
  WITH ranked AS (
    SELECT
      t.*,
      GREATEST(
        CASE WHEN v_safe = '' THEN 0::double precision
             ELSE extensions.similarity(t.name, v_safe) END,
        CASE WHEN v_safe = '' THEN 0::double precision
             ELSE extensions.word_similarity(v_safe, t.name) END,
        COALESCE((
          SELECT MAX(
            1.0 - extensions.levenshtein(pg_catalog.lower(w), pg_catalog.lower(v_safe))::double precision
                  / GREATEST(pg_catalog.length(w), pg_catalog.length(v_safe), 1)
          )
          FROM pg_catalog.unnest(pg_catalog.regexp_split_to_array(t.name, '[^[:alnum:]]+')) AS w
          WHERE pg_catalog.length(w) >= 3
        ), 0::double precision)
      ) AS name_sim,
      (
        v_original_tsquery IS NOT NULL
        AND t.search_vector @@ v_original_tsquery
      ) AS has_exact_fts,
      CASE
        WHEN v_tsquery IS NULL THEN 0::double precision
        ELSE COALESCE(pg_catalog.ts_rank_cd(t.search_vector, v_tsquery), 0::real) * 2.0
      END AS fts_rank,
      CASE
        WHEN NOT v_writing_intent THEN 0::double precision
        ELSE
          (CASE WHEN t.name ~* 'writing|copy|grammar|copywrit' THEN 4.0 ELSE 0.0 END)
          + (CASE
               WHEN COALESCE(t.tagline, ''::text) ~* 'writing|copy|grammar|copywrit|content'
                 OR pg_catalog.array_to_string(COALESCE(t.features, ARRAY[]::text[]), ' ') ~* 'writing|copy|grammar|copywrit'
                 OR pg_catalog.array_to_string(COALESCE(t.tags, ARRAY[]::text[]), ' ') ~* 'writing|copy|grammar|copywrit'
               THEN 2.0 ELSE 0.0
             END)
          + (CASE
               WHEN EXISTS (
                 SELECT 1
                 FROM public.tool_categories tc
                 JOIN public.categories c ON c.id = tc.category_id
                 WHERE tc.tool_id = t.id
                   AND (c.slug ~* 'content|writing|copy' OR c.name ~* 'content|writing|copy')
               ) THEN 1.2 ELSE 0.0
             END)
      END AS intent_boost
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
  )
  SELECT
    ranked.id,
    ranked.slug,
    ranked.name,
    ranked.tagline,
    ranked.description,
    ranked.website_url,
    ranked.pricing_summary,
    ranked.pricing_model,
    ranked.has_free_tier,
    ranked.platforms,
    ranked.features,
    ranked.logo_url,
    ranked.editorial_score,
    ranked.editorial_why,
    ranked.source_url,
    ranked.last_verified_at,
    ranked.status,
    ranked.is_sponsored,
    ranked.created_at,
    ranked.updated_at,
    ranked.tags,
    (
      CASE
        WHEN v_safe <> '' AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
        THEN ranked.name_sim * 12.0
        ELSE ranked.name_sim
      END
      + ranked.fts_rank
      + ranked.intent_boost
      + CASE
          WHEN v_safe = '' THEN 0::double precision
          ELSE 0.25 * extensions.similarity(COALESCE(ranked.tagline, ''::text), v_safe)
        END
    ) AS search_rank,
    COUNT(*) OVER()::integer AS result_total
  FROM ranked
  ORDER BY
    CASE
      WHEN v_safe <> '' AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
      THEN ranked.name_sim
      ELSE 0::double precision
    END DESC,
    (
      CASE
        WHEN v_safe <> '' AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
        THEN ranked.name_sim * 12.0
        ELSE ranked.name_sim
      END
      + ranked.fts_rank
      + ranked.intent_boost
    ) DESC,
    ranked.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer) TO anon, authenticated, service_role;
