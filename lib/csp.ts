// Static Content-Security-Policy for HTML responses, set in middleware.ts.
// No per-request nonce, so catalog pages can be prerendered / ISR-cached.
// script-src allows first-party scripts (Next chunks, /cookie-banner-boot.js)
// and the consented Vercel Analytics host.
//
// 'unsafe-inline' is required: Next.js 15 prerendered HTML includes many
// unique per-page inline `self.__next_f.push(...)` flight scripts. A single
// hash-based policy cannot cover them, and a nonce would stale-mismatch on
// cached pages. 'strict-dynamic' is omitted because it would ignore 'self'.
// 'unsafe-inline' remains in style-src as well (Next/Tailwind inline styles).
export function buildCsp(isDev = process.env.NODE_ENV === 'development'): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://va.vercel-scripts.com',
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/**
 * True when a POST carries a Next.js server-action header from another origin.
 * Next would reject it anyway, but with a 500; we answer 403 first.
 */
export function isCrossOriginServerAction(req: {
  method: string;
  headers: Headers;
  host: string;
}): boolean {
  if (req.method !== 'POST' || !req.headers.has('next-action')) return false;
  const origin = req.headers.get('origin');
  if (!origin) return false; // same-origin fetches from older browsers may omit it; Next checks further.
  if (origin === 'null') return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return true;
  }
  const forwarded = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const expected = forwarded || req.headers.get('host') || req.host;
  return originHost.toLowerCase() !== expected.toLowerCase();
}
