'use client';

import { useActionState, useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveIntake, declineIntake, type IntakeReviewFormState } from './actions';

const INITIAL: IntakeReviewFormState = { ok: false, message: null };

export function IntakeReviewActions({ intakeId, label }: { intakeId: string; label: string }) {
  const router = useRouter();
  const reasonId = useId();
  const [showDecline, setShowDecline] = useState(false);
  const [last, setLast] = useState<'approve' | 'decline' | null>(null);
  const [approveState, approveAction, approvePending] = useActionState(approveIntake, INITIAL);
  const [declineState, declineAction, declinePending] = useActionState(declineIntake, INITIAL);
  const busy = approvePending || declinePending;
  const done = approveState.ok || declineState.ok;
  const latest = last === 'decline' ? declineState : last === 'approve' ? approveState : INITIAL;

  useEffect(() => {
    // Re-fetch the server component so the status badge and reviewed time update.
    if (!done) return;
    const timer = setTimeout(() => router.refresh(), 1500);
    return () => clearTimeout(timer);
  }, [done, router]);

  return (
    <div className="flex flex-col items-end gap-2">
      {!done && !showDecline && (
        <div className="flex gap-2">
          <form action={approveAction} onSubmit={() => setLast('approve')}>
            <input type="hidden" name="intakeId" value={intakeId} />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-2 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {approvePending ? 'Approving…' : 'Approve'}
              <span className="sr-only"> {label}</span>
            </button>
          </form>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowDecline(true)}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Decline
            <span className="sr-only"> {label}</span>
          </button>
        </div>
      )}

      {!done && showDecline && (
        <form action={declineAction} onSubmit={() => setLast('decline')} className="w-full max-w-sm space-y-2">
          <input type="hidden" name="intakeId" value={intakeId} />
          <label htmlFor={reasonId} className="block text-sm font-medium">
            Reason (optional, internal)
          </label>
          <textarea
            id={reasonId}
            name="declineReason"
            rows={2}
            maxLength={1000}
            className="w-full rounded border border-line p-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowDecline(false)}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {declinePending ? 'Declining…' : 'Confirm decline'}
              <span className="sr-only"> {label}</span>
            </button>
          </div>
        </form>
      )}

      <p
        role={latest.message && !latest.ok ? 'alert' : 'status'}
        aria-live="polite"
        className={`text-sm ${latest.ok ? 'text-green' : 'text-red-800'}`}
      >
        {latest.message ?? ''}
      </p>
    </div>
  );
}
