interface SponsoredLabelProps {
  className?: string;
}

/**
 * FTC-compliant "Sponsored ad" label.
 * - Min 14px font size
 * - Contrast ratio ≥ 4.5:1
 * - Visible at 390px and 1440px viewports
 * - aria-label for screen readers
 */
export function SponsoredLabel({ className = '' }: SponsoredLabelProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-sm font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded ${className}`}
      aria-label="This is a sponsored advertisement"
      role="note"
      style={{ fontSize: '14px', minHeight: '24px' }}
    >
      Sponsored ad
    </span>
  );
}
