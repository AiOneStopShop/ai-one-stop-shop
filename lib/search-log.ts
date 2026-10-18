import { sanitizeSearchQuery } from '@/lib/search-tools';

export type SearchLogRow = { query: string; result_count: number };

/**
 * Validates a client search-log payload. Only the normalized query text and the
 * result count are kept: no IP, user id, user agent or referrer is ever stored.
 */
export function parseSearchLogPayload(body: unknown): SearchLogRow | null {
  if (!body || typeof body !== 'object') return null;
  const { q, count } = body as { q?: unknown; count?: unknown };
  if (typeof q !== 'string') return null;
  const query = sanitizeSearchQuery(q);
  if (query.length < 2) return null;
  const n = typeof count === 'number' ? count : Number(count);
  if (!Number.isInteger(n) || n < 0 || n > 100000) return null;
  // Drop anything that looks like an email address or a long number (likely personal data).
  if (/\S+@\S+\.\S+/.test(query) || /\d{6,}/.test(query)) return null;
  return { query, result_count: n };
}
