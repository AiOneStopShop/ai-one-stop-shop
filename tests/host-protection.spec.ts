import { test, expect } from '@playwright/test';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import {
  CRON_CLEANUP_PATH,
  disallowAllRobotsTxt,
  getBrandUrl,
  getSiteContactEmail,
  isCanonicalHost,
  isProductionVercelAlias,
  shouldBlockProductionAlias,
} from '../lib/site-config';
import { generateOrganizationSchema } from '../lib/json-ld';
import { knownSlugsInOrder, orderBySlug } from '../lib/compare-tools';

test('canonical host helpers', () => {
  expect(isCanonicalHost('aionestop.shop')).toBe(true);
  expect(isCanonicalHost('www.aionestop.shop:443')).toBe(true);
  expect(isCanonicalHost('ai-one-stop-shop-5e48.vercel.app')).toBe(false);
  expect(isCanonicalHost('localhost:3100')).toBe(false);
});

test('production vercel.app alias is blocked except cron', () => {
  expect(isProductionVercelAlias('production', 'ai-one-stop-shop-5e48.vercel.app')).toBe(true);
  expect(shouldBlockProductionAlias('production', 'ai-one-stop-shop-5e48.vercel.app', '/')).toBe(true);
  expect(shouldBlockProductionAlias('production', 'ai-one-stop-shop-5e48.vercel.app', '/api/v1/tools')).toBe(true);
  expect(shouldBlockProductionAlias('production', 'ai-one-stop-shop-5e48.vercel.app', '/go/chatgpt-plus')).toBe(true);
  expect(shouldBlockProductionAlias('production', 'ai-one-stop-shop-5e48.vercel.app', CRON_CLEANUP_PATH)).toBe(false);
  expect(shouldBlockProductionAlias('production', 'aionestop.shop', '/')).toBe(false);
  expect(shouldBlockProductionAlias('preview', 'ai-one-stop-shop-5e48.vercel.app', '/')).toBe(false);
});

test('contact and brand stay empty when env is unset', () => {
  expect(getSiteContactEmail()).toBeNull();
  expect(getBrandUrl()).toBeNull();
  const org = generateOrganizationSchema();
  expect(org.founder.url).toBeUndefined();
  expect(org.sameAs).toBeUndefined();
});

test('compare helpers drop unknown slugs and keep selection order', () => {
  const catalog = [{ slug: 'copy-ai' }, { slug: 'jasper-ai' }, { slug: 'descript' }];
  expect(knownSlugsInOrder(['not-real', 'jasper-ai', 'copy-ai', 'jasper-ai'], catalog)).toEqual([
    'jasper-ai',
    'copy-ai',
  ]);
  expect(orderBySlug(
    [{ slug: 'copy-ai', name: 'Copy.ai' }, { slug: 'jasper-ai', name: 'Jasper AI' }],
    ['jasper-ai', 'copy-ai']
  ).map((tool) => tool.name)).toEqual(['Jasper AI', 'Copy.ai']);
});

async function middlewareFor(path: string, host: string, env?: string) {
  const previous = process.env.VERCEL_ENV;
  if (env === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = env;
  }
  try {
    const request = new NextRequest(`https://${host}${path}`, {
      headers: { host },
    });
    return await middleware(request);
  } finally {
    if (previous === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = previous;
    }
  }
}

test('middleware 404s every production vercel.app route except cron', async () => {
  for (const path of ['/', '/tools', '/api/v1/tools', '/go/chatgpt-plus', '/admin/login']) {
    const response = await middlewareFor(path, 'ai-one-stop-shop-5e48.vercel.app', 'production');
    expect(response.status, path).toBe(404);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  }

  const cron = await middlewareFor(CRON_CLEANUP_PATH, 'ai-one-stop-shop-5e48.vercel.app', 'production');
  expect(cron.status).not.toBe(404);
});

test('custom domain and preview deployments stay reachable', async () => {
  const custom = await middlewareFor('/tools', 'aionestop.shop', 'production');
  expect(custom.status).not.toBe(404);
  expect(custom.headers.get('X-Robots-Tag')).toBeNull();

  const preview = await middlewareFor('/tools', 'ai-one-stop-shop-git-preview.vercel.app', 'preview');
  expect(preview.status).not.toBe(404);
  expect(preview.headers.get('X-Robots-Tag')).toBe('noindex');
});

test('non-canonical hosts get a disallow-all robots.txt', async () => {
  const response = await middlewareFor('/robots.txt', 'localhost:3100');
  expect(response.status).toBe(200);
  expect(await response.text()).toBe(disallowAllRobotsTxt());
  expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
});

test('localhost pages send X-Robots-Tag noindex and a disallow-all robots.txt', async ({ request }) => {
  const home = await request.get('/');
  expect(home.ok()).toBeTruthy();
  expect(home.headers()['x-robots-tag']).toBe('noindex');

  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Disallow: /');
});

test('anti-framing headers are not duplicated', async ({ request }) => {
  const home = await request.get('/');
  const headers = home.headers();
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).not.toContain("frame-ancestors 'self'");
  expect((headers['x-frame-options'].match(/DENY/g) || []).length).toBe(1);
});
