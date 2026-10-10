import { createClient } from '@supabase/supabase-js';
import { fallbackTools, fallbackCategories, fallbackToolCategories } from './fallback-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isBuildTime = !supabaseUrl || !supabaseAnonKey;

// Create a real client if env vars are available, otherwise a mock for build time
const client = isBuildTime
  ? createClient('https://placeholder.supabase.co', 'placeholder-key')
  : createClient(supabaseUrl, supabaseAnonKey);

// Mock the Supabase client for build time
const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string, options?: any) => {
      let data: any[] = [];
      let count = 0;

      if (table === 'tools') {
        data = fallbackTools.map(tool => ({
          ...tool,
          tool_categories: fallbackToolCategories
            .filter(tc => tc.tool_id === tool.id)
            .map(tc => ({
              category_id: tc.category_id,
              is_primary: tc.is_primary,
              categories: fallbackCategories.find(c => c.id === tc.category_id),
            })),
        }));
        count = data.length;
      } else if (table === 'categories') {
        data = fallbackCategories;
        count = data.length;
      }

      return {
        eq: (col: string, val: any) => mockSupabase.from(table).select(columns, options),
        neq: (col: string, val: any) => mockSupabase.from(table).select(columns, options),
        gte: (col: string, val: any) => mockSupabase.from(table).select(columns, options),
        order: (col: string, opts?: any) => mockSupabase.from(table).select(columns, options),
        limit: (n: number) => mockSupabase.from(table).select(columns, options),
        range: (from: number, to: number) => mockSupabase.from(table).select(columns, options),
        single: () => Promise.resolve({ data: data[0] || null, error: null }),
        then: (resolve: any) => resolve({ data, error: null, count }),
      };
    },
    insert: (values: any) => ({
      select: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: null, error: null }),
    }),
  }),
};

export const supabase = isBuildTime ? (mockSupabase as any) : client;

// Server-side client with service role (use sparingly, only for admin operations)
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceKey);
}
