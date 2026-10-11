import { z } from 'zod';

export const submissionIdSchema = z.string().uuid();

export type SubmissionDecision = 'approved' | 'rejected';

export type ReviewAuthResult = {
  authorized: boolean;
  userId?: string;
  error?: string;
};

export type PendingSubmission = {
  id: string;
  tool_name: string;
  website_url: string;
  description: string | null;
  status: string;
};

export type DraftToolInsert = {
  slug: string;
  name: string;
  website_url: string;
  description: string | null;
  tagline: string | null;
  source_url: string;
  status: 'draft';
};

export type SubmissionUpdate = {
  status: 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at: string;
};

export type ReviewStore = {
  getPendingSubmission: (id: string) => Promise<{ data: PendingSubmission | null; error?: string }>;
  createDraftTool: (tool: DraftToolInsert) => Promise<{ error?: string }>;
  markSubmission: (id: string, update: SubmissionUpdate) => Promise<{ error?: string }>;
};

export function slugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'tool';
}

export async function runSubmissionReview(input: {
  submissionId: unknown;
  decision: SubmissionDecision;
  checkAdmin: () => Promise<ReviewAuthResult>;
  getStore: () => ReviewStore;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = submissionIdSchema.safeParse(input.submissionId);
  const auth = await input.checkAdmin();

  if (!parsed.success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const store = input.getStore();

  if (input.decision === 'rejected') {
    const { error } = await store.markSubmission(parsed.data, {
      status: 'rejected',
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    });
    if (error) {
      return { success: false, error: 'Failed to reject submission' };
    }
    return { success: true };
  }

  const pending = await store.getPendingSubmission(parsed.data);
  if (!pending.data) {
    return { success: false, error: pending.error || 'Submission not found' };
  }

  const { error: draftError } = await store.createDraftTool({
    slug: slugFromName(pending.data.tool_name),
    name: pending.data.tool_name,
    website_url: pending.data.website_url,
    description: pending.data.description,
    tagline: pending.data.description ? pending.data.description.slice(0, 255) : null,
    source_url: pending.data.website_url,
    status: 'draft',
  });
  if (draftError) {
    return { success: false, error: 'Failed to create draft' };
  }

  const { error } = await store.markSubmission(parsed.data, {
    status: 'approved',
    reviewed_by: auth.userId,
    reviewed_at: new Date().toISOString(),
  });
  if (error) {
    return { success: false, error: 'Failed to approve submission' };
  }

  return { success: true };
}
