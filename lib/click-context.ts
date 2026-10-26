// Where an outbound /go click came from, without PII.
// - page_path: the on-site page the visitor clicked from (same-origin Referer
//   pathname, or a validated ?from=/path fallback). Never a query string.
// - referrer: Referer trimmed to origin + pathname (no query, no fragment, no
//   credentials). Cross-origin referrers are kept as origin + path too.

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
        referrer = (u.origin + u.pathname).slice(0, MAX_LEN);
        const sameSite =
          !!siteHost && u.host.replace(/^www\./, '').toLowerCase() === siteHost.replace(/^www\./, '').toLowerCase();
        if (sameSite) pagePath = u.pathname.slice(0, MAX_LEN);
      }
    } catch {
      // Malformed Referer: ignore.
    }
  }
  if (!pagePath) pagePath = cleanPath(fromParam);
  return { referrer, pagePath };
}

// Simple bot detection. Besides crawler keywords, flags headless/automation
// browsers and the stale "iPhone OS 13_2_3" UA that is the default device
// emulation string in Chrome DevTools/Puppeteer (no real iPhone has sent it
// for years), plus requests with no Accept-Language (scripted clients).
const BOT_UA =
  /bot|crawler|spider|scraper|curl|wget|python-requests|headless|lighthouse|puppeteer|playwright|phantomjs|selenium|httpclient|axios|node-fetch|go-http-client|okhttp|java\/|preview|iPhone OS 13_2_3/i;

export function isBotRequest(userAgent: string | null, acceptLanguage: string | null): boolean {
  if (!userAgent) return true;
  if (BOT_UA.test(userAgent)) return true;
  if (!acceptLanguage) return true;
  return false;
}
