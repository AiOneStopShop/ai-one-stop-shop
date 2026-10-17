'use client';

import { useEffect, useRef } from 'react';

interface ImpressionTrackerProps {
  placementId: string;
}

/**
 * Client-side impression tracker.
 * Fires once when the placement becomes visible.
 * Uses Intersection Observer for accuracy.
 */
export function ImpressionTracker({ placementId }: ImpressionTrackerProps) {
  const tracked = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tracked.current || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !tracked.current) {
            tracked.current = true;

            // Track impression via API
            fetch('/api/placements/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placementId }),
            }).catch((err) => {
              console.error('Failed to track impression:', err);
            });

            // Stop observing after tracking
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 } // Track when 50% visible
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [placementId]);

  return (
    <div
      ref={elementRef}
      aria-hidden="true"
      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
    />
  );
}
