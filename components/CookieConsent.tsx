'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { CONSENT_OPEN_EVENT, hasGpcSignal, readConsent, readStoredConsent, writeConsent, type ConsentChoice } from '@/lib/cookie-consent';

// Both choices share one style so neither is nudged (equal prominence).
const CHOICE_BUTTON_CLASS = 'btn-secondary text-xs sm:text-sm px-3 py-2 min-h-[44px] min-w-[44px]';

// Asks once whether we may count visits with Vercel Web Analytics. Analytics stays
// off until the visitor picks "Allow analytics" (see components/SiteAnalytics.tsx).
// The old info-only "Got it" value ('dismissed') never counted as consent, so those
// visitors see the banner once more and get the real choice.
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(true);
  // Set when reopened from Cookie settings, so we can show the current choice.
  const [current, setCurrent] = useState<{ on: boolean; gpc: boolean } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readConsent()) {
      setShowBanner(false);
    }
    const reopen = () => {
      // globals.css hides the banner while this class is set (it stops a flash on load).
      document.documentElement.classList.remove('cookie-consent-given');
      setCurrent({ on: readConsent() === 'accepted', gpc: !readStoredConsent() && hasGpcSignal() });
      setShowBanner(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  const choose = useCallback((choice: ConsentChoice) => {
    writeConsent(choice);
    document.documentElement.classList.add('cookie-consent-given');
    setShowBanner(false);
    setCurrent(null);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const clearOffset = () => {
      root.classList.remove('has-cookie-banner');
      root.style.removeProperty('--cookie-banner-height');
    };

    if (!showBanner) {
      clearOffset();
      return clearOffset;
    }

    const applyOffset = () => {
      const height = bannerRef.current?.offsetHeight ?? 0;
      root.classList.add('has-cookie-banner');
      root.style.setProperty('--cookie-banner-height', `${height}px`);
    };

    applyOffset();
    const observer = new ResizeObserver(applyOffset);
    if (bannerRef.current) observer.observe(bannerRef.current);
    window.addEventListener('resize', applyOffset);

    // Escape means "no thanks": closing the banner never turns analytics on.
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        choose('declined');
      }
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyOffset);
      document.removeEventListener('keydown', handleEscape);
      clearOffset();
    };
  }, [showBanner, choose]);

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie and analytics choice"
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-soft shadow-lg"
    >
      <div className="container-max py-2 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <p id="cookie-banner-text" className="text-xs sm:text-sm text-ink leading-snug min-w-0">
            <strong>We keep it simple.</strong> No ad or tracking cookies. With your OK, we&apos;d count page visits with Vercel Web Analytics (no cookies, no profile of you) to learn what&apos;s useful. It stays off unless you say yes, and you can change your mind anytime.{process.env.NEXT_PUBLIC_AFFILIATE_LIVE === 'true' ? ' Some links may be paid links.' : ''} Any site you visit from here may set its own cookies after you click.{' '}
            <Link href="/privacy#cookies" className="text-green underline hover:no-underline focus-ring rounded">
              Privacy
            </Link>
            {current && (
              <span className="block mt-1" data-testid="cookie-current-choice" aria-live="polite">
                Analytics is currently <strong>{current.on ? 'on' : 'off'}</strong>
                {current.gpc ? ' (your browser sent a Global Privacy Control signal)' : ''}.
              </span>
            )}
          </p>
          <div className="flex flex-row gap-2 shrink-0" role="group" aria-labelledby="cookie-banner-text">
            <button
              type="button"
              onClick={() => choose('declined')}
              className={CHOICE_BUTTON_CLASS}
            >
              No thanks
            </button>
            <button
              type="button"
              onClick={() => choose('accepted')}
              className={CHOICE_BUTTON_CLASS}
            >
              Allow analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
