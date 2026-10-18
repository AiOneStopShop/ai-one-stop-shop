'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAuth, getAdminServiceClient } from '@/lib/admin-auth';
import { runIntakeReview, type IntakeDecision, type IntakeReviewStore } from '@/lib/sponsor-intake-review';

export type IntakeReviewFormState = {
  ok: boolean;
  message: string | null;
  status?: IntakeDecision;
};

function createIntakeStore(): IntakeReviewStore | null {
  const supabase = getAdminServiceClient();
  if (!supabase) return null;
  return {
    async updatePending(id, update) {
      const { data, error } = await supabase
        .from('sponsor_intake')
        .update(update)
        .eq('id', id)
        .eq('status', 'pending_review')
        .select('id');
      if (error) {
        console.error('[admin/sponsors] status update failed:', error.code, error.message);
        return { claimed: false, error: 'Could not update the request. Please try again.' };
      }
      return { claimed: Array.isArray(data) && data.length === 1 };
    },
  };
}

async function review(decision: IntakeDecision, formData: FormData): Promise<IntakeReviewFormState> {
  const result = await runIntakeReview({
    intakeId: formData.get('intakeId'),
    decision,
    declineReason: formData.get('declineReason'),
    checkAdmin: checkAdminAuth,
    getStore: createIntakeStore,
  });
  if (!result.success) {
    return { ok: false, message: result.error };
  }
  revalidatePath('/admin/sponsors');
  return {
    ok: true,
    status: result.status,
    message: decision === 'approved' ? 'Approved.' : 'Declined.',
  };
}

export async function approveIntake(
  _prev: IntakeReviewFormState,
  formData: FormData
): Promise<IntakeReviewFormState> {
  return review('approved', formData);
}

export async function declineIntake(
  _prev: IntakeReviewFormState,
  formData: FormData
): Promise<IntakeReviewFormState> {
  return review('declined', formData);
}
