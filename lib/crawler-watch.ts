import { classify, SHIPPED_CATALOG } from '@forgemeshlabs/pay-per-crawl-core'

// Watch-only crawler logging. This file never returns a response, never
// reads MODE / PAY_TO / PRO_KEY / CLASS_POLICY from the environment, and
// never calls the package gate or discovery handlers — so it cannot 402,
// settle a payment, or override /llms.txt, /agents.txt, or /.well-known/x402.json.

export const CRAWLER_WATCH_LOG_PREFIX = '[crawler-watch]'

// Same default as @forgemeshlabs/pay-per-crawl-core (the named export is
// missing from that package's 0.1.3 typings). Used only to compute a
// would-have-paid figure; nothing is charged.
const DEFAULT_CLASS_POLICY: Record<string, 'free' | 'paid'> = {
  search: 'free',
  social: 'free',
  monitor: 'free',
  seo: 'paid',
  ai: 'paid',
  automation: 'paid',
  bot: 'paid',
}

// Package default list price, reported in logs only.
export const WATCH_PRICE_USD = 0.01

const SKIP_PREFIXES = ['/admin', '/api', '/_next']
const ASSET_EXT = /\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|ogg)$/i

export type WatchRequest = {
  method: string
  nextUrl: { pathname: string }
  headers: { get(name: string): string | null }
}

export type CrawlerWatchEvent = {
  class: string
  name: string
  path: string
  wouldHavePaidUsd: number
}

function isSkippedPath(pathname: string): boolean {
  if (ASSET_EXT.test(pathname)) return true
  return SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

function isPrefetch(request: WatchRequest): boolean {
  return Boolean(
    request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch'
  )
}

function headerMap(request: WatchRequest): Record<string, string> {
  const accept = request.headers.get('accept')
  const headers: Record<string, string> = {}
  if (accept) headers.accept = accept
  const ua = request.headers.get('user-agent')
  if (ua) headers['user-agent'] = ua
  return headers
}

export async function crawlerWatchEvent(request: WatchRequest): Promise<CrawlerWatchEvent | null> {
  const method = request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') return null

  const pathname = request.nextUrl.pathname
  if (isSkippedPath(pathname) || isPrefetch(request)) return null

  // No IP and no resolver: classify is local string matching only (no DNS, no DoH, no IP hash).
  const result = await classify(request.headers.get('user-agent') || '', headerMap(request), '', {
    catalog: SHIPPED_CATALOG,
  })

  if (result.class === 'human') return null

  const policy = DEFAULT_CLASS_POLICY[result.class] ?? 'paid'
  return {
    class: result.class,
    name: result.name || 'unknown',
    path: pathname.slice(0, 255),
    wouldHavePaidUsd: policy === 'paid' ? WATCH_PRICE_USD : 0,
  }
}

export function formatCrawlerWatchLog(event: CrawlerWatchEvent): string {
  return `${CRAWLER_WATCH_LOG_PREFIX} class=${event.class} name=${event.name} path=${event.path} would_have_paid_usd=${event.wouldHavePaidUsd.toFixed(3)}`
}

export async function logCrawlerWatch(request: WatchRequest): Promise<void> {
  try {
    const event = await crawlerWatchEvent(request)
    if (!event) return
    console.info(formatCrawlerWatchLog(event))
  } catch (error) {
    console.warn(`${CRAWLER_WATCH_LOG_PREFIX} skipped:`, error)
  }
}
