// Click logging for /go/<slug>. Runs inside after() so it never delays the
// redirect; Next.js keeps the function alive (waitUntil) until it settles.
//
// Reliability rules:
// - The insert result is checked (supabase-js returns errors, it doesn't throw).
// - A failed insert is retried once, then the dedupe claim is released so a
//   later click from the same visitor is still counted.
// - Every failure path logs a tagged line (no IP, no secrets) for the function log.
//
// Note: one row per visitor (hashed IP) per tool per UTC day is intentional:
// repeat clicks inside that window are not new rows.

export type ClickRow = {
  link_id: string | null;
  tool_id: string;
  ip_hash: string;
  user_agent: string | null;
  referrer: string;
  page_path: string;
  is_bot: boolean;
};

export type ClickLogDeps = {
  hashIp: (ip: string) => string;
  dedupe: (key: string, ttlSeconds: number) => Promise<boolean>;
  releaseDedupe: (key: string) => Promise<void>;
  insert: (row: ClickRow) => Promise<{ error: { code?: string; message?: string } | null }>;
  log?: (message: string) => void;
  now?: () => Date;
};

export type ClickLogOutcome = 'logged' | 'duplicate' | 'skipped' | 'failed';

export async function logAffiliateClick(
  input: {
    ip: string;
    toolId: string | null;
    linkId: string | null;
    userAgent: string | null;
    referrer: string;
    pagePath: string;
    isBot: boolean;
  },
  deps: ClickLogDeps
): Promise<ClickLogOutcome> {
  const log = deps.log ?? ((m: string) => console.error(m));
  if (!input.toolId) return 'skipped';

  let ipHash: string;
  try {
    ipHash = deps.hashIp(input.ip);
  } catch (err) {
    log(`[go-click] not logged: ${err instanceof Error ? err.message : String(err)}`);
    return 'failed';
  }

  const day = (deps.now ? deps.now() : new Date()).toISOString().split('T')[0];
  const dedupeKey = `dedupe:click:${ipHash}:${input.toolId}:${day}`;

  let first: boolean;
  try {
    first = await deps.dedupe(dedupeKey, 86400);
  } catch (err) {
    log(`[go-click] not logged, dedupe unavailable: ${err instanceof Error ? err.message : String(err)}`);
    return 'failed';
  }
  if (!first) return 'duplicate';

  const row: ClickRow = {
    link_id: input.linkId,
    tool_id: input.toolId,
    ip_hash: ipHash,
    user_agent: input.userAgent ? input.userAgent.substring(0, 255) : null,
    referrer: input.referrer,
    page_path: input.pagePath,
    is_bot: input.isBot,
  };

  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { error } = await deps.insert(row);
      if (!error) return 'logged';
      lastError = `${error.code ?? 'unknown'} ${error.message ?? ''}`.trim();
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  log(`[go-click] insert failed after retry: ${lastError}`);
  try {
    await deps.releaseDedupe(dedupeKey);
  } catch {
    // Best effort; the key expires within a day anyway.
  }
  return 'failed';
}
