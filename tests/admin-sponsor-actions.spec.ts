import './stub-server-only.cjs';
import { test, expect } from '@playwright/test';
import { runIntakeReview, type IntakeReviewStore, type IntakeStatusUpdate } from '../lib/sponsor-intake-review';
import { buildSponsorRequestEmail } from '../lib/sponsor-request-email';
import { logAffiliateClick, type ClickLogDeps } from '../lib/click-logging';

const ID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN = '11111111-1111-4111-8111-111111111111';
const admin = async () => ({ authorized: true, userId: ADMIN });
const fixedNow = () => new Date('2026-10-18T16:00:00.000Z');

function store(opts: { claimed?: boolean; error?: string } = {}) {
  const calls: Array<{ id: string; update: IntakeStatusUpdate }> = [];
  const s: IntakeReviewStore = {
    async updatePending(id, update) {
      calls.push({ id, update });
      return { claimed: opts.claimed ?? true, error: opts.error };
    },
  };
  return { s, calls };
}

test.describe('M2 sponsor/partner intake review', () => {
  test('approve sets status, reviewer and time', async () => {
    const { s, calls } = store();
    const r = await runIntakeReview({ intakeId: ID, decision: 'approved', checkAdmin: admin, getStore: () => s, now: fixedNow });
    expect(r).toEqual({ success: true, status: 'approved' });
    expect(calls).toEqual([
      { id: ID, update: { status: 'approved', reviewed_at: '2026-10-18T16:00:00.000Z', reviewed_by_user_id: ADMIN, decline_reason: null } },
    ]);
  });

  test('decline stores a trimmed, capped reason', async () => {
    const { s, calls } = store();
    const r = await runIntakeReview({ intakeId: ID, decision: 'declined', declineReason: `  ${'x'.repeat(1200)}  `, checkAdmin: admin, getStore: () => s });
    expect(r.success).toBe(true);
    expect(calls[0].update.status).toBe('declined');
    expect(calls[0].update.decline_reason).toHaveLength(1000);
  });

  test('blank decline reason becomes null', async () => {
    const { s, calls } = store();
    await runIntakeReview({ intakeId: ID, decision: 'declined', declineReason: '   ', checkAdmin: admin, getStore: () => s });
    expect(calls[0].update.decline_reason).toBeNull();
  });

  test('non-admin is refused before any write', async () => {
    const { s, calls } = store();
    const r = await runIntakeReview({ intakeId: ID, decision: 'approved', checkAdmin: async () => ({ authorized: false, error: 'Not authorized' }), getStore: () => s });
    expect(r).toEqual({ success: false, error: 'Not authorized' });
    expect(calls).toHaveLength(0);
  });

  test('invalid id is refused before auth or write', async () => {
    let authCalls = 0;
    const { s, calls } = store();
    const r = await runIntakeReview({ intakeId: 'not-a-uuid', decision: 'approved', checkAdmin: async () => { authCalls++; return { authorized: true }; }, getStore: () => s });
    expect(r.success).toBe(false);
    expect(authCalls).toBe(0);
    expect(calls).toHaveLength(0);
  });

  test('already-reviewed request reports a clear message', async () => {
    const { s } = store({ claimed: false });
    const r = await runIntakeReview({ intakeId: ID, decision: 'approved', checkAdmin: admin, getStore: () => s });
    expect(r).toEqual({ success: false, error: 'This request was already reviewed. Refresh to see its status.' });
  });

  test('store error and missing config surface as failures', async () => {
    const { s } = store({ error: 'Could not update the request. Please try again.' });
    expect((await runIntakeReview({ intakeId: ID, decision: 'approved', checkAdmin: admin, getStore: () => s })).success).toBe(false);
    expect(await runIntakeReview({ intakeId: ID, decision: 'approved', checkAdmin: admin, getStore: () => null })).toEqual({ success: false, error: 'Supabase not configured' });
  });
});

