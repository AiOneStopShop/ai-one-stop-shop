import { test, expect } from '@playwright/test';
import {
  runSubmissionReview,
  slugFromName,
  type PendingSubmission,
  type ReviewStore,
  type SubmissionUpdate,
  type DraftToolInsert,
} from '../lib/review-submissions';

const VALID_ID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';

const pending: PendingSubmission = {
  id: VALID_ID,
  tool_name: 'Example AI',
  website_url: 'https://example.com',
  description: 'An example tool',
  status: 'pending',
};

function createTrackingStore(options?: {
  url?: string;
  claimLimit?: number;
}) {
  const calls = {
    getPending: 0,
    createDraft: 0,
    mark: 0,
  };
  const drafts: DraftToolInsert[] = [];
  const marks: Array<{ id: string; update: SubmissionUpdate }> = [];
  const submission: PendingSubmission = {
    ...pending,
    website_url: options?.url ?? pending.website_url,
  };
  let claims = 0;

  const store: ReviewStore = {
    async getPendingSubmission() {
      calls.getPending += 1;
      return { data: submission };
    },
    async createDraftTool(tool) {
      calls.createDraft += 1;
      drafts.push(tool);
      return {};
    },
    async markSubmission(id, update) {
      calls.mark += 1;
      marks.push({ id, update });
      const limit = options?.claimLimit ?? Infinity;
      if (claims >= limit) {
        return { claimed: false };
      }
      claims += 1;
      return { claimed: true };
    },
  };

  return { store, calls, drafts, marks };
}

function adminApprove(store: ReviewStore, submissionId: unknown = VALID_ID) {
  return runSubmissionReview({
    submissionId,
    decision: 'approved',
    checkAdmin: async () => ({ authorized: true, userId: ADMIN_ID }),
    getStore: () => store,
  });
}

test.describe('admin submission review actions', () => {
  test('invalid id fails Zod before any service_role store is created', async () => {
    const order: string[] = [];
    const result = await runSubmissionReview({
      submissionId: 'not-a-uuid',
      decision: 'approved',
      checkAdmin: async () => {
        order.push('auth');
        return { authorized: true, userId: ADMIN_ID };
      },
      getStore: () => {
        order.push('service');
        return createTrackingStore().store;
      },
    });

    expect(result).toEqual({ success: false, error: 'Invalid submission ID' });
    expect(order).toEqual(['auth']);
  });

  test('reject does not create a store when the caller is not an admin', async () => {
    const order: string[] = [];
    const result = await runSubmissionReview({
      submissionId: VALID_ID,
      decision: 'rejected',
      checkAdmin: async () => {
        order.push('auth');
        return { authorized: false, error: 'Not authorized' };
      },
      getStore: () => {
        order.push('service');
        return createTrackingStore().store;
      },
    });

    expect(result).toEqual({ success: false, error: 'Not authorized' });
    expect(order).toEqual(['auth']);
  });

  test('approve reaches the store after admin check and valid id', async () => {
    const order: string[] = [];
    const tracking = createTrackingStore();
    const result = await runSubmissionReview({
      submissionId: VALID_ID,
      decision: 'approved',
      checkAdmin: async () => {
        order.push('auth');
        return { authorized: true, userId: ADMIN_ID };
      },
      getStore: () => {
        order.push('service');
        return tracking.store;
      },
    });

    expect(result).toEqual({ success: true });
    expect(order).toEqual(['auth', 'service']);
    expect(tracking.calls.createDraft).toBe(1);
    expect(tracking.drafts[0]).toMatchObject({
      name: 'Example AI',
      slug: slugFromName('Example AI'),
      status: 'draft',
      website_url: 'https://example.com',
      source_url: 'https://example.com',
    });
    expect(tracking.marks[0]).toMatchObject({
      id: VALID_ID,
      update: { status: 'approved', reviewed_by: ADMIN_ID },
    });
  });

  test('reject reaches the store after admin check and valid id', async () => {
    const order: string[] = [];
    const tracking = createTrackingStore();
    const result = await runSubmissionReview({
      submissionId: VALID_ID,
      decision: 'rejected',
      checkAdmin: async () => {
        order.push('auth');
        return { authorized: true, userId: ADMIN_ID };
      },
      getStore: () => {
        order.push('service');
        return tracking.store;
      },
    });

    expect(result).toEqual({ success: true });
    expect(order).toEqual(['auth', 'service']);
    expect(tracking.calls.createDraft).toBe(0);
    expect(tracking.marks[0]).toMatchObject({
      id: VALID_ID,
      update: { status: 'rejected', reviewed_by: ADMIN_ID },
    });
  });

  test('approve rejects javascript: and data: URLs and accepts https:', async () => {
    const javascriptStore = createTrackingStore({ url: 'javascript:alert(1)' });
    const javascriptResult = await adminApprove(javascriptStore.store);
    expect(javascriptResult).toEqual({ success: false, error: 'invalid_url' });
    expect(javascriptStore.calls.createDraft).toBe(0);
    expect(javascriptStore.calls.mark).toBe(0);

    const dataStore = createTrackingStore({ url: 'data:text/html,<script>alert(1)</script>' });
    const dataResult = await adminApprove(dataStore.store);
    expect(dataResult).toEqual({ success: false, error: 'invalid_url' });
    expect(dataStore.calls.createDraft).toBe(0);
    expect(dataStore.calls.mark).toBe(0);

    const httpsStore = createTrackingStore({ url: 'https://safe.example' });
    const httpsResult = await adminApprove(httpsStore.store);
    expect(httpsResult).toEqual({ success: true });
    expect(httpsStore.calls.createDraft).toBe(1);
    expect(httpsStore.drafts[0]).toMatchObject({
      website_url: 'https://safe.example',
      source_url: 'https://safe.example',
    });
  });

  test('a second concurrent approve does not create another draft', async () => {
    const tracking = createTrackingStore({ claimLimit: 1 });

    const first = await adminApprove(tracking.store);
    const second = await adminApprove(tracking.store);

    expect(first).toEqual({ success: true });
    expect(second).toEqual({ success: false, error: 'Submission is no longer pending' });
    expect(tracking.calls.createDraft).toBe(1);
    expect(tracking.calls.mark).toBe(2);
  });

  test('review page binds the server actions, not missing routes', async () => {
    const { readFileSync } = await import('fs');
    const pageSrc = readFileSync('app/admin/review/page.tsx', 'utf8');
    const actionsSrc = readFileSync('app/admin/review/SubmissionReviewActions.tsx', 'utf8');
    expect(pageSrc).not.toContain('/admin/review/approve-submission');
    expect(pageSrc).not.toContain('/admin/review/reject-submission');
    expect(pageSrc).toContain('SubmissionReviewActions');
    expect(actionsSrc).toContain('action={approveAction}');
    expect(actionsSrc).toContain('action={rejectAction}');
    expect(actionsSrc).toContain('role="alert"');
  });
});
