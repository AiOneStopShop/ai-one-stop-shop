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
        data = fallbackTools || [];
        count = data.length;
      } else if (table === 'categories') {
        data = fallbackCategories || [];
        count = data.length;
      }

      const createChainableQuery = (currentData: any[]) => ({
        eq: (col: string, val: any) => createChainableQuery(currentData.filter((item: any) => item[col] === val)),
        neq: (col: string, val: any) => createChainableQuery(currentData.filter((item: any) => item[col] !== val)),
        in: (col: string, vals: any[]) => createChainableQuery(currentData.filter((item: any) => vals.includes(item[col]))),
        contains: (col: string, val: any) => createChainableQuery(currentData.filter((item: any) => {
          const colVal = item[col];
          if (Array.isArray(colVal)) return colVal.includes(val);
          return false;
        })),
        gte: (col: string, val: any) => createChainableQuery(currentData.filter((item: any) => item[col] >= val)),
        order: (col: string, opts?: any) => createChainableQuery([...currentData]),
        limit: (n: number) => createChainableQuery(currentData.slice(0, n)),
        range: (from: number, to: number) => createChainableQuery(currentData.slice(from, to + 1)),
        single: () => Promise.resolve({ data: currentData[0] || null, error: null }),
        then: (resolve: any) => resolve({ data: currentData, error: null, count: currentData.length }),
      });

      return createChainableQuery(data);
    },
    insert: (values: any) => ({
      select: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: null, error: null }),
    }),
  }),
  rpc: async () => ({ data: null, error: { message: 'search_tools unavailable in fallback' } }),
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
