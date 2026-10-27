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
