import { test, expect } from '@playwright/test';
import { clickContext, cleanPath, isBotRequest } from '../lib/click-context';

const HOST = 'www.aionestop.shop';

test('same-origin Referer gives page_path and trimmed referrer', () => {
  expect(clickContext('https://www.aionestop.shop/guides/free-ai-tools?q=x#y', null, HOST)).toEqual({
    referrer: 'https://www.aionestop.shop/guides/free-ai-tools',
    pagePath: '/guides/free-ai-tools',
  });
  expect(clickContext('https://aionestop.shop/tools/a', null, HOST).pagePath).toBe('/tools/a');
});

test('cross-origin Referer: only the origin is kept, page_path falls back to ?from', () => {
  expect(clickContext('https://u:p@news.example.com/a/b?email=me@x.com', '/tools/chatgpt', HOST)).toEqual({
    referrer: 'https://news.example.com',
    pagePath: '/tools/chatgpt',
  });
});

test('no Referer, bad from values are rejected', () => {
  expect(clickContext(null, null, HOST)).toEqual({ referrer: '', pagePath: '' });
  expect(clickContext('not a url', '//evil.com/x', HOST)).toEqual({ referrer: '', pagePath: '' });
  expect(cleanPath('https://evil.com/x')).toBe('');
  expect(cleanPath('/\\evil.com')).toBe('');
  expect(cleanPath('/guides/x?token=1')).toBe('/guides/x');
});

test('bot filter', () => {
  const real = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
  expect(isBotRequest(real, 'en-US')).toBe(false);
  expect(isBotRequest(real, null)).toBe(true);
  expect(isBotRequest(null, 'en')).toBe(true);
  expect(isBotRequest('Googlebot/2.1', 'en')).toBe(true);
  expect(isBotRequest('Mozilla/5.0 HeadlessChrome/130', 'en')).toBe(true);
  expect(isBotRequest('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15', 'en')).toBe(true);
});

// --- Oct 28: tighter /go bot filter (no UA or IP is stored; headers are read at request time only) ---
import { isBotClick, isInternalCheck, isBotUserAgent, INTERNAL_CHECK_HEADER, GO_NOINDEX_HEADERS } from '../lib/click-context';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const h = (o: Record<string, string>) => new Headers(o);
const browserClick = {
  'user-agent': CHROME,
  'accept-language': 'en-US,en;q=0.9',
  referer: 'https://aionestop.shop/tools/grammarly',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-dest': 'document',
  'sec-fetch-site': 'same-origin',
};

test('real browser link click counts', () => {
  expect(isBotClick(h(browserClick))).toBe(false);
  // Referer stripped by policy but Sec-Fetch present: still a browser.
  const { referer: _r, ...noRef } = browserClick;
  expect(isBotClick(h(noRef))).toBe(false);
  // Older browser without Sec-Fetch but with a Referer.
  expect(isBotClick(h({ 'user-agent': CHROME, 'accept-language': 'en', referer: 'https://aionestop.shop/' }))).toBe(false);
});

test('crawlers, AI agents, link checkers, libraries and headless browsers are bots', () => {
  for (const ua of [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
    'Mozilla/5.0 (compatible; Google-InspectionTool/1.0)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0',
    'Mozilla/5.0 (compatible; PerplexityBot/1.0)',
    'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'Mozilla/5.0 (compatible; YandexBot/3.0)',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0)',
    'W3C-checklink/4.81 libwww-perl/6.68',
    'linkinator/6.0',
    'curl/8.5.0',
    'Wget/1.21',
    'python-requests/2.32.3',
    'Python/3.12 aiohttp/3.9',
    'python-httpx/0.27',
    'node-fetch/1.0',
    'undici',
    'Go-http-client/2.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 Chrome/130 Safari/537.36 Playwright/1.48',
  ]) {
    expect(isBotUserAgent(ua), ua).toBe(true);
    expect(isBotClick(h({ ...browserClick, 'user-agent': ua })), ua).toBe(true);
  }
  expect(isBotUserAgent(CHROME)).toBe(false);
  expect(isBotUserAgent(null)).toBe(true);
});

test('automated-looking requests from browser UAs are bots', () => {
  // No Referer and no Sec-Fetch headers at all.
  expect(isBotClick(h({ 'user-agent': CHROME, 'accept-language': 'en-US' }))).toBe(true);
  // No Accept-Language.
  const { 'accept-language': _l, ...noLang } = browserClick;
  expect(isBotClick(h(noLang))).toBe(true);
  // fetch()/no-cors, iframe, prefetch.
  expect(isBotClick(h({ ...browserClick, 'sec-fetch-mode': 'cors' }))).toBe(true);
  expect(isBotClick(h({ ...browserClick, 'sec-fetch-dest': 'iframe' }))).toBe(true);
  expect(isBotClick(h({ ...browserClick, 'sec-purpose': 'prefetch;prerender' }))).toBe(true);
  expect(isBotClick(h({ ...browserClick, purpose: 'prefetch' }))).toBe(true);
});

test('internal checks never count', () => {
  expect(isInternalCheck('HEAD', h(browserClick))).toBe(true);
  expect(isInternalCheck('GET', h({ ...browserClick, [INTERNAL_CHECK_HEADER]: '1' }))).toBe(true);
  expect(isInternalCheck('GET', h(browserClick))).toBe(false);
  expect(GO_NOINDEX_HEADERS['X-Robots-Tag']).toContain('noindex');
});
