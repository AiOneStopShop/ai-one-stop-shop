-- LLM API and service pricing table
-- Tracks costs for AI models, API services, and consumer plans

CREATE TABLE IF NOT EXISTS public.llm_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'xai', 'mistral', 'github', etc
  category TEXT NOT NULL CHECK (category IN ('api-model', 'consumer-plan', 'agent-service', 'local')),
  
  -- Pricing (NULL when unavailable or not applicable; per 1M tokens for API models)
  input_price_per_1m NUMERIC(10,2), -- $ per 1M input tokens
  output_price_per_1m NUMERIC(10,2), -- $ per 1M output tokens
  cached_input_price_per_1m NUMERIC(10,2), -- $ per 1M cached input tokens (if provider offers)
  context_window_tokens BIGINT, -- max context window size
  
  -- For consumer plans and agents (monthly subscription)
  monthly_price NUMERIC(8,2), -- monthly subscription price in USD
  has_free_tier BOOLEAN NOT NULL DEFAULT false,
  free_tier_note TEXT, -- description of free tier
  
  -- Metadata
  source_url TEXT NOT NULL, -- URL to official pricing page
  last_checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT, -- additional context, limitations, or special pricing details
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_llm_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER llm_pricing_updated_at
  BEFORE UPDATE ON public.llm_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_llm_pricing_updated_at();

-- RLS policies
ALTER TABLE public.llm_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "llm_pricing_public_read"
  ON public.llm_pricing FOR SELECT
  TO PUBLIC
  USING (true);

-- Service role write access
CREATE POLICY "llm_pricing_service_write"
  ON public.llm_pricing FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.llm_pricing TO anon, authenticated;
GRANT ALL ON public.llm_pricing TO service_role;

-- Seed data with verified pricing as of 2026-10-13
INSERT INTO public.llm_pricing (slug, name, provider, category, input_price_per_1m, output_price_per_1m, cached_input_price_per_1m, context_window_tokens, monthly_price, has_free_tier, free_tier_note, source_url, notes) VALUES