test.describe('L1/L2 sponsor request email', () => {
  const base = {
    companyName: 'Acme & Co', contactName: 'Pat', email: 'pat@example.com', toolName: 'Acme <AI>',
    toolUrl: 'https://acme.example', message: 'Hi\nthere', submittedAt: '2026-10-18T16:00:00.000Z', siteUrl: 'https://www.aionestop.shop/',
  };

  test('partner package says partner in subject and heading', () => {
    const e = buildSponsorRequestEmail({ ...base, package: 'partner-program' });
    expect(e.subject).toBe('New partner request: Acme <AI> (Partner Program)');
    expect(e.html).toContain('<h2>New Partner Request</h2>');
    expect(e.text.startsWith('New Partner Request')).toBe(true);
    expect(e.subject.toLowerCase()).not.toContain('sponsor');
  });

  test('sponsor package still says sponsor', () => {
    const e = buildSponsorRequestEmail({ ...base, package: 'featured-tool' });
    expect(e.subject).toBe('New sponsor request: Acme <AI> (Featured Tool ($39))');
    expect(e.html).toContain('<h2>New Sponsor Request</h2>');
  });

  test('plain text has the admin link exactly once, no bare path duplicate', () => {
    const e = buildSponsorRequestEmail({ ...base, package: 'featured-tool' });
    expect(e.text).toContain('Review in admin: https://www.aionestop.shop/admin/sponsors');
    expect(e.text.match(/admin\/sponsors/g)).toHaveLength(1);
    expect(e.text).not.toMatch(/Review in admin: \/admin/);
  });

  test('html escapes user input; subject has no line breaks', () => {
    const e = buildSponsorRequestEmail({ ...base, toolName: 'Evil\r\nBcc: x@y', package: 'featured-tool' });
    expect(e.subject).not.toMatch(/[\r\n]/);
    expect(e.html).toContain('Acme &amp; Co');
    expect(e.html).not.toContain('<AI>');
  });
});

test.describe('click logging reliability', () => {
  const input = { ip: '203.0.113.9', toolId: 't1', linkId: null, userAgent: 'UA', referrer: 'https://www.aionestop.shop/tools/x', pagePath: '/tools/x', isBot: false };

  function deps(over: Partial<ClickLogDeps> & { insertResults?: Array<{ code?: string; message?: string } | null> } = {}) {
    const results = over.insertResults ?? [null];
    const state = { inserts: 0, released: [] as string[], logs: [] as string[] };
    const d: ClickLogDeps = {
      hashIp: () => 'hash',
      dedupe: async () => true,
      releaseDedupe: async (k) => { state.released.push(k); },
      insert: async () => ({ error: results[Math.min(state.inserts++, results.length - 1)] }),
      log: (m) => state.logs.push(m),
      now: fixedNow,
      ...over,
    };
    return { d, state };
  }

  test('logs one row on success', async () => {
    const { d, state } = deps();
    expect(await logAffiliateClick(input, d)).toBe('logged');
    expect(state.inserts).toBe(1);
  });

  test('retries a failed insert once', async () => {
    const { d, state } = deps({ insertResults: [{ code: '57014', message: 'timeout' }, null] });
    expect(await logAffiliateClick(input, d)).toBe('logged');
    expect(state.inserts).toBe(2);
    expect(state.released).toHaveLength(0);
  });

  test('releases the dedupe key when the insert keeps failing', async () => {
    const { d, state } = deps({ insertResults: [{ code: 'PGRST301', message: 'JWT' }] });
    expect(await logAffiliateClick(input, d)).toBe('failed');
    expect(state.released).toEqual(['dedupe:click:hash:t1:2026-10-18']);
    expect(state.logs.join(' ')).toContain('insert failed after retry');
  });

  test('thrown insert (e.g. missing service key) is caught and logged', async () => {
    const { d, state } = deps({ insert: async () => { throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY'); } });
    expect(await logAffiliateClick(input, d)).toBe('failed');
    expect(state.released).toHaveLength(1);
  });

  test('duplicate in the same day is not inserted', async () => {
    const { d, state } = deps({ dedupe: async () => false });
    expect(await logAffiliateClick(input, d)).toBe('duplicate');
    expect(state.inserts).toBe(0);
  });

  test('missing secret or dedupe outage logs and skips the insert', async () => {
    const a = deps({ hashIp: () => { throw new Error('AFFILIATE_CLICK_SECRET not configured'); } });
    expect(await logAffiliateClick(input, a.d)).toBe('failed');
    expect(a.state.logs[0]).toContain('AFFILIATE_CLICK_SECRET');
    const b = deps({ dedupe: async () => { throw new Error('Upstash down'); } });
    expect(await logAffiliateClick(input, b.d)).toBe('failed');
    expect(b.state.inserts).toBe(0);
  });
});
