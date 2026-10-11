import { test, expect } from '@playwright/test';
import { getClientIP } from '../lib/client-ip';

test('rate-limit IP prefers Vercel, then real-ip, then first XFF hop, then request.ip', () => {
  expect(getClientIP({
    headers: new Headers({
      'x-vercel-forwarded-for': ' 203.0.113.1 ',
      'x-real-ip': '198.51.100.2',
      'x-forwarded-for': '192.0.2.1, 10.0.0.1',
    }),
    ip: '198.51.100.20',
  })).toBe('203.0.113.1');

  expect(getClientIP({
    headers: new Headers({
      'x-real-ip': '198.51.100.2',
      'x-forwarded-for': '192.0.2.1, 10.0.0.1',
    }),
  })).toBe('198.51.100.2');

  expect(getClientIP({
    headers: new Headers({ 'x-forwarded-for': ' 192.0.2.1, 10.0.0.1 ' }),
  })).toBe('192.0.2.1');

  expect(getClientIP({
    headers: new Headers(),
    ip: '198.51.100.20',
  })).toBe('198.51.100.20');

  expect(getClientIP({ headers: new Headers() })).toBe('0.0.0.0');
});

test('submit rejects a non-URL with 400 url_invalid', async ({ request }) => {
  const response = await request.post('/api/submit-tool', {
    data: {
      toolName: 'Example',
      websiteUrl: 'not-a-url',
      contactEmail: 'reviewer@example.com',
    },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: 'websiteUrl', code: 'url_invalid' }),
    ])
  );
});

test('/tools server HTML includes published tool cards', async ({ request }) => {
  const response = await request.get('/tools');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  const articles = html.match(/<article\b/g) || [];
  expect(articles.length).toBe(20);
  const grepCount = html.split('\n').filter((line) => line.includes('<article')).length;
  expect(grepCount).toBe(20);
  expect(html).not.toContain('Loading tools…');
});
