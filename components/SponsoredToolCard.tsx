'use client';

import Link from 'next/link';
import { SponsoredLabel } from './SponsoredLabel';
import { ImpressionTracker } from './ImpressionTracker';
import type { PublicLivePlacement } from '@/types/database';
import type { Tool } from '@/types/database';

interface SponsoredToolCardProps {
  placement: PublicLivePlacement;
  tool?: Tool | null;
}

/**
 * Display a sponsored tool card with proper labeling.
 * Used in homepage sponsored row and category pages.
 */
export function SponsoredToolCard({ placement, tool }: SponsoredToolCardProps) {
  const toolName = tool?.name || 'Featured Tool';
  const tagline = tool?.tagline || placement.blurb || '';
  const pricingSummary = tool?.pricing_summary;

  return (
    <div className="card relative">
      <ImpressionTracker placementId={placement.id} />
      <div className="mb-3">
        <SponsoredLabel className="mb-2" />
      </div>

      <h3 className="heading-3 mb-2">
        {tool ? (
          <Link
            href={`/tools/${tool.slug}`}
            className="hover:text-[#6C39EF] focus-ring rounded"
          >
            {toolName}
          </Link>
        ) : (
          <span>{placement.company}</span>
        )}
      </h3>

      {tagline && <p className="text-[#5B657B] mb-3 line-clamp-2">{tagline}</p>}

      {pricingSummary && (
        <p className="text-sm font-medium text-[#171C26] mb-4">{pricingSummary}</p>
      )}

      <div className="space-y-3">
        <a
          href={`/go/s/${placement.id}`}
          target="_blank"
          rel="sponsored noopener"
          className="btn-primary w-full block text-center"
        >
          Learn more
        </a>
        {tool && (
          <Link href={`/tools/${tool.slug}`} className="btn-secondary w-full">
            View details
          </Link>
        )}
      </div>
    </div>
  );
}
