'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import * as fs from 'fs';
import * as path from 'path';

const DRAFT_TOOLS_PATH = path.join(process.cwd(), 'draft-tools.json');

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate status value
function isValidStatus(status: string): boolean {
  return ['published', 'needs_review', 'draft', 'pending'].includes(status);
}

// Check admin auth
async function checkAdminAuth(): Promise<{ authorized: boolean; userId?: string; error?: string }> {
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { authorized: false, error: 'Not authenticated' };
  }

  // Check admin role in database
  const { data: userData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || userData?.role !== 'admin') {
    return { authorized: false, error: 'Not authorized' };
  }

  return { authorized: true, userId: session.user.id };
}

// Helper to read local draft JSON (dev only)
function readDraftTools(): any[] {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }
  try {
    if (fs.existsSync(DRAFT_TOOLS_PATH)) {
      return JSON.parse(fs.readFileSync(DRAFT_TOOLS_PATH, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading draft tools:', error);
  }
  return [];
}

// Helper to write local draft JSON (dev only)
function writeDraftTools(tools: any[]): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  try {
    fs.writeFileSync(DRAFT_TOOLS_PATH, JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error('Error writing draft tools:', error);
  }
}

export async function approveTool(toolId: string, toolData: any) {
  // 1. Check admin auth
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || 'Unauthorized' };
  }

  // 2. Validate toolId as UUID
  if (!isValidUUID(toolId)) {
    return { success: false, error: 'Invalid tool ID format' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseServiceKey) {
    // Use Supabase with service role key for admin operations
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      const { error } = await supabase
        .from('tools')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', toolId);
      
      if (error) {
        return { success: false, error: 'Failed to approve tool' };
      }
      
      revalidatePath('/admin/review');
      revalidatePath('/tools');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to approve tool' };
    }
  } else if (process.env.NODE_ENV === 'development') {
    // Dev-only local JSON fallback
    try {
      const drafts = readDraftTools();
      const index = drafts.findIndex((t: any) => t.url === toolData.url);
      
      if (index >= 0) {
        drafts.splice(index, 1);
        writeDraftTools(drafts);
      }
      
      revalidatePath('/admin/review');
      return { success: true, message: 'Tool approved in dev mode' };
    } catch (error: any) {
      return { success: false, error: 'Failed to approve tool' };
    }
  } else {
    return { success: false, error: 'Supabase not configured' };
  }
}

export async function rejectTool(toolId: string, toolData: any) {
  // 1. Check admin auth
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || 'Unauthorized' };
  }

  // 2. Validate toolId as UUID
  if (!isValidUUID(toolId)) {
    return { success: false, error: 'Invalid tool ID format' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseServiceKey) {
    // Use Supabase with service role key
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);
      
      if (error) {
        return { success: false, error: 'Failed to reject tool' };
      }
      
      revalidatePath('/admin/review');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to reject tool' };
    }
  } else if (process.env.NODE_ENV === 'development') {
    // Dev-only local JSON fallback
    try {
      const drafts = readDraftTools();
      const index = drafts.findIndex((t: any) => t.url === toolData.url);
      
      if (index >= 0) {
        drafts.splice(index, 1);
        writeDraftTools(drafts);
      }
      
      revalidatePath('/admin/review');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to reject tool' };
    }
  } else {
    return { success: false, error: 'Supabase not configured' };
  }
}
