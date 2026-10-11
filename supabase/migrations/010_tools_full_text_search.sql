-- Weighted full-text search on tools, plus pg_trgm for typo tolerance.
-- Category text is denormalized onto tools so a generated tsvector can include it.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS search_categories TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.sync_tool_search_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  tool_ids uuid[] := ARRAY[]::uuid[];
  tid uuid;
BEGIN
  IF TG_TABLE_NAME = 'categories' THEN
    SELECT pg_catalog.array_agg(tc.tool_id)
      INTO tool_ids
    FROM public.tool_categories tc
    WHERE tc.category_id = COALESCE(NEW.id, OLD.id);
  ELSE
    tool_ids := ARRAY[COALESCE(NEW.tool_id, OLD.tool_id)];
  END IF;

  IF tool_ids IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  FOREACH tid IN ARRAY tool_ids LOOP
    UPDATE public.tools t
    SET search_categories = COALESCE((
      SELECT pg_catalog.string_agg(
        pg_catalog.concat_ws(' ', c.name, c.slug, c.description),
        ' '
      )
      FROM public.tool_categories tc
      JOIN public.categories c ON c.id = tc.category_id
      WHERE tc.tool_id = tid
    ), '')
    WHERE t.id = tid;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_search_categories_on_tool_categories ON public.tool_categories;
CREATE TRIGGER sync_search_categories_on_tool_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tool_search_categories();

DROP TRIGGER IF EXISTS sync_search_categories_on_categories ON public.categories;
CREATE TRIGGER sync_search_categories_on_categories
  AFTER UPDATE OF name, slug, description ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tool_search_categories();

UPDATE public.tools t
SET search_categories = COALESCE((
  SELECT pg_catalog.string_agg(
    pg_catalog.concat_ws(' ', c.name, c.slug, c.description),
    ' '
  )
  FROM public.tool_categories tc
  JOIN public.categories c ON c.id = tc.category_id
  WHERE tc.tool_id = t.id
), '');

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    pg_catalog.setweight(
      pg_catalog.to_tsvector(
        'english'::pg_catalog.regconfig,
        pg_catalog.coalesce(name, '')
      ),
      'A'
    ) ||
    pg_catalog.setweight(
      pg_catalog.to_tsvector(
        'english'::pg_catalog.regconfig,
        pg_catalog.concat_ws(
          ' ',
          tagline,
          search_categories,
          pg_catalog.array_to_string(COALESCE(tags, ARRAY[]::text[]), ' '),
          pg_catalog.array_to_string(COALESCE(features, ARRAY[]::text[]), ' ')
        )
      ),
      'B'
    ) ||
    pg_catalog.setweight(
      pg_catalog.to_tsvector(
        'english'::pg_catalog.regconfig,
        pg_catalog.coalesce(description, '')
      ),
      'C'
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS tools_search_vector_gin
  ON public.tools USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS tools_name_trgm
  ON public.tools USING GIN (name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tools_tagline_trgm
  ON public.tools USING GIN (tagline extensions.gin_trgm_ops);

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
  v_raw := pg_catalog.left(pg_catalog.btrim(pg_catalog.coalesce(q, '')), 100);
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
      v_tsquery := pg_catalog.websearch_to_tsquery('english'::pg_catalog.regconfig, v_expanded);
    EXCEPTION WHEN OTHERS THEN
      v_tsquery := NULL;
    END;
  END IF;

  v_limit := LEAST(GREATEST(COALESCE("limit", 50), 1), 50);
  v_offset := GREATEST(COALESCE("offset", 0), 0);
  v_category := NULLIF(pg_catalog.btrim(pg_catalog.coalesce(category, '')), 'all');
  v_price := NULLIF(pg_catalog.btrim(pg_catalog.coalesce(price, '')), 'all');
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
        ELSE pg_catalog.coalesce(pg_catalog.ts_rank_cd(t.search_vector, v_tsquery), 0) * 2.0
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
          ELSE 0.5 * extensions.similarity(pg_catalog.coalesce(t.tagline, ''), v_safe)
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
        AND extensions.similarity(pg_catalog.coalesce(t.tagline, ''), v_safe) >= 0.25
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

REVOKE ALL ON FUNCTION public.sync_tool_search_categories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_tool_search_categories() TO service_role;
