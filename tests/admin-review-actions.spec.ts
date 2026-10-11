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

function createTrackingStore() {
  const calls = {
    getPending: 0,
    createDraft: 0,
    mark: 0,
  };
  const drafts: DraftToolInsert[] = [];
  const marks: Array<{ id: string; update: SubmissionUpdate }> = [];

  const store: ReviewStore = {
    async getPendingSubmission() {
      calls.getPending += 1;
      return { data: pending };
    },
    async createDraftTool(tool) {
      calls.createDraft += 1;
      drafts.push(tool);
      return {};
    },
    async markSubmission(id, update) {
      calls.mark += 1;
      marks.push({ id, update });
      return {};
    },
  };

  return { store, calls, drafts, marks };
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

  test('review page binds the server actions, not missing routes', async () => {
    const { readFileSync } = await import('fs');
    const src = readFileSync('app/admin/review/page.tsx', 'utf8');
    expect(src).not.toContain('/admin/review/approve-submission');
    expect(src).not.toContain('/admin/review/reject-submission');
    expect(src).toContain('action={approveSubmission}');
    expect(src).toContain('action={rejectSubmission}');
  });
});
