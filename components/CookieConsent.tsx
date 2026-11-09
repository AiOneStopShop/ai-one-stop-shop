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
  // Element that opened the banner (Cookie settings). Returned to after choose/close.
  const openerRef = useRef<HTMLElement | null>(null);
  const settingsModeRef = useRef(false);

  const restoreFocus = useCallback(() => {
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener && document.contains(opener)) {
      opener.focus();
      return;
    }
    const main = document.getElementById('main');
    if (main instanceof HTMLElement) {
      main.focus();
    }
  }, []);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
    setCurrent(null);
    settingsModeRef.current = false;
    requestAnimationFrame(() => restoreFocus());
  }, [restoreFocus]);

  useEffect(() => {
    if (readConsent()) {
      setShowBanner(false);
    }
    const reopen = () => {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement ? active : null;
      settingsModeRef.current = true;
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
    hideBanner();
  }, [hideBanner]);

  // Escape never writes a consent choice (Dolly a11y: must-fix 1).
  // In settings mode it closes the banner and leaves the stored choice alone.
  // On first visit Escape does nothing so search/menus keep working.
  const dismissWithoutChoice = useCallback(() => {
    if (readStoredConsent() || hasGpcSignal()) {
      document.documentElement.classList.add('cookie-consent-given');
    }
    hideBanner();
  }, [hideBanner]);

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

    // Move focus into the banner after it opens (Dolly a11y: must-fix 3).
    requestAnimationFrame(() => {
      bannerRef.current?.focus();
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyOffset);
      clearOffset();
    };
  }, [showBanner]);

  const onBannerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape') return;
    // Only act when focus is inside the banner; never decline via Escape.
    if (!settingsModeRef.current && current === null) return;
    e.preventDefault();
    e.stopPropagation();
    dismissWithoutChoice();
  };

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie and analytics choice"
      tabIndex={-1}
      onKeyDown={onBannerKeyDown}
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-soft shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
    >
      <div className="container-max py-2 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h2 id="cookie-banner-heading" className="text-xs sm:text-sm font-semibold text-ink mb-0.5">
              Analytics choice
            </h2>
            <p id="cookie-banner-text" className="text-xs sm:text-sm text-ink leading-snug">
              Can we count page visits? We use Vercel Web Analytics. It doesn&apos;t use cookies or build a profile of you. It stays off unless you say yes. You can change this anytime in Cookie settings.{process.env.NEXT_PUBLIC_AFFILIATE_LIVE === 'true' ? ' Some links may be paid links.' : ''}{' '}
              <Link href="/privacy#cookies" className="text-green underline hover:no-underline focus-ring rounded">
                Privacy and cookies
              </Link>
              {current && (
                <span className="block mt-1" data-testid="cookie-current-choice" aria-live="polite">
                  Analytics is currently <strong>{current.on ? 'on' : 'off'}</strong>
                  {current.gpc ? ' (your browser sent a Global Privacy Control signal)' : ''}.
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-row gap-2 shrink-0" role="group" aria-labelledby="cookie-banner-heading">
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
