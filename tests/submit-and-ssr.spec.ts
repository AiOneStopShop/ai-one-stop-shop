import { test, expect } from '@playwright/test';
import { getClientIP } from '../lib/client-ip';

test('rate-limit IP uses the first X-Forwarded-For hop, then request.ip, then a constant', () => {
  expect(getClientIP({
    headers: new Headers({ 'x-forwarded-for': ' 203.0.113.10, 10.0.0.1 ' }),
  })).toBe('203.0.113.10');

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
  expect(articles.length).toBeGreaterThan(0);
  expect(html).not.toContain('Loading tools…');
});
