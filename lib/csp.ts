// Content-Security-Policy for HTML responses, built per request in middleware.ts.
// Scripts need the per-request nonce; 'strict-dynamic' lets those trusted scripts
// load their own chunks (Next.js) and the consented Vercel Analytics script.
// 'unsafe-inline' stays out of script-src (tests/csp.spec.ts enforces this);
// it remains in style-src for now (Next/Tailwind inline styles).
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function buildCsp(nonce: string, isDev = process.env.NODE_ENV === 'development'): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Fallback for very old browsers without strict-dynamic; ignored by modern ones.
    'https:',
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
