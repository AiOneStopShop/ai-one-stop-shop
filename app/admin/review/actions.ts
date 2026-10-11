'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  runSubmissionReview,
  type DraftToolInsert,
  type ReviewStore,
  type SubmissionUpdate,
} from '@/lib/review-submissions';

// Validation schemas
const toolIdSchema = z.string().uuid();
const statusSchema = z.enum(['published', 'needs_review', 'draft', 'pending']);

// Check admin auth using getUser()
async function checkAdminAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, error: 'Supabase not configured' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  // Use getUser() for secure server-side verification
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { authorized: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { authorized: false, error: 'Not authorized' };
  }

  return { authorized: true, userId: user.id };
}

export async function approveTool(toolId: string) {
  // Validate input
  const parsed = toolIdSchema.safeParse(toolId);
  if (!parsed.success) {
    return { success: false, error: 'Invalid tool ID' };
  }

  // Check admin auth
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || 'Unauthorized' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const { error } = await supabase
      .from('tools')
      .update({ 
        status: 'published', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', toolId);
    
    if (error) {
      console.error('Approve tool error:', error);
      return { success: false, error: 'Failed to approve tool' };
    }
    
    revalidatePath('/admin/review');
    revalidatePath('/tools');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('Approve tool exception:', error);
    return { success: false, error: 'Failed to approve tool' };
  }
}

export async function rejectTool(toolId: string) {
  // Validate input
  const parsed = toolIdSchema.safeParse(toolId);
  if (!parsed.success) {
    return { success: false, error: 'Invalid tool ID' };
  }

  // Check admin auth
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || 'Unauthorized' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const { error } = await supabase
      .from('tools')
      .update({ 
        status: 'needs_review', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', toolId);
    
    if (error) {
      console.error('Reject tool error:', error);
      return { success: false, error: 'Failed to reject tool' };
    }
    
    revalidatePath('/admin/review');
    
    return { success: true };
  } catch (error: any) {
    console.error('Reject tool exception:', error);
    return { success: false, error: 'Failed to reject tool' };
  }
}

function createServiceReviewStore(): ReviewStore {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = { error: 'Supabase not configured' };
    return {
      getPendingSubmission: async () => ({ data: null, ...missing }),
      createDraftTool: async () => missing,
      markSubmission: async () => ({ ...missing, claimed: false }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return {
    async getPendingSubmission(id: string) {
      const { data, error } = await supabase
        .from('tool_submissions')
        .select('id, tool_name, website_url, description, status')
        .eq('id', id)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        return { data: null, error: 'Submission not found' };
      }
      return { data };
    },

    async createDraftTool(tool: DraftToolInsert) {
      let slug = tool.slug;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await supabase.from('tools').insert({
          ...tool,
          slug,
        });
        if (!error) {
          return {};
        }
        if (error.code === '23505') {
          slug = `${tool.slug}-${Math.random().toString(36).slice(2, 8)}`;
          continue;
        }
        console.error('Create draft tool error:', error);
        return { error: 'Failed to create draft' };
      }
      return { error: 'Failed to create draft' };
    },

    async markSubmission(id: string, update: SubmissionUpdate) {
      const { data, error } = await supabase
        .from('tool_submissions')
        .update(update)
        .eq('id', id)
        .eq('status', 'pending')
        .select('id');

      if (error) {
        console.error('Mark submission error:', error);
        return { error: 'Failed to update submission', claimed: false };
      }
      return { claimed: Array.isArray(data) && data.length === 1 };
    },
  };
}

export type ReviewFormState = { error: string | null };

export async function approveSubmission(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const result = await runSubmissionReview({
    submissionId: formData.get('submissionId'),
    decision: 'approved',
    checkAdmin: checkAdminAuth,
    getStore: createServiceReviewStore,
  });

  if (!result.success) {
    return { error: result.error || 'Failed to approve submission' };
  }

  revalidatePath('/admin/review');
  revalidatePath('/tools');
  return { error: null };
}

export async function rejectSubmission(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const result = await runSubmissionReview({
    submissionId: formData.get('submissionId'),
    decision: 'rejected',
    checkAdmin: checkAdminAuth,
    getStore: createServiceReviewStore,
  });

  if (!result.success) {
    return { error: result.error || 'Failed to reject submission' };
  }

  revalidatePath('/admin/review');
  return { error: null };
}
