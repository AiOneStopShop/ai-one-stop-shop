'use server';

import { revalidatePath } from 'next/cache';
import * as fs from 'fs';
import * as path from 'path';

const DRAFT_TOOLS_PATH = path.join(process.cwd(), 'draft-tools.json');

// Helper to read local draft JSON
function readDraftTools(): any[] {
  try {
    if (fs.existsSync(DRAFT_TOOLS_PATH)) {
      return JSON.parse(fs.readFileSync(DRAFT_TOOLS_PATH, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading draft tools:', error);
  }
  return [];
}

// Helper to write local draft JSON
function writeDraftTools(tools: any[]): void {
  try {
    fs.writeFileSync(DRAFT_TOOLS_PATH, JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error('Error writing draft tools:', error);
  }
}

export async function approveTool(toolId: string, toolData: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    // Use Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase
        .from('tools')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', toolId);
      
      if (error) {
        console.error('Supabase approve error:', error);
        return { success: false, error: error.message };
      }
      
      revalidatePath('/admin/review');
      revalidatePath('/tools');
      return { success: true };
    } catch (error: any) {
      console.error('Approve tool error:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Use local JSON
    try {
      const drafts = readDraftTools();
      const index = drafts.findIndex((t: any) => t.url === toolData.url);
      
      if (index >= 0) {
        // Remove from drafts (approved tools would go to main fallback data)
        drafts.splice(index, 1);
        writeDraftTools(drafts);
      }
      
      revalidatePath('/admin/review');
      return { success: true, message: 'Tool approved (removed from drafts). Add to fallback-data.ts for production.' };
    } catch (error: any) {
      console.error('Approve tool error:', error);
      return { success: false, error: error.message };
    }
  }
}

export async function rejectTool(toolId: string, toolData: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    // Use Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);
      
      if (error) {
        console.error('Supabase reject error:', error);
        return { success: false, error: error.message };
      }
      
      revalidatePath('/admin/review');
      return { success: true };
    } catch (error: any) {
      console.error('Reject tool error:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Use local JSON
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
      console.error('Reject tool error:', error);
      return { success: false, error: error.message };
    }
  }
}
