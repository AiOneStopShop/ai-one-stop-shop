import 'server-only';
import { z } from 'zod';
import type { AdminAuthResult } from './admin-auth';

export const intakeIdSchema = z.string().uuid();

export type IntakeDecision = 'approved' | 'declined';

export const DECLINE_REASON_MAX = 1000;

export type IntakeStatusUpdate = {
  status: IntakeDecision;
  reviewed_at: string;
  reviewed_by_user_id: string | null;
  decline_reason: string | null;
};

export type IntakeReviewStore = {
  /**
   * Conditionally update a request that is still pending_review.
   * claimed=false means it was not pending (already reviewed, or missing).
   */
  updatePending: (id: string, update: IntakeStatusUpdate) => Promise<{ claimed: boolean; error?: string }>;
};

export type IntakeReviewResult =
  | { success: true; status: IntakeDecision }
  | { success: false; error: string };

export async function runIntakeReview(input: {
  intakeId: unknown;
  decision: IntakeDecision;
  declineReason?: unknown;
  checkAdmin: () => Promise<AdminAuthResult>;
  getStore: () => IntakeReviewStore | null;
  now?: () => Date;
}): Promise<IntakeReviewResult> {
  const parsed = intakeIdSchema.safeParse(input.intakeId);
  if (!parsed.success) {
    return { success: false, error: 'Invalid request ID' };
  }

  const auth = await input.checkAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const store = input.getStore();
  if (!store) {
    return { success: false, error: 'Supabase not configured' };
  }

  let declineReason: string | null = null;
  if (input.decision === 'declined' && typeof input.declineReason === 'string') {
    const trimmed = input.declineReason.trim().slice(0, DECLINE_REASON_MAX);
    declineReason = trimmed || null;
  }

  const update: IntakeStatusUpdate = {
    status: input.decision,
    reviewed_at: (input.now ? input.now() : new Date()).toISOString(),
    reviewed_by_user_id: auth.userId ?? null,
    decline_reason: declineReason,
  };

  const result = await store.updatePending(parsed.data, update);
  if (result.error) {
    return { success: false, error: result.error };
  }
  if (!result.claimed) {
    return { success: false, error: 'This request was already reviewed. Refresh to see its status.' };
  }
  return { success: true, status: input.decision };
}
