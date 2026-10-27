import { sanitizeSearchQuery } from '@/lib/search-tools';
import { scrubText } from '@/lib/site-stats';

export type SearchLogRow = { query: string; result_count: number };

/**
 * Validates a client search-log payload. Only the normalized query text and the
 * result count are kept: no IP, user id, user agent or referrer is ever stored.
 */
export function parseSearchLogPayload(body: unknown): SearchLogRow | null {
  if (!body || typeof body !== 'object') return null;
  const { q, count } = body as { q?: unknown; count?: unknown };
  if (typeof q !== 'string') return null;
  // Search text is kept only because zero-result queries drive search tuning.
  // Emails and phone numbers are stripped, length is capped at 60, and rows are
  // deleted after 30 days (delete_old_search_queries, migration 032).
  const raw = sanitizeSearchQuery(q);
  if (/\S+@\S+\.\S+/.test(raw) || /\d{6,}/.test(raw)) return null;
  const query = scrubText(raw, 60);
  if (query.length < 2) return null;
  const n = typeof count === 'number' ? count : Number(count);
  if (!Number.isInteger(n) || n < 0 || n > 100000) return null;
  return { query, result_count: n };
}
