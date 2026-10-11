const RATE_LIMIT_IP_FALLBACK = '0.0.0.0';

export function getClientIP(request: { headers: Headers; ip?: string }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  if (typeof request.ip === 'string' && request.ip.trim()) {
    return request.ip.trim();
  }

  return RATE_LIMIT_IP_FALLBACK;
}
