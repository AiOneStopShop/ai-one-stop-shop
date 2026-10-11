export const SITE_NAME = 'AI One Stop Shop';
export const DEFAULT_SITE_URL = 'https://aionestop.shop';
export const CANONICAL_HOSTS = ['aionestop.shop', 'www.aionestop.shop'] as const;
export const CRON_CLEANUP_PATH = '/api/cron/cleanup-clicks';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export function getSiteContactEmail(): string | null {
  const email = (process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || '').trim();
  return email || null;
}

export function getBrandUrl(): string | null {
  const url = (process.env.NEXT_PUBLIC_BRAND_URL || '').trim();
  return url || null;
}

export function hostnameFromHostHeader(host: string | null | undefined): string {
  return (host || '').split(',')[0].trim().split(':')[0].toLowerCase();
}

export function isCanonicalHost(host: string | null | undefined): boolean {
  return (CANONICAL_HOSTS as readonly string[]).includes(hostnameFromHostHeader(host));
}

export function isProductionVercelAlias(
  vercelEnv: string | undefined,
  host: string | null | undefined
): boolean {
  return vercelEnv === 'production' && hostnameFromHostHeader(host).endsWith('.vercel.app');
}

export function shouldBlockProductionAlias(
  vercelEnv: string | undefined,
  host: string | null | undefined,
  pathname: string
): boolean {
  return isProductionVercelAlias(vercelEnv, host) && pathname !== CRON_CLEANUP_PATH;
}

export function disallowAllRobotsTxt(): string {
  return 'User-agent: *\nDisallow: /\n';
}
