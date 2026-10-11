const RATE_LIMIT_IP_FALLBACK = '0.0.0.0';

function firstHeaderValue(request: { headers: Headers }, name: string): string | null {
  const raw = request.headers.get(name);
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim();
  return first || null;
}

export function getClientIP(request: { headers: Headers; ip?: string }): string {
  const vercelForwarded = firstHeaderValue(request, 'x-vercel-forwarded-for');
  if (vercelForwarded) return vercelForwarded;

  const realIp = firstHeaderValue(request, 'x-real-ip');
  if (realIp) return realIp;

  const forwarded = firstHeaderValue(request, 'x-forwarded-for');
  if (forwarded) return forwarded;

  if (typeof request.ip === 'string' && request.ip.trim()) {
    return request.ip.trim();
  }

  return RATE_LIMIT_IP_FALLBACK;
}
