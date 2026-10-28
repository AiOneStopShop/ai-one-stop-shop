// Where an outbound /go click came from, without PII.
// - page_path: the on-site page the visitor clicked from (same-origin Referer
//   pathname, or a validated ?from=/path fallback). Never a query string.
// - referrer: same-site Referer trimmed to origin + pathname; other sites keep
//   only their origin (no path, query, fragment or credentials).

const MAX_LEN = 300;

export function cleanPath(raw: string | null | undefined): string {
  if (!raw) return '';
  // Only site-relative paths: "/x", never "//host" or "/\host".
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '';
  try {
    const u = new URL(raw, 'https://placeholder.invalid');
    if (u.origin !== 'https://placeholder.invalid') return '';
    return u.pathname.slice(0, MAX_LEN);
  } catch {
    return '';
  }
}

export function clickContext(
  refererHeader: string | null,
  fromParam: string | null,
  siteHost: string | null
): { referrer: string; pagePath: string } {
  let referrer = '';
  let pagePath = '';
  if (refererHeader) {
    try {
      const u = new URL(refererHeader);
      if (u.protocol === 'https:' || u.protocol === 'http:') {
        const sameSite =
          !!siteHost && u.host.replace(/^www\./, '').toLowerCase() === siteHost.replace(/^www\./, '').toLowerCase();
        // Our own pages keep their path; other sites keep only their origin.
        referrer = (sameSite ? u.origin + u.pathname : u.origin).slice(0, MAX_LEN);
        if (sameSite) pagePath = u.pathname.slice(0, MAX_LEN);
      }
    } catch {
      // Malformed Referer: ignore.
    }
  }
  if (!pagePath) pagePath = cleanPath(fromParam);
  return { referrer, pagePath };
}

// Bot detection for /go clicks. Everything here is read from request headers
// at request time and thrown away: no user agent, IP or fingerprint is stored.
//
// A click counts as a real (non-bot) click only when it looks like a person
// clicking a link in a browser:
//  * the user agent is not a crawler, AI agent, link checker, HTTP library or
//    headless/automation browser;
//  * Accept-Language is present (scripted clients usually omit it);
//  * it is a top-level navigation: if the browser sends Sec-Fetch-Mode it must
//    be "navigate" (prefetch, fetch() and link checkers fail this), and
//    Sec-Purpose/Purpose "prefetch" is never a click;
//  * a request with neither a Referer nor any Sec-Fetch-* header is treated as
//    automated: every current browser sends one or the other on a link click.
const BOT_UA = new RegExp(
  [
    'bot', 'crawl', 'spider', 'scrap', 'slurp', 'archiver', 'fetcher', 'preview', 'monitor', 'checker',
    // search + AI crawlers / agents that don't say "bot"
    'google-inspectiontool', 'googleother', 'google-extended', 'storebot', 'mediapartners', 'adsbot',
    'bingpreview', 'msnbot', 'yandex', 'baiduspider', 'duckduck', 'petalbot', 'applebot', 'seznam',
    'gptbot', 'chatgpt-user', 'oai-searchbot', 'claude', 'anthropic', 'perplexity', 'cohere-ai', 'ccbot',
    'bytespider', 'amazonbot', 'meta-externalagent', 'facebookexternalhit', 'twitterbot', 'diffbot',
    'semrush', 'ahrefs', 'mj12', 'dotbot', 'dataforseo', 'screaming frog', 'sitebulb', 'lighthouse',
    'pagespeed', 'gtmetrix', 'pingdom', 'uptime', 'statuscake', 'linkcheck', 'link-check', 'w3c_validator',
    'validator', 'linkinator', 'lychee', 'muffet',
    // HTTP libraries and tools
    'curl', 'wget', 'httpie', 'python', 'aiohttp', 'httpx', 'requests', 'urllib', 'scrapy', 'go-http-client',
    'okhttp', 'java/', 'apache-httpclient', 'httpclient', 'axios', 'node-fetch', 'undici', 'got \\(', 'deno',
    'bun/', 'libwww', 'lwp', 'ruby', 'php', 'postman', 'insomnia', 'powershell', 'winhttp', 'reqwest',
    // headless / automation browsers
    'headless', 'puppeteer', 'playwright', 'phantomjs', 'selenium', 'webdriver', 'cypress', 'electron',
    'iPhone OS 13_2_3',
  ].join('|'),
  'i'
);

/** Header an internal check (our own routines, health checks, QA) sends so its /go hits never count. */
export const INTERNAL_CHECK_HEADER = 'x-aios-internal-check';

type HeaderGetter = { get(name: string): string | null };

export function isInternalCheck(method: string, headers: HeaderGetter): boolean {
  if (method.toUpperCase() !== 'GET') return true; // HEAD/OPTIONS link checks
  return !!headers.get(INTERNAL_CHECK_HEADER);
}

export function isBotUserAgent(userAgent: string | null): boolean {
  return !userAgent || userAgent.length < 20 || BOT_UA.test(userAgent);
}

export function isBotClick(headers: HeaderGetter): boolean {
  if (isBotUserAgent(headers.get('user-agent'))) return true;
  if (!headers.get('accept-language')) return true;
  const purpose = `${headers.get('sec-purpose') || ''} ${headers.get('purpose') || ''} ${headers.get('x-purpose') || ''}`;
  if (/prefetch|preview|prerender/i.test(purpose)) return true;
  const mode = headers.get('sec-fetch-mode');
  if (mode && mode !== 'navigate') return true;
  const dest = headers.get('sec-fetch-dest');
  if (dest && dest !== 'document') return true;
  if (!headers.get('referer') && !mode && !headers.get('sec-fetch-site')) return true;
  return false;
}

/** Back-compat wrapper (UA + Accept-Language only). Prefer isBotClick. */
export function isBotRequest(userAgent: string | null, acceptLanguage: string | null): boolean {
  if (isBotUserAgent(userAgent)) return true;
  if (!acceptLanguage) return true;
  return false;
}

/** Headers every /go response carries so search engines never index or follow it. */
export const GO_NOINDEX_HEADERS = { 'X-Robots-Tag': 'noindex, nofollow' } as const;
