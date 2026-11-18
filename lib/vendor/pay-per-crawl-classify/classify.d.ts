export function shortName(ua: string): string
export function classify(
  ua: string,
  headers?: Record<string, string>,
  ip?: string,
  opts?: { catalog?: { name: string; class: string; match: string[]; verify?: string[] }[] }
): Promise<{ class: string; name: string; verified: boolean | null; impersonation: boolean }>
