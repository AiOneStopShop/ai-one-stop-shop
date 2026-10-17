-- Fine-grained catalog taxonomy, admin-only hold notes, and remapping of tool_categories.

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS review_notes TEXT
  CHECK (review_notes IS NULL OR char_length(review_notes) <= 5000);

COMMENT ON COLUMN public.tools.review_notes IS
  'Admin-only hold and review reasons. Never select this column in the public API or public pages.';

INSERT INTO public.categories (slug, name, description, icon, sort_order)
VALUES
  ('chat-assistants', 'Chat assistants', 'General chat models and assistants for questions, drafts, and everyday work', '💬', 1),
  ('writing', 'Writing', 'Draft, edit, and polish copy, posts, and documents', '✍️', 2),
  ('image', 'Image', 'Generate and edit images from a prompt', '🖼️', 3),
  ('video', 'Video', 'Generate, edit, caption, and repurpose video', '🎬', 4),
  ('audio-voice', 'Audio and voice', 'Speech, voice, transcription, and text-to-speech', '🎙️', 5),
  ('music', 'Music', 'Generate songs, beats, and background music', '🎵', 6),
  ('coding', 'Coding', 'AI pair programmers, coding agents, and app builders', '💻', 7),
  ('agents-automation', 'Agents and automation', 'Autonomous agents and workflow automation', '🤖', 8),
  ('research-notes', 'Research and notes', 'Research, notes, documents, and knowledge workspaces', '📚', 9),
  ('email', 'Email', 'Inbox, outreach, and email drafting', '✉️', 10),
  ('slides', 'Slides and presentations', 'Decks, slides, and visual presentations', '📊', 11),
  ('design', 'Design', 'Layouts, graphics, and visual design', '🎨', 12),
  ('marketing', 'Marketing', 'Campaigns, social posts, and go-to-market copy', '📈', 13),
  ('productivity', 'Productivity', 'Everyday work tools that do not fit a more specific job', '⚡', 14),
  ('local-open-source', 'Local and open-source models', 'Run models locally, self-host, or use open weights', '🏠', 15),
  ('skills', 'Skills', 'Skill packs, rules, and MCP integrations that teach your AI assistant new abilities', '🧩', 16)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

CREATE OR REPLACE FUNCTION public.classify_tool_categories(
  p_name text,
  p_slug text,
  p_tagline text,
  p_description text,
  p_tags text[],
  p_features text[]
)
RETURNS TABLE (slug text, is_primary boolean)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  hay text;
  matched text[] := ARRAY[]::text[];
  primary_slug text;
  candidate text;
  priority text[] := ARRAY[
    'music',
    'video',
    'audio-voice',
    'slides',
    'email',
    'image',
    'writing',
    'coding',
    'agents-automation',
    'research-notes',
    'chat-assistants',
    'design',
    'marketing',
    'local-open-source',
    'skills',
    'productivity'
  ];