-- OpenAI API Models
('gpt-4o', 'GPT-4o', 'openai', 'api-model', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://openai.com/api/pricing/', 'Legacy model; see GPT-5.6 or GPT-6 series for latest. Pricing not listed on current pricing page.'),

-- Anthropic API Models
('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 'api-model', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://www.anthropic.com/pricing', 'Legacy model; see Claude Sonnet 5.5 or Opus 5.5 for latest.'),
('claude-fable-5-1', 'Claude Fable 5.1', 'anthropic', 'api-model', 10.00, 50.00, 0.25, 1000000, NULL, false, NULL, 'https://www.anthropic.com/pricing', 'Next generation intelligence for long-running agents. Prompt caching: Read $0.25, Write $12.50 per MTok.'),
('claude-opus-5-5', 'Claude Opus 5.5', 'anthropic', 'api-model', 4.00, 20.00, 0.20, 1000000, NULL, false, NULL, 'https://www.anthropic.com/pricing', 'Daily driver for agentic coding and enterprise work. Prompt caching: Read $0.20, Write $5 per MTok.'),
('claude-sonnet-5-5', 'Claude Sonnet 5.5', 'anthropic', 'api-model', 2.00, 10.00, NULL, 1000000, NULL, false, NULL, 'https://www.anthropic.com/pricing', 'High-performance model for coding and agents. Prompt caching available.'),
('claude-haiku-5-5', 'Claude Haiku 5.5', 'anthropic', 'api-model', 0.50, 2.50, 0.125, 1000000, NULL, false, NULL, 'https://www.anthropic.com/pricing', 'Fastest, most cost-efficient model. Prompt caching: Read $0.125, Write $0.625 per MTok (prompts ≤100K tokens).'),

-- Google Gemini API Models
('gemini-3-8-flash', 'Gemini 3.8 Flash', 'google', 'api-model', 1.50, 7.50, 0.15, NULL, NULL, true, 'Free tier available', 'https://ai.google.dev/pricing', 'Through December 31, 2026: $0.75 input, $3.75 output. Starting January 1, 2027: $1.50 input, $7.50 output per 1M tokens.'),
('gemini-3-6-flash', 'Gemini 3.6 Flash', 'google', 'api-model', 1.50, 7.50, 0.15, NULL, NULL, true, 'Free tier available', 'https://ai.google.dev/pricing', 'Previous generation Flash model. Through December 31, 2026: $0.75 input, $3.75 output. Starting January 1, 2027: $1.50 input, $7.50 output per 1M tokens.'),
('gemini-pro', 'Gemini Pro', 'google', 'api-model', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://ai.google.dev/pricing', 'See Gemini 3.1 Pro Preview or Gemini 3.8 Flash for current models.'),

-- xAI (Grok) API Models  
('grok-4-7', 'Grok 4.7', 'xai', 'api-model', 2.00, 6.00, NULL, 500000, NULL, false, NULL, 'https://x.ai/api', 'Newest flagship model for coding and knowledge work. 500k context window.'),

-- Mistral API Model
('mistral-vibe', 'Mistral Vibe', 'mistral', 'api-model', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://docs.mistral.ai/getting-started/pricing/', 'See provider for latest API pricing.'),

-- Consumer Chat Plans
('chatgpt-plus', 'ChatGPT Plus', 'openai', 'consumer-plan', NULL, NULL, NULL, NULL, 20.00, true, 'ChatGPT Free available', 'https://openai.com/api/pricing/', '$20/month (or $25 billed monthly). ChatGPT Go is $10/month. ChatGPT Business starts at $20/month per seat.'),
('claude-pro', 'Claude Pro', 'anthropic', 'consumer-plan', NULL, NULL, NULL, NULL, 17.00, true, 'Free plan available', 'https://www.anthropic.com/pricing', '$17/month (annual), $20/month (monthly). More usage, Claude Code, Projects, and more models.'),
('claude-max', 'Claude Max', 'anthropic', 'consumer-plan', NULL, NULL, NULL, NULL, 100.00, false, NULL, 'https://www.anthropic.com/pricing', 'From $100/month (5x Pro usage) to $200/month (20x Pro usage). Includes $100-$200/month in API credits.'),
('gemini-pro-plan', 'Gemini Pro (plan)', 'google', 'consumer-plan', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://gemini.google.com/', 'Check Google for current Gemini consumer plan pricing.'),
('perplexity', 'Perplexity Pro', 'perplexity', 'consumer-plan', NULL, NULL, NULL, NULL, 20.00, true, 'Free tier available', 'https://www.perplexity.ai/hub/pricing', '$20/month. AI-powered search and research.'),

-- GitHub Copilot Plans
('github-copilot-free', 'GitHub Copilot Free', 'github', 'consumer-plan', NULL, NULL, NULL, NULL, 0.00, true, 'Limited: 2000 completions, 50 chat requests', 'https://github.com/features/copilot/plans', 'Free plan with limited functionality for individual developers.'),
('github-copilot-pro', 'GitHub Copilot Pro', 'github', 'consumer-plan', NULL, NULL, NULL, NULL, 10.00, false, NULL, 'https://github.com/features/copilot/plans', '$10/month. Includes $15/month in GitHub AI Credits, code completion, chat, agent mode, CLI.'),
('github-copilot-pro-plus', 'GitHub Copilot Pro+', 'github', 'consumer-plan', NULL, NULL, NULL, NULL, 39.00, false, NULL, 'https://github.com/features/copilot/plans', '$39/month. Includes $70/month in GitHub AI Credits for heavier usage.'),
('github-copilot-max', 'GitHub Copilot Max', 'github', 'consumer-plan', NULL, NULL, NULL, NULL, 100.00, false, NULL, 'https://github.com/features/copilot/plans', '$100/month. Built for heavy usage, includes $200/month in GitHub AI Credits.'),

-- Coding Agents (provider-billed)
('claude-code', 'Claude Code', 'anthropic', 'agent-service', NULL, NULL, NULL, NULL, NULL, false, 'Included in Claude Pro, Pro+, Team, and Enterprise plans', 'https://www.anthropic.com/pricing', 'Terminal-based coding agent. Shares usage pool with your Claude plan.'),
('gemini-cli', 'Gemini CLI', 'google', 'agent-service', NULL, NULL, NULL, NULL, NULL, false, NULL, 'https://ai.google.dev/', 'CLI access to Gemini models. Check Google for current availability and pricing.'),

-- Local / Open-Source (no API charges)
('ollama', 'Ollama', 'ollama', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://ollama.com/', 'Run Llama, Mistral, Gemma, and other open models locally. Free software; you pay for your own hardware/cloud compute.'),
('llama-cpp', 'llama.cpp', 'llama-cpp', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://github.com/ggerganov/llama.cpp', 'C++ inference engine for LLaMA and other models. Free software; you pay for your own hardware/cloud compute.'),
('localai', 'LocalAI', 'localai', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://localai.io/', 'OpenAI-compatible API for running models locally. Free software; you pay for your own hardware/cloud compute.'),
('jan', 'Jan', 'jan', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://jan.ai/', 'Open-source ChatGPT alternative that runs offline. Free software; you pay for your own hardware/cloud compute.'),
('anythingllm', 'AnythingLLM', 'anythingllm', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://anythingllm.com/', 'Full-stack application for RAG and agents. Free software; you pay for your own hardware/cloud compute.'),
('librechat', 'LibreChat', 'librechat', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://www.librechat.ai/', 'Open-source ChatGPT clone. Free software; you pay for your own hardware/cloud compute.'),
('cherry-studio', 'Cherry Studio', 'cherry-studio', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://cherry-ai.com/', 'Desktop AI assistant supporting multiple providers and local models. Free software; you pay for your own hardware/cloud compute.'),
('huggingchat', 'HuggingChat', 'huggingface', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free web version; self-host available', 'https://huggingface.co/chat/', 'Open-source chat interface for Hugging Face models. Free web version available; self-hosting costs vary.'),
('privategpt', 'PrivateGPT', 'privategpt', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://privategpt.dev/', 'Private document Q&A with local models. Free software; you pay for your own hardware/cloud compute.'),
('continue', 'Continue', 'continue', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free VS Code/JetBrains extension', 'https://continue.dev/', 'Open-source AI code assistant. Works with local and cloud models. Free extension; API costs depend on provider.'),
('onyx', 'Onyx', 'onyx', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://www.danswer.ai/', 'Enterprise search and AI assistant (formerly Danswer). Free software; you pay for your own hardware/cloud compute.'),
('open-notebook', 'Open Notebook LM', 'open-notebook', 'local', NULL, NULL, NULL, NULL, 0.00, true, 'Free to run locally; hosting costs vary', 'https://github.com/gabrielchua/open-notebooklm', 'Open-source alternative to NotebookLM. Free software; you pay for your own hardware/cloud compute.');

COMMENT ON TABLE public.llm_pricing IS 'LLM API, plan, and agent pricing. Prices from official provider pages, checked 2026-10-13.';
