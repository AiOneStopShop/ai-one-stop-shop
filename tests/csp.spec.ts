/** Unit checks for the per-request CSP and the cross-origin server-action guard (lib/csp.ts). */
import { test, expect } from '@playwright/test';
import { buildCsp, generateNonce, isCrossOriginServerAction } from '../lib/csp';

const directive = (csp: string, name: string) =>
  csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';

test('script-src never allows unsafe-inline, in prod or dev', () => {
  for (const dev of [false, true]) {
    const scriptSrc = directive(buildCsp('abc', dev), 'script-src');
    expect(scriptSrc).toContain("'nonce-abc'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain('unsafe-inline');
  }
  expect(directive(buildCsp('abc', false), 'script-src')).not.toContain('unsafe-eval');
});

test('nonces are random base64', () => {
  const a = generateNonce();
  const b = generateNonce();
  expect(a).not.toBe(b);
  expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/);
});

test('next.config.js no longer sets a second CSP with unsafe-inline', async () => {
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
