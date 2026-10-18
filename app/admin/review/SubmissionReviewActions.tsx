'use client';

import { useActionState } from 'react';
import { approveSubmission, rejectSubmission, type ReviewFormState } from './actions';

const INITIAL: ReviewFormState = { error: null };

function visibleError(code: string | null): string | null {
  if (!code) return null;
  if (code === 'invalid_url') {
    return 'That website URL must use http or https.';
  }
  return code;
}

export function SubmissionReviewActions({
  submissionId,
  toolName,
}: {
  submissionId: string;
  toolName: string;
}) {
  const [approveState, approveAction, approvePending] = useActionState(approveSubmission, INITIAL);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectSubmission, INITIAL);
  const message = visibleError(approveState.error || rejectState.error);
  const busy = approvePending || rejectPending;

  return (
    <div>
      <div className="flex gap-2">
        <form action={approveAction}>
          <input type="hidden" name="submissionId" value={submissionId} />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-2 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Approve & Create Draft
            <span className="sr-only"> {toolName}</span>
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="submissionId" value={submissionId} />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Reject
            <span className="sr-only"> {toolName}</span>
          </button>
        </form>
      </div>
      {message && (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
