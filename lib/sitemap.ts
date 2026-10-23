import type { MetadataRoute } from 'next';
import { TAXONOMY } from './taxonomy';

/**
 * Sitemap building, kept separate from app/sitemap.ts so it can be unit tested.
 *
 * Why this is defensive: Next.js turns each entry's lastModified into text with
 * Date#toISOString(), which throws on an invalid date, and it writes <loc> without
 * escaping. One bad row, or a database query that throws or hangs, used to turn the
 * whole /sitemap.xml into an HTTP 500. Now a bad row is skipped or patched and a
 * failed query just means that section is left out (static pages always ship).
 */

export const DEFAULT_SITEMAP_BASE_URL = 'https://www.aionestop.shop';
export const SITEMAP_QUERY_TIMEOUT_MS = 8000;

export const STATIC_SITEMAP_ROUTES = [
  '',
  '/tools',
  '/categories',
  '/our-kits',
  '/pricing',
  '/about',
  '/how-we-rank',
  '/disclosure',
  '/privacy',
  '/terms',
  '/submit',
  '/finder',
  '/compare',
  '/personas',
  '/personas/sarah',
  '/personas/fred',
  '/personas/claire',
  '/personas/steve',
  '/budget',
  '/advertise',
  '/advertise/request',
  '/partners',
  '/newsletter',
] as const;

export type SitemapToolRow = { slug?: unknown; updated_at?: unknown; last_verified_at?: unknown };
export type SitemapCategoryRow = { slug?: unknown; updated_at?: unknown };

export function sitemapBaseUrl(envValue: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  const trimmed = (envValue || '').trim().replace(/\/+$/, '');
  return trimmed || DEFAULT_SITEMAP_BASE_URL;
}

/** A Date that is safe to hand to Next (never "Invalid Date"). */
export function safeDate(now: Date, ...candidates: unknown[]): Date {
  for (const value of candidates) {
    if (value === null || value === undefined || value === '') continue;
    const date = value instanceof Date ? value : new Date(value as string | number);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return now;
}

/** URL path segment for a slug, or null if the slug is unusable. Encoding also keeps the XML valid. */
export function slugSegment(slug: unknown): string | null {
  if (typeof slug !== 'string') return null;
  const trimmed = slug.trim();
  if (!trimmed) return null;
  return encodeURIComponent(trimmed);
}

export function buildSitemap(options: {
  baseUrl: string;
  tools: SitemapToolRow[] | null | undefined;
  categories: SitemapCategoryRow[] | null | undefined;
  now?: Date;
}): MetadataRoute.Sitemap {
  const now = options.now ?? new Date();
  const base = options.baseUrl.replace(/\/+$/, '');

  const staticPages: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const seen = new Set(staticPages.map((entry) => entry.url));
  const add = (list: MetadataRoute.Sitemap, entry: MetadataRoute.Sitemap[number]) => {
    if (seen.has(entry.url)) return;
    seen.add(entry.url);
    list.push(entry);
  };

  const toolPages: MetadataRoute.Sitemap = [];
  for (const tool of Array.isArray(options.tools) ? options.tools : []) {
    const segment = slugSegment(tool?.slug);
    if (!segment) continue;
    add(toolPages, {
      url: `${base}/tools/${segment}`,
      lastModified: safeDate(now, tool.last_verified_at, tool.updated_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  const liveCategories = Array.isArray(options.categories)
    ? options.categories.filter((category) => slugSegment(category?.slug))
    : [];
  const categories: SitemapCategoryRow[] = liveCategories.length > 0
    ? liveCategories
    : TAXONOMY.map((category) => ({ slug: category.slug }));

  const categoryPages: MetadataRoute.Sitemap = [];
  for (const category of categories) {
    const segment = slugSegment(category.slug);
    if (!segment) continue;
    add(categoryPages, {
      url: `${base}/category/${segment}`,
      lastModified: safeDate(now, category.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return [...staticPages, ...toolPages, ...categoryPages];
}

/**
 * Run a Supabase-style query and return its rows, or null if it errors, throws, or
 * takes longer than timeoutMs. Never throws.
 */
export async function safeRows<T>(
  label: string,
  run: () => PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>,
  timeoutMs: number = SITEMAP_QUERY_TIMEOUT_MS
): Promise<T[] | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    const result = await Promise.race([Promise.resolve(run()), timeout]);
    if (result?.error) {
      console.error(`[sitemap] ${label} query failed: ${result.error.message ?? 'unknown error'}`);
      return null;
    }
    return Array.isArray(result?.data) ? result.data : null;
  } catch (error) {
    console.error(`[sitemap] ${label} query threw: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
