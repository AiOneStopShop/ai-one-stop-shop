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

/**
 * Expand an IPv6 address to its 8 hextets. Returns null if it is not IPv6.
 * Handles "::" compression, zone ids and an embedded IPv4 tail.
 */
function expandIPv6(raw: string): string[] | null {
  let ip = raw.trim().replace(/^\[|\]$/g, '');
  if (!ip.includes(':')) return null;
  ip = ip.split('%')[0];

  // IPv4-mapped / embedded IPv4 tail, e.g. ::ffff:192.0.2.1
  const v4Tail = ip.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Tail) {
    const parts = v4Tail[1].split('.').map(Number);
    if (parts.some((n) => n > 255)) return null;
    const hex = `${((parts[0] << 8) | parts[1]).toString(16)}:${((parts[2] << 8) | parts[3]).toString(16)}`;
    ip = ip.slice(0, ip.length - v4Tail[1].length) + hex;
  }

  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 && head.length !== 8) return null;
  if (missing < 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-fA-F]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.toLowerCase().padStart(4, '0'));
}

/**
 * Key used for rate limiting, click dedupe and IP hashing.
 * IPv6 clients usually control a whole /64, so rotating the interface id must not
 * create a "new" client. IPv4-mapped IPv6 collapses back to the plain IPv4 address.
 */
export function rateLimitKeyForIP(ip: string): string {
  const groups = expandIPv6(ip);
  if (!groups) return ip.trim();
  if (groups.slice(0, 5).every((g) => g === '0000') && groups[5] === 'ffff') {
    const a = parseInt(groups[6], 16);
    const b = parseInt(groups[7], 16);
    return `${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`;
  }
  return `${groups.slice(0, 4).join(':')}::/64`;
}

export function getClientKey(request: { headers: Headers; ip?: string }): string {
  return rateLimitKeyForIP(getClientIP(request));
}
