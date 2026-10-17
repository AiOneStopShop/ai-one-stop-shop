import 'server-only';
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
  markSubmission: (id: string, update: SubmissionUpdate) => Promise<{ error?: string; claimed: boolean }>;
  revertToPending: (id: string) => Promise<{ error?: string }>;
  approveWithDraft?: (input: {
    id: string;
    update: SubmissionUpdate;
    tool: DraftToolInsert;
  }) => Promise<{ claimed: boolean; error?: string }>;
};

export function slugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'tool';
}

export function isHttpOrHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
    const { error, claimed } = await store.markSubmission(parsed.data, {
      status: 'rejected',
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    });
    if (error) {
      return { success: false, error: 'Failed to reject submission' };
    }
    if (!claimed) {
      return { success: false, error: 'Submission is no longer pending' };
    }
    return { success: true };
  }

  const pending = await store.getPendingSubmission(parsed.data);
  if (!pending.data) {
    return { success: false, error: pending.error || 'Submission not found' };
  }

  const websiteUrl = pending.data.website_url;
  const sourceUrl = pending.data.website_url;
  if (!isHttpOrHttpsUrl(websiteUrl) || !isHttpOrHttpsUrl(sourceUrl)) {
    return { success: false, error: 'invalid_url' };
  }

  const draftTool: DraftToolInsert = {
    slug: slugFromName(pending.data.tool_name),
    name: pending.data.tool_name,
    website_url: websiteUrl,
    description: pending.data.description,
    tagline: pending.data.description ? pending.data.description.slice(0, 255) : null,
    source_url: sourceUrl,
    status: 'draft',
  };
  const approvalUpdate: SubmissionUpdate = {
    status: 'approved',
    reviewed_by: auth.userId,
    reviewed_at: new Date().toISOString(),
  };

  if (store.approveWithDraft) {
    const result = await store.approveWithDraft({
      id: parsed.data,
      update: approvalUpdate,
      tool: draftTool,
    });
    if (!result.claimed) {
      return { success: false, error: result.error || 'Submission is no longer pending' };
    }
    if (result.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  }

  const { error: claimError, claimed } = await store.markSubmission(parsed.data, approvalUpdate);
  if (claimError) {
    return { success: false, error: 'Failed to approve submission' };
  }
  if (!claimed) {
    return { success: false, error: 'Submission is no longer pending' };
  }

  const { error: draftError } = await store.createDraftTool(draftTool);
  if (draftError) {
    await store.revertToPending(parsed.data);
    return { success: false, error: 'Failed to create draft' };
  }

  return { success: true };
}
