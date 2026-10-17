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

const PROJECT_PRODUCTION_ALIAS = /^ai-one-stop-shop-5e48\.vercel\.app$/;

/** Per-deployment URLs: {project}-{hash}-{scope}.vercel.app or {project}-{hash}.vercel.app */
const VERCEL_DEPLOYMENT_HASH_HOST =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-[a-z0-9]{8,12}(?:-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)?\.vercel\.app$/;

function hostFromUrlOrHost(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  try {
    if (trimmed.includes('://')) {
      return hostnameFromHostHeader(new URL(trimmed).host);
    }
  } catch {
    // fall through to bare-host parsing
  }
  return hostnameFromHostHeader(trimmed);
}

function isPublicProductionVercelHost(host: string | null | undefined): boolean {
  const hostname = hostnameFromHostHeader(host);
  if (!hostname || hostname.includes('-git-') || isCanonicalHost(hostname)) {
    return false;
  }
  if (VERCEL_DEPLOYMENT_HASH_HOST.test(hostname)) {
    return false;
  }

  const configured = hostFromUrlOrHost(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (configured && hostname === configured) {
    return true;
  }
  if (PROJECT_PRODUCTION_ALIAS.test(hostname)) {
    return true;
  }
  return hostname.endsWith('.vercel.app');
}

export function isProductionVercelAlias(
  vercelEnv: string | undefined,
  host: string | null | undefined
): boolean {
  return vercelEnv === 'production' && isPublicProductionVercelHost(host);
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
