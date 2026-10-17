-- Single-word synonym/category expansion, short-query prefix matching,
-- and coding/image/chat intent so 'image' and 'code' rank like users expect.

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
  v_image_intent boolean;
  v_code_intent boolean;
  v_chat_intent boolean;
  v_short boolean;
BEGIN
  v_raw := pg_catalog.left(pg_catalog.btrim(COALESCE(q, ''::text)), 100);
  v_safe := pg_catalog.lower(pg_catalog.regexp_replace(v_raw, '[&|!:*()<>''"]', ' ', 'g'));
  v_safe := pg_catalog.btrim(pg_catalog.regexp_replace(v_safe, '\s+', ' ', 'g'));
  v_phrase := pg_catalog.regexp_replace(v_safe, 'text[[:space:]]+to[[:space:]]+speech', 'speech', 'g');
  v_expanded := v_phrase;
  v_writing_intent := v_safe ~* '\m(writing|copy|content|grammar)\M';
  v_audio_intent := v_safe ~* 'text[[:space:]]+to[[:space:]]+speech'
    OR v_safe ~* '\m(voice|audio|speech|tts)\M';
  v_image_intent := v_safe ~* '\m(image|art|images)\M';
  v_code_intent := v_safe ~* '\m(code|coding)\M';
  v_chat_intent := v_safe ~* '\m(chat|chatbot|assistant)\M';
  v_short := v_safe <> '' AND pg_catalog.length(v_safe) <= 4;

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
    v_expanded := v_expanded || ' image art generation generate generator images design';
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
  IF v_phrase ~* '\mchat\M' OR v_phrase ~* '\mchatbot\M' OR v_phrase ~* '\massistant\M' THEN
    v_expanded := v_expanded || ' chat chatbot assistant conversation';
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
      CASE
        WHEN v_safe = '' THEN 0::double precision
        WHEN v_short THEN
          GREATEST(
            CASE WHEN pg_catalog.lower(t.name) = v_safe THEN 1.0 ELSE 0.0 END,
            CASE WHEN pg_catalog.lower(t.name) LIKE v_safe || '%' THEN 0.85 ELSE 0.0 END,
            COALESCE((
              SELECT MAX(
                CASE
                  WHEN pg_catalog.lower(w) = v_safe THEN 1.0
                  WHEN pg_catalog.lower(w) LIKE v_safe || '%' THEN 0.85
                  ELSE 0.0
                END
              )
              FROM pg_catalog.unnest(pg_catalog.regexp_split_to_array(t.name, '[^[:alnum:]]+')) AS w
              WHERE pg_catalog.length(w) >= 1
            ), 0::double precision)
          )
        ELSE
          GREATEST(
            extensions.similarity(t.name, v_safe),
            extensions.word_similarity(v_safe, t.name),
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
          )
      END AS name_sim,
      (
        v_original_tsquery IS NOT NULL
        AND t.search_vector @@ v_original_tsquery
      ) AS has_exact_fts,
      (
        v_tsquery IS NOT NULL
        AND t.search_vector @@ v_tsquery
      ) AS has_expanded_fts,
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
        END
      + CASE
          WHEN v_image_intent THEN
            (CASE WHEN t.name ~* 'image|art|midjourney|diffusion|dall|canva' THEN 4.0 ELSE 0.0 END)
            + (CASE
                 WHEN COALESCE(t.tagline, ''::text) ~* 'image|art'
                   OR pg_catalog.array_to_string(COALESCE(t.features, ARRAY[]::text[]), ' ') ~* 'image|art'
                   OR pg_catalog.array_to_string(COALESCE(t.tags, ARRAY[]::text[]), ' ') ~* 'image|art'
                 THEN 3.0 ELSE 0.0
               END)
            + (CASE
                 WHEN EXISTS (
                   SELECT 1
                   FROM public.tool_categories tc
                   JOIN public.categories c ON c.id = tc.category_id
                   WHERE tc.tool_id = t.id
                     AND (c.slug ~* 'design' OR c.name ~* 'design')
                 ) THEN 2.2 ELSE 0.0
               END)
          ELSE 0::double precision
        END
      + CASE
          WHEN v_code_intent THEN
            (CASE WHEN t.name ~* '\mcopilot\M|\mcursor\M|\mreplit\M|\mbolt\M|\mv0\M|\mcode\M' THEN 4.0 ELSE 0.0 END)
            + (CASE
                 WHEN COALESCE(t.tagline, ''::text) ~* 'code|coding|programmer|developer'
                   OR pg_catalog.array_to_string(COALESCE(t.features, ARRAY[]::text[]), ' ') ~* 'code|coding|programmer|developer'
                 THEN 2.0 ELSE 0.0
               END)
            + (CASE
                 WHEN EXISTS (
                   SELECT 1
                   FROM public.tool_categories tc
                   JOIN public.categories c ON c.id = tc.category_id
                   WHERE tc.tool_id = t.id
                     AND (c.slug ~* 'coding' OR c.name ~* 'coding')
                 ) THEN 2.5 ELSE 0.0
               END)
          ELSE 0::double precision
        END
      + CASE
          WHEN v_chat_intent THEN
            (CASE WHEN t.name ~* 'chat' THEN 4.0 ELSE 0.0 END)
            + (CASE
                 WHEN COALESCE(t.tagline, ''::text) ~* 'chat|assistant'
                   OR pg_catalog.array_to_string(COALESCE(t.features, ARRAY[]::text[]), ' ') ~* 'chat|assistant'
                 THEN 2.0 ELSE 0.0
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
          v_image_intent AND EXISTS (
            SELECT 1
            FROM public.tool_categories tc
            JOIN public.categories c ON c.id = tc.category_id
            WHERE tc.tool_id = t.id
              AND (c.slug ~* 'design' OR c.name ~* 'design')
          )
        )
        OR (
          v_code_intent AND EXISTS (
            SELECT 1
            FROM public.tool_categories tc
            JOIN public.categories c ON c.id = tc.category_id
            WHERE tc.tool_id = t.id
              AND (c.slug ~* 'coding' OR c.name ~* 'coding')
          )
        )
        OR (
          v_safe <> ''
          AND (
            (
              v_short
              AND (
                pg_catalog.lower(t.name) = v_safe
                OR pg_catalog.lower(t.name) LIKE v_safe || '%'
                OR EXISTS (
                  SELECT 1
                  FROM pg_catalog.unnest(pg_catalog.regexp_split_to_array(t.name, '[^[:alnum:]]+')) AS w
                  WHERE pg_catalog.lower(w) = v_safe
                    OR pg_catalog.lower(w) LIKE v_safe || '%'
                )
              )
            )
            OR (
              NOT v_short
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
        WHEN v_safe <> '' AND NOT v_short AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
        THEN ranked.name_sim * 12.0
        ELSE ranked.name_sim
      END
      + ranked.fts_rank
      + ranked.intent_boost
      + CASE
          WHEN v_safe = '' THEN 0::double precision
          WHEN v_short THEN 0.05 * extensions.similarity(COALESCE(ranked.tagline, ''::text), v_safe)
          ELSE 0.25 * extensions.similarity(COALESCE(ranked.tagline, ''::text), v_safe)
        END
    ) AS search_rank,
    COUNT(*) OVER()::integer AS result_total
  FROM ranked
  WHERE v_safe = ''
    OR ranked.has_exact_fts
    OR ranked.has_expanded_fts
    OR ranked.intent_boost > 0
    OR ranked.name_sim >= 0.4
    OR ranked.fts_rank + ranked.intent_boost >= 1.5
  ORDER BY
    CASE
      WHEN v_safe <> '' AND NOT v_short AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
      THEN ranked.name_sim
      ELSE 0::double precision
    END DESC,
    (
      CASE
        WHEN v_safe <> '' AND NOT v_short AND NOT ranked.has_exact_fts AND ranked.name_sim >= 0.4
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
