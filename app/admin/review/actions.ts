'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

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
