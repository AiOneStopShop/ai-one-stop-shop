-- Audio synonyms (text to speech / tts / speech / voice) and a higher
-- relevance floor so weak trigram hits become zero-results.

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
  v_phrase text;
  v_expanded text;
  v_tsquery pg_catalog.tsquery;
  v_original_tsquery pg_catalog.tsquery;
  v_limit integer;
  v_offset integer;
  v_category text;
  v_price text;
  v_free boolean;
  v_writing_intent boolean;
  v_audio_intent boolean;
BEGIN
  v_raw := pg_catalog.left(pg_catalog.btrim(COALESCE(q, ''::text)), 100);
  v_safe := pg_catalog.lower(pg_catalog.regexp_replace(v_raw, '[&|!:*()<>''"]', ' ', 'g'));
  v_safe := pg_catalog.btrim(pg_catalog.regexp_replace(v_safe, '\s+', ' ', 'g'));
  v_phrase := pg_catalog.regexp_replace(v_safe, 'text[[:space:]]+to[[:space:]]+speech', 'speech', 'g');
  v_expanded := v_phrase;
  v_writing_intent := v_safe ~* '\m(writing|copy|content|grammar)\M';
  v_audio_intent := v_safe ~* 'text[[:space:]]+to[[:space:]]+speech'
    OR v_safe ~* '\m(voice|audio|speech|tts)\M';

  IF v_phrase ~* '\mwriting\M' THEN
    v_expanded := v_expanded || ' copy content grammar copywriting copywriter';
  END IF;
  IF v_phrase ~* '\mcopy\M' THEN
    v_expanded := v_expanded || ' writing content copywriting';
  END IF;
  IF v_phrase ~* '\mcontent\M' THEN
    v_expanded := v_expanded || ' writing copy';
  END IF;
  IF v_phrase ~* '\mgrammar\M' THEN
    v_expanded := v_expanded || ' writing';
  END IF;
  IF v_phrase ~* '\mimage\M' OR v_phrase ~* '\mart\M' THEN
    v_expanded := v_expanded || ' image art generation generate images';
  END IF;
  IF v_phrase ~* '\mcode\M' OR v_phrase ~* '\mcoding\M' THEN
    v_expanded := v_expanded || ' code coding developer development copilot programmer';
  END IF;
  IF v_phrase ~* '\mvideo\M' THEN
    v_expanded := v_expanded || ' video film podcast recording';
  END IF;
  IF v_audio_intent THEN
    v_expanded := v_expanded || ' voice audio speech tts cloning';
  END IF;
  IF v_phrase ~* '\mchatbot\M' OR v_phrase ~* '\massistant\M' THEN
    v_expanded := v_expanded || ' chatbot assistant chat';
  END IF;

  v_tsquery := NULL;
  v_original_tsquery := NULL;
  IF v_phrase <> '' THEN
    BEGIN
      v_original_tsquery := pg_catalog.websearch_to_tsquery(
        'english'::regconfig,
        pg_catalog.regexp_replace(v_phrase, '\s+', ' or ', 'g')
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
        CASE WHEN v_safe = '' THEN 0::double precision ELSE extensions.similarity(t.name, v_safe) END,
        CASE WHEN v_safe = '' THEN 0::double precision ELSE extensions.word_similarity(v_safe, t.name) END,
        COALESCE((
          SELECT MAX(
            CASE
              WHEN extensions.similarity(w, v_safe) >= 0.25
              THEN GREATEST(
                extensions.similarity(w, v_safe),
                1.0 - extensions.levenshtein(pg_catalog.lower(w), pg_catalog.lower(v_safe))::double precision
                      / GREATEST(pg_catalog.length(w), pg_catalog.length(v_safe), 1)
              )
              ELSE extensions.similarity(w, v_safe)
            END
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
        WHEN v_writing_intent THEN
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
        ELSE 0::double precision
      END
      + CASE
          WHEN v_audio_intent THEN
            (CASE WHEN t.name ~* 'voice|speech|tts|audio|clon' THEN 4.0 ELSE 0.0 END)
            + (CASE
                 WHEN COALESCE(t.tagline, ''::text) ~* 'voice|speech|tts|audio|clon'
                   OR pg_catalog.array_to_string(COALESCE(t.features, ARRAY[]::text[]), ' ') ~* 'voice|speech|tts|audio|clon'
                 THEN 3.0 ELSE 0.0
               END)
          ELSE 0::double precision
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
          AND (
            GREATEST(
              extensions.similarity(t.name, v_safe),
              extensions.word_similarity(v_safe, t.name)
            ) >= 0.4
            OR EXISTS (
              SELECT 1
              FROM pg_catalog.unnest(pg_catalog.regexp_split_to_array(t.name, '[^[:alnum:]]+')) AS w
              WHERE pg_catalog.length(w) >= 3
                AND (
                  extensions.similarity(w, v_safe) >= 0.4
                  OR (
                    extensions.similarity(w, v_safe) >= 0.25
                    AND 1.0 - extensions.levenshtein(pg_catalog.lower(w), pg_catalog.lower(v_safe))::double precision
                          / GREATEST(pg_catalog.length(w), pg_catalog.length(v_safe), 1) >= 0.4
                  )
                )
            )
          )
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
  WHERE v_safe = ''
    OR ranked.has_exact_fts
    OR ranked.name_sim >= 0.4
    OR ranked.fts_rank + ranked.intent_boost >= 1.5
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
