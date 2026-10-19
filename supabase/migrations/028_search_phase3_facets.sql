-- 028: Search Phase 3 - facets with live counts, platform filter, more sort options.
--
--  * public.search_platform_group(text): maps raw platform labels ("iOS", "Mac", "Chrome Extension")
--    to a small set of facet groups (web, desktop, mobile, api, cli, self-hosted,
--    browser-extension, ide, integrations).
--  * public.search_tool_matches(q, exact): the Phase 2 matching + ranking (unchanged logic) as a
--    reusable set of (tool_id, score, corrected_query), computed BEFORE filters, so filters and
--    facet counts all narrow the same result set.
--  * public.search_tools(...): adds platform and sort ("relevance", "name", "newest",
--    "verified", "free"). Same output columns as 027.
--  * public.search_tool_facets(...): disjunctive facet counts (each facet counts with every OTHER
--    active filter applied), for category, pricing, free tier and platform.
--  All SECURITY INVOKER with explicit tools columns (anon cannot read tools.review_notes, 025).
--
-- Rollback: supabase/rollbacks/028_search_phase3_facets.rollback.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.search_platform_group(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p IS NULL OR pg_catalog.btrim(p) = '' THEN NULL
    WHEN pg_catalog.lower(p) IN ('web', 'cloud') THEN 'web'
    WHEN pg_catalog.lower(p) IN ('desktop', 'macos', 'mac', 'windows', 'linux') THEN 'desktop'
    WHEN pg_catalog.lower(p) IN ('mobile', 'ios', 'android') THEN 'mobile'
    WHEN pg_catalog.lower(p) IN ('api', 'library', 'python', 'javascript') THEN 'api'
    WHEN pg_catalog.lower(p) = 'cli' THEN 'cli'
    WHEN pg_catalog.lower(p) = 'self-hosted' THEN 'self-hosted'
    WHEN pg_catalog.lower(p) IN ('chrome', 'chrome extension', 'browser extension') THEN 'browser-extension'
    WHEN pg_catalog.lower(p) IN ('ide', 'ide extension', 'editor extension', 'vs code', 'jetbrains', 'neovim') THEN 'ide'
    ELSE 'integrations'
  END;
$$;

CREATE OR REPLACE FUNCTION public.search_platform_label(g text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE g
    WHEN 'web' THEN 'Web'
    WHEN 'desktop' THEN 'Desktop app'
    WHEN 'mobile' THEN 'Mobile app'
    WHEN 'api' THEN 'API / library'
    WHEN 'cli' THEN 'Command line'
    WHEN 'self-hosted' THEN 'Self-hosted'
    WHEN 'browser-extension' THEN 'Browser extension'
    WHEN 'ide' THEN 'Code editor / IDE'
    WHEN 'integrations' THEN 'Works inside other apps'
    ELSE g
  END;
$$;

CREATE OR REPLACE FUNCTION public.search_tool_matches(
  q text DEFAULT NULL,
  exact boolean DEFAULT false
)
RETURNS TABLE (tool_id uuid, score double precision, corrected_query text)
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

  RETURN QUERY
  WITH base AS (
    -- Explicit columns, never t.*: this function runs as the caller, and anon/authenticated
    -- cannot read tools.review_notes (migration 025).
    SELECT t.id, t.slug, t.name, t.tagline, t.description, t.website_url, t.pricing_summary, t.pricing_model,
      t.has_free_tier, t.platforms, t.features, t.logo_url, t.editorial_score, t.editorial_why, t.source_url,
      t.last_verified_at, t.status, t.is_sponsored, t.created_at, t.updated_at, t.tags,
      t.search_categories, t.search_features, t.search_vector
    FROM public.tools t
    WHERE t.status = 'published'
      -- Candidate pre-filter (GIN index on search_vector); name-similarity catches the rest.
      AND (
        v_n = 0
        OR t.search_vector @@ v_any
        OR extensions.word_similarity(v_eff, pg_catalog.lower(t.name)) >= 0.5
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
    f.id AS tool_id,
    CASE WHEN v_n = 0 THEN 0::double precision ELSE f.score END AS score,
    v_corr AS corrected_query
  FROM final f;
END;
$$;

REVOKE ALL ON FUNCTION public.search_tool_matches(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tool_matches(text, boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_platform_group(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_platform_label(text) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.search_tools(text, text, text, boolean, integer, integer, boolean);

CREATE FUNCTION public.search_tools(
  q text DEFAULT NULL,
  category text DEFAULT NULL,
  price text DEFAULT NULL,
  free_only boolean DEFAULT false,
  "limit" integer DEFAULT 50,
  "offset" integer DEFAULT 0,
  exact boolean DEFAULT false,
  platform text DEFAULT NULL,
  sort text DEFAULT 'relevance'
)
RETURNS TABLE (
  id uuid, slug text, name text, tagline text, description text, website_url text,
  pricing_summary text, pricing_model text, has_free_tier boolean, platforms text[], features text[],
  logo_url text, editorial_score integer, editorial_why text, source_url text,
  last_verified_at timestamptz, status text, is_sponsored boolean, created_at timestamptz,
  updated_at timestamptz, tags text[], search_rank double precision, result_total integer,
  corrected_query text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH m AS MATERIALIZED (
    SELECT mm.tool_id, mm.score, mm.corrected_query FROM public.search_tool_matches(q, exact) mm
  ),
  f AS (
    SELECT t.id, t.slug, t.name, t.tagline, t.description, t.website_url, t.pricing_summary, t.pricing_model,
      t.has_free_tier, t.platforms, t.features, t.logo_url, t.editorial_score, t.editorial_why, t.source_url,
      t.last_verified_at, t.status, t.is_sponsored, t.created_at, t.updated_at, t.tags,
      m.score, m.corrected_query
    FROM m
    JOIN public.tools t ON t.id = m.tool_id
    WHERE (NOT COALESCE(free_only, false) OR t.has_free_tier IS TRUE)
      AND (NULLIF(NULLIF(pg_catalog.btrim(COALESCE(price, '')), ''), 'all') IS NULL
           OR t.pricing_model = pg_catalog.btrim(price))
      AND (NULLIF(NULLIF(pg_catalog.btrim(COALESCE(category, '')), ''), 'all') IS NULL
           OR EXISTS (SELECT 1 FROM public.tool_categories tc JOIN public.categories c ON c.id = tc.category_id
                      WHERE tc.tool_id = t.id AND c.slug = pg_catalog.btrim(category)))
      AND (NULLIF(NULLIF(pg_catalog.btrim(COALESCE(platform, '')), ''), 'all') IS NULL
           OR EXISTS (SELECT 1 FROM pg_catalog.unnest(COALESCE(t.platforms, ARRAY[]::text[])) p
                      WHERE public.search_platform_group(p) = pg_catalog.btrim(platform)))
  )
  SELECT f.id, f.slug, f.name, f.tagline, f.description, f.website_url, f.pricing_summary, f.pricing_model,
    f.has_free_tier, f.platforms, f.features, f.logo_url, f.editorial_score, f.editorial_why, f.source_url,
    f.last_verified_at, f.status, f.is_sponsored, f.created_at, f.updated_at, f.tags,
    f.score AS search_rank,
    (pg_catalog.count(*) OVER ())::integer AS result_total,
    f.corrected_query
  FROM f
  ORDER BY
    CASE WHEN sort = 'free' THEN (CASE WHEN f.has_free_tier IS TRUE THEN 0 ELSE 1 END) END ASC,
    CASE WHEN sort = 'newest' THEN f.created_at END DESC NULLS LAST,
    CASE WHEN sort = 'verified' THEN f.last_verified_at END DESC NULLS LAST,
    CASE WHEN sort = 'name' THEN pg_catalog.lower(f.name) END ASC,
    f.score DESC,
    pg_catalog.lower(f.name) ASC
  LIMIT LEAST(GREATEST(COALESCE("limit", 50), 1), 50)
  OFFSET GREATEST(COALESCE("offset", 0), 0);
$$;

REVOKE ALL ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer, boolean, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tools(text, text, text, boolean, integer, integer, boolean, text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.search_tool_facets(
  q text DEFAULT NULL,
  category text DEFAULT NULL,
  price text DEFAULT NULL,
  free_only boolean DEFAULT false,
  platform text DEFAULT NULL,
  exact boolean DEFAULT false
)
RETURNS TABLE (facet text, value text, label text, tool_count integer)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH params AS (
    SELECT
      NULLIF(NULLIF(pg_catalog.btrim(COALESCE(category, '')), ''), 'all') AS p_cat,
      NULLIF(NULLIF(pg_catalog.btrim(COALESCE(price, '')), ''), 'all') AS p_price,
      COALESCE(free_only, false) AS p_free,
      NULLIF(NULLIF(pg_catalog.btrim(COALESCE(platform, '')), ''), 'all') AS p_platform
  ),
  m AS MATERIALIZED (
    SELECT mm.tool_id FROM public.search_tool_matches(q, exact) mm
  ),
  r AS MATERIALIZED (
    SELECT t.id, t.pricing_model, t.has_free_tier,
      COALESCE((SELECT pg_catalog.array_agg(DISTINCT c.slug) FROM public.tool_categories tc
                JOIN public.categories c ON c.id = tc.category_id WHERE tc.tool_id = t.id), ARRAY[]::text[]) AS cats,
      COALESCE((SELECT pg_catalog.array_agg(DISTINCT public.search_platform_group(p))
                FROM pg_catalog.unnest(COALESCE(t.platforms, ARRAY[]::text[])) p
                WHERE public.search_platform_group(p) IS NOT NULL), ARRAY[]::text[]) AS plats
    FROM m JOIN public.tools t ON t.id = m.tool_id
  ),
  flags AS (
    SELECT r.*,
      (pp.p_cat IS NULL OR pp.p_cat = ANY (r.cats)) AS ok_cat,
      (pp.p_price IS NULL OR r.pricing_model = pp.p_price) AS ok_price,
      (NOT pp.p_free OR r.has_free_tier IS TRUE) AS ok_free,
      (pp.p_platform IS NULL OR pp.p_platform = ANY (r.plats)) AS ok_plat
    FROM r, params pp
  )
  SELECT 'total'::text, 'all'::text, 'All results'::text,
         (SELECT pg_catalog.count(*) FROM flags WHERE ok_cat AND ok_price AND ok_free AND ok_plat)::integer
  UNION ALL
  SELECT 'category', c.slug, c.name,
         (SELECT pg_catalog.count(*) FROM flags fl WHERE ok_price AND ok_free AND ok_plat AND c.slug = ANY (fl.cats))::integer
  FROM public.categories c
  UNION ALL
  SELECT 'pricing', pm.v,
         CASE pm.v WHEN 'free' THEN 'Free' WHEN 'freemium' THEN 'Freemium' WHEN 'subscription' THEN 'Subscription'
                   WHEN 'one-time' THEN 'One-time purchase' WHEN 'pay-per-use' THEN 'Pay per use'
                   WHEN 'usage-based' THEN 'Usage-based' WHEN 'contact' THEN 'Contact sales' ELSE pm.v END,
         (SELECT pg_catalog.count(*) FROM flags fl WHERE ok_cat AND ok_free AND ok_plat AND fl.pricing_model = pm.v)::integer
  FROM (SELECT DISTINCT t.pricing_model AS v FROM public.tools t
        WHERE t.status = 'published' AND t.pricing_model IS NOT NULL) pm
  UNION ALL
  SELECT 'free', 'free', 'Has a free tier',
         (SELECT pg_catalog.count(*) FROM flags WHERE ok_cat AND ok_price AND ok_plat AND has_free_tier IS TRUE)::integer
  UNION ALL
  SELECT 'platform', g.v, public.search_platform_label(g.v),
         (SELECT pg_catalog.count(*) FROM flags fl WHERE ok_cat AND ok_price AND ok_free AND g.v = ANY (fl.plats))::integer
  FROM (VALUES ('web'), ('desktop'), ('mobile'), ('api'), ('cli'), ('self-hosted'), ('browser-extension'),
               ('ide'), ('integrations')) AS g(v);
$$;

REVOKE ALL ON FUNCTION public.search_tool_facets(text, text, text, boolean, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tool_facets(text, text, text, boolean, text, boolean) TO anon, authenticated, service_role;

COMMIT;
