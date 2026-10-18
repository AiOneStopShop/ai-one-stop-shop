import { getFeaturedToolPlacements } from '@/lib/sponsor-placements';
import { SponsoredToolCard } from './SponsoredToolCard';
import { supabase } from '@/lib/supabase';
import type { Tool } from '@/types/database';

/**
 * Homepage sponsored tools row.
 * Displays up to 3 live sponsored placements in a dedicated section.
 * Self-contained component for easy integration with homepage redesigns.
 */
export async function HomeSponsoredRow() {
  const placements = await getFeaturedToolPlacements();

  if (placements.length === 0) {
    return null;
  }

  // Fetch tool details for placements that have tool_id
  const toolIds = placements
    .map((p) => p.tool_id)
    .filter((id): id is string => id !== null);

  let tools: Tool[] = [];
  if (toolIds.length > 0) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .in('id', toolIds)
      .eq('status', 'published');
    tools = data || [];
  }

  const getToolForPlacement = (placementToolId: string | null) => {
    if (!placementToolId) return null;
    return tools.find((t) => t.id === placementToolId) || null;
  };

  return (
    <section className="section-spacing bg-[#FFFBF0]">
      <div className="container-max">
        <div className="mb-8">
          <h2 className="heading-2">Sponsored ads</h2>
          <p className="text-soft mt-2">
            Paid placements. Our picks are above and aren't affected.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {placements.map((placement) => (
            <SponsoredToolCard
              key={placement.id}
              placement={placement}
              tool={getToolForPlacement(placement.tool_id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
