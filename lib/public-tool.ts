const DEFAULT_SITE_URL = 'https://aionestop.shop';

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export type PublicTool = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category: { slug: string; name: string } | null;
  pricing_model: string | null;
  has_free_tier: boolean;
  pricing_summary: string | null;
  website_url: string | null;
  logo_url: string | null;
  go_url: string;
  updated_at: string | null;
};

function primaryCategory(tool: any): { slug: string; name: string } | null {
  const relations = tool.tool_categories || [];
  const primary = relations.find((relation: any) => relation?.is_primary)?.categories
    || relations[0]?.categories
    || (Array.isArray(tool.categories) ? tool.categories[0] : null);
  if (!primary?.slug || !primary?.name) return null;
  return { slug: primary.slug, name: primary.name };
}

export function toPublicTool(tool: any, siteUrl = getSiteUrl()): PublicTool {
  return {
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline ?? null,
    description: tool.description ?? null,
    category: primaryCategory(tool),
    pricing_model: tool.pricing_model ?? null,
    has_free_tier: Boolean(tool.has_free_tier),
    pricing_summary: tool.pricing_summary ?? null,
    website_url: tool.website_url ?? null,
    logo_url: tool.logo_url ?? null,
    go_url: `${siteUrl.replace(/\/$/, '')}/go/${tool.slug}`,
    updated_at: tool.updated_at ?? null,
  };
}
