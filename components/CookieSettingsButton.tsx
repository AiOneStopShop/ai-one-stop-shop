'use client';

import { CONSENT_OPEN_EVENT } from '@/lib/cookie-consent';

// Re-opens the cookie banner so a visitor can change their analytics choice.
export function CookieSettingsButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
      className={className ?? 'text-green underline hover:no-underline focus-ring rounded min-h-[44px]'}
    >
      {children ?? 'Cookie settings'}
    </button>
  );
}
