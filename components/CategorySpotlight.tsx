'use client';

import { SponsoredLabel } from './SponsoredLabel';
import { ImpressionTracker } from './ImpressionTracker';
import type { PublicLivePlacement } from '@/types/database';

interface CategorySpotlightProps {
  placement: PublicLivePlacement;
}

/**
 * Display a category spotlight - exclusive sponsored block at top of category page.
 * Visually distinct with logo, blurb, and clear sponsorship labeling.
 */
export function CategorySpotlight({ placement }: CategorySpotlightProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8 relative">
      <ImpressionTracker placementId={placement.id} />
      <div className="flex items-start gap-4">
        {placement.logo_url && (
          <div className="flex-shrink-0">
            <img
              src={placement.logo_url}
              alt={`${placement.company} logo`}
              className="w-16 h-16 object-contain rounded"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <SponsoredLabel />
            <span className="text-sm text-soft">· Paid placement</span>
          </div>

          <h2 className="heading-2 mb-3">{placement.company}</h2>

          {placement.blurb && (
            <p className="text-lg text-ink mb-4 max-w-2xl">{placement.blurb}</p>
          )}

          <a
            href={`/go/s/${placement.id}`}
            target="_blank"
            rel="sponsored noopener"
            className="btn-primary inline-flex"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
