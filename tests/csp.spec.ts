/** Unit checks for the static CSP and the cross-origin server-action guard (lib/csp.ts). */
import { test, expect } from '@playwright/test';
import { buildCsp, isCrossOriginServerAction } from '../lib/csp';

const directive = (csp: string, name: string) =>
  csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';

test('script-src is a static allowlist: self, unsafe-inline, analytics host', () => {
  for (const dev of [false, true]) {
    const scriptSrc = directive(buildCsp(dev), 'script-src');
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc).toContain('https://va.vercel-scripts.com');
    expect(scriptSrc).not.toMatch(/nonce-/);
    expect(scriptSrc).not.toContain('strict-dynamic');
  }
  expect(directive(buildCsp(false), 'script-src')).not.toContain('unsafe-eval');
  expect(directive(buildCsp(true), 'script-src')).toContain('unsafe-eval');
});

test('next.config.js does not set a second CSP header', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = require('../next.config.js');
  const groups = await config.headers();
  const all = groups.flatMap((g: { headers: { key: string; value: string }[] }) => g.headers);
  expect(all.find((h: { key: string }) => h.key.toLowerCase() === 'content-security-policy')).toBeUndefined();
});

test('cross-origin server actions are detected; same-origin and normal POSTs are not', () => {
  const h = (o: Record<string, string>) => new Headers(o);
  const host = 'www.aionestop.shop';
  expect(isCrossOriginServerAction({ method: 'POST', host, headers: h({ host, origin: 'https://evil.example', 'next-action': 'x' }) })).toBe(true);
  expect(isCrossOriginServerAction({ method: 'POST', host, headers: h({ host, origin: 'null', 'next-action': 'x' }) })).toBe(true);
  expect(isCrossOriginServerAction({ method: 'POST', host, headers: h({ host, origin: `https://${host}`, 'next-action': 'x' }) })).toBe(false);
  expect(isCrossOriginServerAction({ method: 'POST', host, headers: h({ host, origin: 'https://evil.example' }) })).toBe(false);
  expect(isCrossOriginServerAction({ method: 'GET', host, headers: h({ host, origin: 'https://evil.example', 'next-action': 'x' }) })).toBe(false);
});
