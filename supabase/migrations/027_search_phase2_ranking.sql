-- 027: Search Phase 2 - typo correction, coverage-tiered ranking, weak-result cutoff.
--
--  * public.search_vocabulary (view): distinct words from tool names, tags, taglines, category
--    text and synonym terms. Always current (no refresh job); tiny at catalog scale.
--  * public.search_correct_query(q): per-word typo correction against that vocabulary using
--    pg_trgm similarity + levenshtein. Returns NULL when nothing needed correcting.
--  * public.search_tools(...): rewritten as the single ranking source.
--      - each meaningful query word must match (directly or via public.search_synonyms);
--        coverage relaxes one word at a time only when fewer than 5 tools match all words
--      - original-word matches outrank synonym-only matches; name matches outrank body matches
--      - results whose field relevance is under 45% of the best match are cut (min 5 kept)
--      - 'free' in the query prefers/filters tools with a free tier
--      - new optional arg exact => true skips typo correction ("Search instead for ...")
--      - new output column corrected_query (same on every row; NULL when not corrected)
--    The hardcoded intent regex boosts from 011-026 are removed; categories/synonyms replace them.
--
-- Rollback: supabase/rollbacks/027_search_phase2_ranking.rollback.sql

BEGIN;

CREATE OR REPLACE VIEW public.search_vocabulary
WITH (security_invoker = true) AS
WITH src AS (
  SELECT t.name AS txt, 4 AS w FROM public.tools t WHERE t.status = 'published'
  UNION ALL
  SELECT pg_catalog.array_to_string(COALESCE(t.tags, ARRAY[]::text[]), ' '), 3 FROM public.tools t WHERE t.status = 'published'
  UNION ALL
  SELECT t.search_categories, 3 FROM public.tools t WHERE t.status = 'published'
  UNION ALL
  SELECT t.tagline, 1 FROM public.tools t WHERE t.status = 'published'
  UNION ALL
  SELECT s.term || ' ' || pg_catalog.array_to_string(s.expansions, ' '), 2 FROM public.search_synonyms s
)
SELECT w.word, pg_catalog.sum(src.w)::integer AS weight
FROM src
CROSS JOIN LATERAL pg_catalog.regexp_split_to_table(pg_catalog.lower(COALESCE(src.txt, '')), '[^a-z0-9]+') AS w(word)
WHERE pg_catalog.length(w.word) BETWEEN 3 AND 30
  AND w.word !~ '^[0-9]+$'
GROUP BY w.word;

