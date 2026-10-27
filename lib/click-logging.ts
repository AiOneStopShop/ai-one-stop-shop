// Click logging for /go/<slug>. Runs inside after() so it never delays the
// redirect; Next.js keeps the function alive (waitUntil) until it settles.
//
// Privacy (Lexi's legal check, Oct 2026): a click row holds only the tool/link,
// the time, the on-site page path, the referring site's origin and a bot flag.
// No IP (raw or hashed), user agent, session ID or fingerprint is stored, used
// for deduplication, or written to the function log.
//
// Reliability: the insert result is checked (supabase-js returns errors, it
// doesn't throw) and a failed insert is retried once; failures log a tag and
// the error code only.

export type ClickRow = {
  link_id: string | null;
  tool_id: string;
  referrer: string;
  page_path: string;
  is_bot: boolean;
};

export type ClickLogDeps = {
  insert: (row: ClickRow) => Promise<{ error: { code?: string; message?: string } | null }>;
  log?: (message: string) => void;
};

export type ClickLogOutcome = 'logged' | 'skipped' | 'failed';

export async function logAffiliateClick(
  input: {
    toolId: string | null;
    linkId: string | null;
    referrer: string;
    pagePath: string;
    isBot: boolean;
  },
  deps: ClickLogDeps
): Promise<ClickLogOutcome> {
  const log = deps.log ?? ((m: string) => console.error(m));
  if (!input.toolId) return 'skipped';

  const row: ClickRow = {
    link_id: input.linkId,
    tool_id: input.toolId,
    referrer: input.referrer,
    page_path: input.pagePath,
    is_bot: input.isBot,
  };

  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { error } = await deps.insert(row);
      if (!error) return 'logged';
      lastError = error.code ?? 'unknown';
    } catch {
      lastError = 'exception';
    }
  }

  log(`[go-click] insert failed after retry: ${lastError}`);
  return 'failed';
}