BEGIN
  hay := pg_catalog.lower(pg_catalog.concat_ws(
    ' ',
    COALESCE(p_name, ''),
    COALESCE(p_slug, ''),
    COALESCE(p_tagline, ''),
    pg_catalog.array_to_string(COALESCE(p_tags, ARRAY[]::text[]), ' ')
  ));

  IF hay ~ '\m(music|song-generation|beats|background-music|suno|udio|soundraw)\M' THEN
    matched := array_append(matched, 'music');
  END IF;
  IF hay ~ 'video|text-to-video|captions|subtitles|short-form|ai-avatars|descript|runway|pika|heygen|synthesia|capcut|opusclip|kdenlive' THEN
    matched := array_append(matched, 'video');
  END IF;
  IF hay ~ 'audio|voice|transcription|text-to-speech|voice-cloning|voiceover|whisper|dubbing|elevenlabs|murf|otter|fireflies' THEN
    matched := array_append(matched, 'audio-voice');
  END IF;
  IF hay ~ 'slides|presentations|infographics|beautiful.ai|napkin' OR hay ~ '\m(gamma|pitch)\M' THEN
    matched := array_append(matched, 'slides');
  END IF;
  IF hay ~ 'email|gmail|inbox|shortwave|superhuman|lavender' THEN
    matched := array_append(matched, 'email');
  END IF;
  IF hay ~ 'image|text-to-image|photos|stable-diffusion|midjourney|dall-e|ideogram|leonardo|firefly|invoke|comfyui' THEN
    matched := array_append(matched, 'image');
  END IF;
  IF hay ~ 'writing|copywrit|grammarly|jasper|copy.ai' THEN
    matched := array_append(matched, 'writing');
  END IF;
  IF hay ~ 'coding|developer|copilot|cursor|replit|bolt|windsurf|cline|codex|continue|lovable|opencode|jetbrains|vscode|pair programmer' OR hay ~ '\mv0\M' THEN
    matched := array_append(matched, 'coding');
  END IF;
  IF hay ~ 'agents|automation|multi-agent|browser-automation|workflows|zapier|autogpt|agentgpt|langchain|lindy|skyvern|activepieces' OR hay ~ '\m(agent|rpa)\M' THEN
    matched := array_append(matched, 'agents-automation');
  END IF;
  IF hay ~ 'research|notes|documents|citations|academic|papers|knowledge-base|notebooklm|rag|notion|elicit|consensus|perplexity|granola|\mmem\M|paperless' OR hay ~ '\mpdf\M' THEN
    matched := array_append(matched, 'research-notes');
  END IF;
  IF hay ~ 'chat|chatgpt|librechat|cherry studio' OR hay ~ '\m(assistant|claude|gemini)\M' THEN
    matched := array_append(matched, 'chat-assistants');
  END IF;
  IF hay ~ 'design|creative|diagrams|typography|visuals|canva' THEN
    matched := array_append(matched, 'design');
  END IF;
  IF hay ~ 'marketing|social-media|sales|campaign' THEN
    matched := array_append(matched, 'marketing');
  END IF;
  IF hay ~ 'local-llm|self-hosted|offline|ollama|llama.cpp|localai|privategpt|open weights' THEN
    matched := array_append(matched, 'local-open-source');
  END IF;
  IF hay ~ 'skill|skills|mcp|integration|rule|prompt|extension|plugin|skill pack|teach' THEN
    matched := array_append(matched, 'skills');
  END IF;

  IF pg_catalog.array_length(matched, 1) IS NULL THEN
    matched := ARRAY['productivity'];
  END IF;

  IF pg_catalog.lower(COALESCE(p_slug, '') || ' ' || COALESCE(p_name, '')) ~ 'chatgpt|claude-pro|gemini-pro'
     OR pg_catalog.lower(COALESCE(p_name, '')) ~ 'chatgpt plus|claude pro|gemini pro' THEN
    primary_slug := 'chat-assistants';
  ELSIF hay ~ 'local-llm|ollama|llama.cpp|localai' THEN
    primary_slug := 'local-open-source';
  ELSE
    primary_slug := NULL;
    FOREACH candidate IN ARRAY priority LOOP
      IF candidate = ANY (matched) THEN
        primary_slug := candidate;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  primary_slug := COALESCE(primary_slug, 'productivity');
  IF NOT primary_slug = ANY (matched) THEN
    matched := array_append(matched, primary_slug);
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (c.slug)
    c.slug,
    (c.slug = primary_slug) AS is_primary
  FROM pg_catalog.unnest(matched) AS c(slug)
  ORDER BY c.slug, (c.slug = primary_slug) DESC;
END;
$$;

DELETE FROM public.tool_categories;

INSERT INTO public.tool_categories (tool_id, category_id, is_primary)
SELECT
  t.id,
  c.id,
  cls.is_primary
FROM public.tools t
CROSS JOIN LATERAL public.classify_tool_categories(
  t.name,
  t.slug,
  t.tagline,
  t.description,
  t.tags,
  t.features
) cls
JOIN public.categories c ON c.slug = cls.slug;

DELETE FROM public.categories
WHERE slug IN ('content', 'ai-models')
  AND NOT EXISTS (
    SELECT 1 FROM public.tool_categories tc WHERE tc.category_id = categories.id
  );

GRANT EXECUTE ON FUNCTION public.classify_tool_categories(text, text, text, text, text[], text[]) TO service_role;
