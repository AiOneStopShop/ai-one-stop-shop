// First-party, aggregate site statistics (migration 032).
//
// Rules (Lexi's legal check, Oct 2026):
// - Only daily counters: (day, event, dimension) -> count. No row per visit.
// - Never store or log the IP, user agent, session ID, cookie or any fingerprint.
// - Dimensions come from fixed allow-lists or are sanitized short labels
//   (utm_* values), never raw query text or form fields.
// - Failures log only a short tag and the database error code.

export const SITE_EVENTS = ['search', 'finder', 'form_success', 'utm'] as const;
export type SiteEvent = (typeof SITE_EVENTS)[number];

export const FORM_NAMES = ['newsletter', 'submit_tool', 'sponsor_request', 'sponsor_intake'] as const;
export type FormName = (typeof FORM_NAMES)[number];

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const DIM_MAX = 80;

/** Result count -> coarse bucket, so even counts can't single anyone out. */
export function resultBucket(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return '0';
  if (count <= 5) return '1-5';
  if (count <= 20) return '6-20';
  return '21+';
}

/** Removes emails, phone numbers and long digit runs, then caps length. */
export function scrubText(input: string, max = 60): string {
  return input
    .replace(/\S+@\S+/g, ' ')
    .replace(/\+?\d[\d\s().-]{5,}\d/g, ' ')
    .replace(/\d{5,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** utm value -> short, lowercase label of [a-z0-9 ._-]; '' when nothing usable is left. */
export function cleanUtmValue(raw: string | null | undefined): string {
  if (!raw) return '';
  const scrubbed = scrubText(raw.toLowerCase(), 120);
  return scrubbed.replace(/[^a-z0-9 ._-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

/**
 * Keeps only utm_* parameters from a URL's search params; everything else
 * (fbclid, gclid, msclkid, email, ref...) is dropped. Returns dimension strings
 * like "utm_source=newsletter".
 */
export function utmDimensions(params: URLSearchParams): string[] {
  const out: string[] = [];
  for (const key of UTM_KEYS) {
    const v = cleanUtmValue(params.get(key));
    if (v) out.push(`${key}=${v}`);
  }
  return out;
}

const FINDER_VALUES = /^[a-z0-9_-]{1,30}$/;

/** Validates a client stats payload into (event, dimension) pairs. Unknown input -> []. */
export function parseStatsPayload(body: unknown): Array<{ event: SiteEvent; dimension: string }> {
  if (!body || typeof body !== 'object') return [];
  const b = body as Record<string, unknown>;
  if (b.event === 'search') {
    const n = typeof b.count === 'number' ? b.count : Number(b.count);
    if (!Number.isFinite(n) || n < 0) return [];
    const cat = typeof b.category === 'string' && FINDER_VALUES.test(b.category) ? b.category : 'all';
    return [{ event: 'search', dimension: `results=${resultBucket(n)};category=${cat}` }];
  }
  if (b.event === 'finder') {
    const keys = ['useCase', 'budget', 'experience'] as const;
    const parts: string[] = [];
    for (const k of keys) {
      const v = b[k];
      if (typeof v !== 'string' || !FINDER_VALUES.test(v)) return [];
      parts.push(`${k}=${v}`);
    }
    const n = typeof b.count === 'number' ? b.count : Number(b.count);
    parts.push(`results=${resultBucket(Number.isFinite(n) ? n : 0)}`);
    return [{ event: 'finder', dimension: parts.join(';') }];
  }
  return [];
}

export type IncrementFn = (event: SiteEvent, dimension: string) => Promise<{ error: { code?: string } | null }>;

/** Records one aggregate count. Best effort; logs only the tag and error code. */
export async function recordSiteEvent(
  event: SiteEvent,
  dimension: string,
  increment?: IncrementFn,
  log: (m: string) => void = (m) => console.warn(m)
): Promise<boolean> {
  if (!SITE_EVENTS.includes(event)) return false;
  const dim = dimension.slice(0, DIM_MAX);
  try {
    const inc = increment ?? (await defaultIncrement());
    if (!inc) return false;
    const { error } = await inc(event, dim);
    if (error) {
      log(`[site-stats] ${event} not counted: ${error.code ?? 'unknown'}`);
      return false;
    }
    return true;
  } catch {
    log(`[site-stats] ${event} not counted: exception`);
    return false;
  }
}

export function recordFormSuccess(form: FormName, increment?: IncrementFn): Promise<boolean> {
  return recordSiteEvent('form_success', form, increment);
}

async function defaultIncrement(): Promise<IncrementFn | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { getServiceSupabase } = await import('@/lib/supabase');
  const sb = getServiceSupabase();
  return async (event, dimension) => {
    const { error } = await sb.rpc('increment_site_event', { p_event: event, p_dimension: dimension });
    return { error };
  };
}

/**
 * Edge-safe increment (middleware): plain fetch to PostgREST, no supabase-js.
 * Used for utm_* counts on landing.
 */
export async function incrementViaRest(event: SiteEvent, dimension: string): Promise<{ error: { code?: string } | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: { code: 'not_configured' } };
  const res = await fetch(`${url}/rest/v1/rpc/increment_site_event`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_event: event, p_dimension: dimension.slice(0, DIM_MAX) }),
    cache: 'no-store',
  });
  return res.ok ? { error: null } : { error: { code: String(res.status) } };
}