REVOKE ALL ON public.search_vocabulary FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.search_vocabulary TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.search_correct_query(q text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_in text;
  v_tok text;
  v_best text;
  v_out text[] := ARRAY[]::text[];
  v_changed boolean := false;
  v_max integer;
BEGIN
  v_in := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(COALESCE(q, '')), '[^a-z0-9 ]+', ' ', 'g'));
  v_in := pg_catalog.regexp_replace(v_in, '\s+', ' ', 'g');
  IF v_in = '' THEN
    RETURN NULL;
  END IF;

  FOREACH v_tok IN ARRAY pg_catalog.string_to_array(v_in, ' ') LOOP
    v_best := NULL;
    -- Only words that match nothing in the catalog (a cheap GIN-indexed check) get corrected.
    IF pg_catalog.length(v_tok) >= 4 AND v_tok !~ '[0-9]'
       AND NOT EXISTS (
         SELECT 1 FROM public.tools t
         WHERE t.status = 'published'
           AND t.search_vector @@ pg_catalog.plainto_tsquery('english'::regconfig, v_tok)
       )
       AND NOT EXISTS (SELECT 1 FROM public.search_synonyms s WHERE s.term = v_tok) THEN
      v_max := CASE WHEN pg_catalog.length(v_tok) <= 4 THEN 1 ELSE 2 END;
      SELECT sv.word INTO v_best
      FROM public.search_vocabulary sv
      WHERE pg_catalog.abs(pg_catalog.length(sv.word) - pg_catalog.length(v_tok)) <= 2
        AND pg_catalog.length(sv.word) >= 4
        AND (
          extensions.similarity(sv.word, v_tok) >= 0.3
          OR (pg_catalog.left(sv.word, 1) = pg_catalog.left(v_tok, 1)
              AND extensions.levenshtein(sv.word, v_tok) <= v_max)
        )
        AND extensions.levenshtein(sv.word, v_tok) <= v_max
      ORDER BY extensions.levenshtein(sv.word, v_tok) ASC,
               extensions.similarity(sv.word, v_tok) DESC,
               sv.weight DESC,
               sv.word ASC
      LIMIT 1;
    END IF;
    IF v_best IS NOT NULL AND v_best <> v_tok THEN
      v_out := v_out || v_best;
      v_changed := true;
    ELSE
      v_out := v_out || v_tok;
    END IF;
  END LOOP;

  IF v_changed THEN
    RETURN pg_catalog.array_to_string(v_out, ' ');
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.search_correct_query(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_correct_query(text) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.search_tools(text, text, text, boolean, integer, integer);

CREATE FUNCTION public.search_tools(
  q text DEFAULT NULL,
  category text DEFAULT NULL,
  price text DEFAULT NULL,
  free_only boolean DEFAULT false,
  "limit" integer DEFAULT 50,
  "offset" integer DEFAULT 0,
  exact boolean DEFAULT false
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
  result_total integer,
  corrected_query text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  -- Words that never have to match (they describe every tool or carry no meaning on their own).
  c_stop constant text[] := ARRAY['a','an','the','to','for','from','of','and','or','with','in','on','by','my','me',
    'i','your','that','which','using','use','tool','tools','app','apps','software','ai','best','top','good',
    'make','makes','making','create','creating','build','help','helps','find','get','want','need','something',
    'can','is','are','into','like','some','new','online','platform'];
  v_safe text;
  v_corr text;
  v_eff text;
  v_tok text;
  v_tokens text[] := ARRAY[]::text[];
  v_rest text;
  v_phrase text;
  v_orig_q pg_catalog.tsquery;
  v_syn_q pg_catalog.tsquery;
  v_exp text;
  v_tq pg_catalog.tsquery[] := ARRAY[]::pg_catalog.tsquery[];
  v_sq pg_catalog.tsquery[] := ARRAY[]::pg_catalog.tsquery[];
  v_sw numeric[] := ARRAY[]::numeric[];
  v_any pg_catalog.tsquery;
  v_n integer;
  v_free_intent boolean := false;
  v_limit integer;
  v_offset integer;
  v_category text;
  v_price text;
  v_free boolean;
BEGIN
  v_safe := pg_catalog.left(pg_catalog.btrim(COALESCE(q, ''::text)), 100);
  v_safe := pg_catalog.lower(pg_catalog.regexp_replace(v_safe, '[^[:alnum:][:space:]]+', ' ', 'g'));
  v_safe := pg_catalog.btrim(pg_catalog.regexp_replace(v_safe, '\s+', ' ', 'g'));

  v_corr := CASE WHEN COALESCE(exact, false) OR v_safe = '' THEN NULL ELSE public.search_correct_query(v_safe) END;
  v_eff := COALESCE(v_corr, v_safe);

  -- Multi-word synonym terms ("text to speech") are matched as one phrase concept.
  v_rest := v_eff;
  FOR v_phrase IN
    SELECT s.term FROM public.search_synonyms s
    WHERE pg_catalog.strpos(s.term, ' ') > 0 AND v_eff ~ ('\m' || s.term || '\M')
    ORDER BY pg_catalog.length(s.term) DESC
  LOOP
    v_orig_q := pg_catalog.phraseto_tsquery('english'::regconfig, v_phrase);
    CONTINUE WHEN v_orig_q IS NULL OR pg_catalog.numnode(v_orig_q) = 0;
    SELECT pg_catalog.string_agg(DISTINCT e, ' | ') INTO v_exp
      FROM public.search_synonyms s
      CROSS JOIN LATERAL pg_catalog.unnest(s.expansions) AS x(raw)
      CROSS JOIN LATERAL pg_catalog.regexp_split_to_table(pg_catalog.lower(x.raw), '[^a-z0-9]+') AS e
     WHERE s.term = v_phrase AND pg_catalog.length(e) >= 2 AND NOT (e = ANY (c_stop));
    v_syn_q := v_orig_q;
    IF v_exp IS NOT NULL AND v_exp <> '' THEN
      v_syn_q := v_orig_q || pg_catalog.to_tsquery('english'::regconfig, v_exp);
    END IF;
    v_tq := v_tq || v_orig_q;
    v_sq := v_sq || v_syn_q;
    v_sw := v_sw || 0.8;
    v_any := CASE WHEN v_any IS NULL THEN v_syn_q ELSE v_any || v_syn_q END;
    v_rest := pg_catalog.btrim(pg_catalog.regexp_replace(
      pg_catalog.replace(v_rest, v_phrase, ' '), '\s+', ' ', 'g'));
  END LOOP;

  IF v_rest <> '' THEN
    FOREACH v_tok IN ARRAY pg_catalog.string_to_array(v_rest, ' ') LOOP
      IF v_tok = 'free' THEN
        v_free_intent := true;
      ELSIF NOT (v_tok = ANY (c_stop)) AND NOT (v_tok = ANY (v_tokens)) THEN
        v_tokens := v_tokens || v_tok;
      END IF;
    END LOOP;
    -- A query made only of filler words ("ai tools") browses the catalog by editorial score.
  END IF;

  FOREACH v_tok IN ARRAY v_tokens LOOP
    BEGIN
      v_orig_q := pg_catalog.to_tsquery('english'::regconfig,
        v_tok || CASE WHEN pg_catalog.length(v_tok) >= 3 THEN ':*' ELSE '' END);
    EXCEPTION WHEN OTHERS THEN
      v_orig_q := NULL;
    END;
    CONTINUE WHEN v_orig_q IS NULL OR pg_catalog.numnode(v_orig_q) = 0;

    SELECT pg_catalog.string_agg(DISTINCT e, ' | ')
      INTO v_exp
      FROM public.search_synonyms s
      CROSS JOIN LATERAL pg_catalog.unnest(s.expansions) AS x(raw)
      CROSS JOIN LATERAL pg_catalog.regexp_split_to_table(pg_catalog.lower(x.raw), '[^a-z0-9]+') AS e
     WHERE (s.term = v_tok
            OR pg_catalog.ts_lexize('english_stem', s.term) = pg_catalog.ts_lexize('english_stem', v_tok))
       AND pg_catalog.length(e) >= 2
       AND NOT (e = ANY (c_stop));

    v_syn_q := v_orig_q;
    IF v_exp IS NOT NULL AND v_exp <> '' THEN
      BEGIN
        v_syn_q := v_orig_q || pg_catalog.to_tsquery('english'::regconfig, v_exp);
      EXCEPTION WHEN OTHERS THEN
        v_syn_q := v_orig_q;
      END;
    END IF;

    v_tq := v_tq || v_orig_q;
    v_sq := v_sq || v_syn_q;
    v_sw := v_sw || 0.5;
    v_any := CASE WHEN v_any IS NULL THEN v_syn_q ELSE v_any || v_syn_q END;
  END LOOP;

  v_n := pg_catalog.cardinality(v_tq);
  v_limit := LEAST(GREATEST(COALESCE("limit", 50), 1), 50);
  v_offset := GREATEST(COALESCE("offset", 0), 0);
  v_category := NULLIF(NULLIF(pg_catalog.btrim(COALESCE(category, ''::text)), ''), 'all');
  v_price := NULLIF(NULLIF(pg_catalog.btrim(COALESCE(price, ''::text)), ''), 'all');
  v_free := COALESCE(free_only, false);

  RETURN QUERY
  WITH base AS (
    SELECT t.*
    FROM public.tools t
    WHERE t.status = 'published'
      -- Candidate pre-filter (GIN index on search_vector); name-similarity catches the rest.
      AND (
        v_n = 0
        OR t.search_vector @@ v_any
        OR extensions.word_similarity(v_eff, pg_catalog.lower(t.name)) >= 0.5
      )
      AND (NOT v_free OR t.has_free_tier IS TRUE)
      AND (v_price IS NULL OR t.pricing_model = v_price)
      AND (
        v_category IS NULL
        OR EXISTS (
          SELECT 1 FROM public.tool_categories tc JOIN public.categories c ON c.id = tc.category_id
          WHERE tc.tool_id = t.id AND c.slug = v_category
        )
      )
  ),
  fields AS MATERIALIZED (
    SELECT b.*,
      pg_catalog.to_tsvector('english'::regconfig, COALESCE(b.name, '')) AS v_name,
      pg_catalog.to_tsvector('english'::regconfig, COALESCE(b.tagline, '')) AS v_tagline,
      pg_catalog.to_tsvector('english'::regconfig, pg_catalog.array_to_string(COALESCE(b.tags, ARRAY[]::text[]), ' ')) AS v_tags,
      pg_catalog.to_tsvector('english'::regconfig, COALESCE(b.search_features, '') || ' ' || COALESCE(b.search_categories, '')) AS v_meta
    FROM base b
  ),
  matched AS MATERIALIZED (
    -- Per query word: weight of the best field it matches (name 8 > tagline 5 > tags 4 >
    -- features/categories 2 > description 1), plus a quarter of the other matching fields.
    -- Synonym-only matches count 50% for single words, 80% for phrase concepts.
    SELECT f.*,
      (
        SELECT COALESCE(pg_catalog.array_agg(GREATEST(w.orig, w.syn * v_sw[w.i]) ORDER BY w.i), ARRAY[]::numeric[])
        FROM (
          SELECT i,
            (SELECT GREATEST(pg_catalog.max(x), 0) + 0.25 * (pg_catalog.sum(x) - GREATEST(pg_catalog.max(x), 0))
               FROM pg_catalog.unnest(ARRAY[
                 CASE WHEN f.v_name @@ v_tq[i] THEN 8.0 ELSE 0 END,
                 CASE WHEN f.v_tagline @@ v_tq[i] THEN 5.0 ELSE 0 END,
                 CASE WHEN f.v_tags @@ v_tq[i] THEN 4.0 ELSE 0 END,
                 CASE WHEN f.v_meta @@ v_tq[i] THEN 2.0 ELSE 0 END,
                 CASE WHEN f.search_vector @@ v_tq[i] THEN 1.0 ELSE 0 END]) x) AS orig,
            (SELECT GREATEST(pg_catalog.max(x), 0) + 0.25 * (pg_catalog.sum(x) - GREATEST(pg_catalog.max(x), 0))
               FROM pg_catalog.unnest(ARRAY[
                 CASE WHEN f.v_name @@ v_sq[i] THEN 8.0 ELSE 0 END,
                 CASE WHEN f.v_tagline @@ v_sq[i] THEN 5.0 ELSE 0 END,
                 CASE WHEN f.v_tags @@ v_sq[i] THEN 4.0 ELSE 0 END,
                 CASE WHEN f.v_meta @@ v_sq[i] THEN 2.0 ELSE 0 END,
                 CASE WHEN f.search_vector @@ v_sq[i] THEN 1.0 ELSE 0 END]) x) AS syn
          FROM pg_catalog.generate_series(1, GREATEST(v_n, 0)) AS i
        ) w
      ) AS m
    FROM fields f
  ),
  scored AS (
    SELECT mt.*,
      (SELECT COALESCE(pg_catalog.sum(x), 0) FROM pg_catalog.unnest(mt.m) x)::double precision AS field_score,
      (SELECT pg_catalog.count(*) FROM pg_catalog.unnest(mt.m) x WHERE x >= 4)::integer AS strong_hits,
      (SELECT pg_catalog.count(*) FROM pg_catalog.unnest(mt.m) x WHERE x > 0)::integer AS any_hits,
      CASE WHEN v_any IS NULL THEN 0::double precision
           ELSE pg_catalog.ts_rank('{0.05,0.2,0.5,1.0}'::real[], mt.search_vector, v_any, 1)::double precision END AS text_rank,
      CASE
        WHEN v_eff = '' THEN 0::double precision
        WHEN pg_catalog.lower(mt.name) = v_eff THEN 30::double precision
        WHEN pg_catalog.lower(mt.name) LIKE v_eff || '%' THEN 12::double precision
        ELSE GREATEST(extensions.word_similarity(v_eff, pg_catalog.lower(mt.name)) - 0.5, 0)::double precision * 12
      END AS name_bonus
    FROM matched mt
  ),
  qualified AS MATERIALIZED (
    SELECT s.*,
      -- Coverage key: every word matched strongly (name/tagline/tags/category) > every word matched
      -- anywhere > one word fewer strongly > ...
      GREATEST(2 * s.strong_hits, 2 * s.any_hits - 1, CASE WHEN s.name_bonus >= 12 THEN 2 * v_n ELSE 0 END) AS cov,
      (s.field_score * 3 + s.name_bonus + s.text_rank * 5
        + COALESCE(s.editorial_score, 0)::double precision / 100.0
        + CASE WHEN v_free_intent AND s.has_free_tier IS TRUE THEN 3 ELSE 0 END)::double precision AS score
    FROM scored s
    WHERE v_n = 0 OR s.any_hits >= 1 OR s.name_bonus >= 6
  ),
  coverage AS (
    -- Use the strictest coverage level that still yields at least 5 tools.
    SELECT COALESCE((
      SELECT lvl FROM pg_catalog.generate_series(GREATEST(2 * v_n, 1), 1, -1) AS lvl
      WHERE (SELECT pg_catalog.count(*) FROM qualified qq WHERE qq.cov >= lvl) >= 5
      ORDER BY lvl DESC LIMIT 1
    ), 1) AS need
  ),
  free_ok AS (
    SELECT (NOT v_free_intent)
        OR (SELECT pg_catalog.count(*) FROM qualified qq, coverage cv
            WHERE (v_n = 0 OR qq.cov >= cv.need) AND qq.has_free_tier IS TRUE) < 5 AS skip_free_filter
  ),
  kept AS (
    SELECT qq.*
    FROM qualified qq, coverage cv, free_ok fo
    WHERE (v_n = 0 OR qq.cov >= cv.need)
      AND (fo.skip_free_filter OR qq.has_free_tier IS TRUE)
  ),
  cut AS (
    SELECT k.*, pg_catalog.max(k.field_score) OVER () AS top_field,
           pg_catalog.row_number() OVER (ORDER BY k.score DESC, k.name ASC) AS rn
    FROM kept k
  ),
  final AS (
    SELECT c.* FROM cut c
    WHERE v_n = 0 OR c.field_score >= c.top_field * 0.45 OR (c.rn <= 5 AND c.field_score >= c.top_field * 0.2)
  )
  SELECT
    f.id, f.slug, f.name, f.tagline, f.description, f.website_url, f.pricing_summary, f.pricing_model,
    f.has_free_tier, f.platforms, f.features, f.logo_url, f.editorial_score, f.editorial_why, f.source_url,
    f.last_verified_at, f.status, f.is_sponsored, f.created_at, f.updated_at, f.tags,
    CASE WHEN v_n = 0 THEN COALESCE(f.editorial_score, 0)::double precision ELSE f.score END AS search_rank,
    (pg_catalog.count(*) OVER ())::integer AS result_total,
    v_corr AS corrected_query
  FROM final f
  ORDER BY
    CASE WHEN v_n = 0 THEN COALESCE(f.editorial_score, 0)::double precision ELSE f.score END DESC,
    f.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer, boolean) TO anon, authenticated, service_role;

COMMIT;
