import { supabase } from './supabase';
import type { PublicLivePlacement, SponsorPackage } from '@/types/database';

/**
 * Fetch live sponsor placements from the public view.
 * Only returns placements that are currently active (within date range and status=live).
 */
export async function getLivePlacements(
  filters?: {
    package?: SponsorPackage;
    toolId?: string;
    categoryId?: string;
  }
): Promise<PublicLivePlacement[]> {
  try {
    let query = supabase.from('public_live_placements').select('*');

    if (filters?.package) {
      query = query.eq('package', filters.package);
    }
    if (filters?.toolId) {
      query = query.eq('tool_id', filters.toolId);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching live placements:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching live placements:', err);
    return [];
  }
}

/**
 * Check if a specific tool is currently sponsored.
 */
export async function isToolSponsored(toolId: string): Promise<boolean> {
  const placements = await getLivePlacements({ toolId });
  return placements.length > 0;
}

/**
 * Get featured tool placements for homepage (max 3).
 */
export async function getFeaturedToolPlacements(): Promise<PublicLivePlacement[]> {
  const placements = await getLivePlacements({ package: 'featured_tool' });
  return placements.slice(0, 3);
}

/**
 * Get category spotlight placement for a specific category (max 1).
 */
export async function getCategorySpotlight(categoryId: string): Promise<PublicLivePlacement | null> {
  const placements = await getLivePlacements({
    package: 'category_spotlight',
    categoryId,
  });
  return placements[0] || null;
}
