import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CRAWLER_WATCH_LOG_PREFIX,
  crawlerWatchEvent,
  formatCrawlerWatchLog,
  WATCH_PRICE_USD,
  type WatchRequest,
} from './crawler-watch'

function req(overrides: {
  ua?: string
  path?: string
  method?: string
  accept?: string
  prefetch?: boolean
}): WatchRequest {
  const headers: Record<string, string> = {}
  if (overrides.ua !== undefined) headers['user-agent'] = overrides.ua
  if (overrides.accept) headers.accept = overrides.accept
  if (overrides.prefetch) headers.purpose = 'prefetch'
  return {
    method: overrides.method || 'GET',
    nextUrl: { pathname: overrides.path || '/' },
    headers: {
      get(name: string) {
        return headers[name.toLowerCase()] ?? null
      },
    },
  }
}

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

test('logs GPTBot as a paid AI crawler', async () => {
  const event = await crawlerWatchEvent(req({ ua: 'GPTBot/1.0', path: '/tools' }))
  assert.deepEqual(event, {
    class: 'ai',
    name: 'GPTBot',
    path: '/tools',
    wouldHavePaidUsd: WATCH_PRICE_USD,
  })
})

test('logs ClaudeBot as a paid AI crawler', async () => {
  const event = await crawlerWatchEvent(req({ ua: 'ClaudeBot/1.0', path: '/' }))
  assert.equal(event?.class, 'ai')
  assert.equal(event?.name, 'ClaudeBot')
  assert.equal(event?.wouldHavePaidUsd, WATCH_PRICE_USD)
})

test('does not log a normal browser', async () => {
  const event = await crawlerWatchEvent(
    req({ ua: CHROME, accept: 'text/html,application/xhtml+xml' })
  )
  assert.equal(event, null)
})

test('logs Googlebot as a free search crawler', async () => {
  const event = await crawlerWatchEvent(req({ ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }))
  assert.equal(event?.class, 'search')
  assert.equal(event?.name, 'Googlebot')
  assert.equal(event?.wouldHavePaidUsd, 0)
})

test('skips /admin, /api, /_next, and static assets', async () => {
  for (const path of ['/admin', '/admin/login', '/api/tools', '/_next/data/x.json', '/logo.png']) {
    const event = await crawlerWatchEvent(req({ ua: 'GPTBot/1.0', path }))
    assert.equal(event, null, path)
  }
})

test('skips prefetch and non-GET methods', async () => {
  assert.equal(await crawlerWatchEvent(req({ ua: 'GPTBot/1.0', prefetch: true })), null)
  assert.equal(await crawlerWatchEvent(req({ ua: 'GPTBot/1.0', method: 'POST' })), null)
})

test('still classifies crawlers on /llms.txt (does not serve or replace it)', async () => {
  const event = await crawlerWatchEvent(req({ ua: 'GPTBot/1.0', path: '/llms.txt' }))
  assert.equal(event?.path, '/llms.txt')
  assert.equal(event?.class, 'ai')
})

test('MODE=gate in the environment cannot change the result', async () => {
  const previous = process.env.MODE
  process.env.MODE = 'gate'
  process.env.PAY_TO = '0x13C3C28c64cc9d60eEb8a675F3fe27eBC6a4Cd09'
  process.env.PRO_KEY = 'fmppc_this_key_must_be_ignored_for_watch'
  try {
    const event = await crawlerWatchEvent(req({ ua: 'GPTBot/1.0' }))
    assert.equal(event?.class, 'ai')
    assert.equal(event?.wouldHavePaidUsd, WATCH_PRICE_USD)
  } finally {
    if (previous === undefined) delete process.env.MODE
    else process.env.MODE = previous
    delete process.env.PAY_TO
    delete process.env.PRO_KEY
  }
})

test('log line is greppable and has no IP or raw user agent', () => {
  const line = formatCrawlerWatchLog({
    class: 'ai',
    name: 'GPTBot',
    path: '/',
    wouldHavePaidUsd: 0.01,
  })
  assert.equal(line, `${CRAWLER_WATCH_LOG_PREFIX} class=ai name=GPTBot path=/ would_have_paid_usd=0.010`)
  assert.doesNotMatch(line, /ip|user-agent|0x|fmppc_/i)
})
