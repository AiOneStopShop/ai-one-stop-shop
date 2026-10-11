'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
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

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDecline();
      }
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyOffset);
      document.removeEventListener('keydown', handleEscape);
      clearOffset();
    };
  }, [showBanner]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie consent notice"
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#5B657B] shadow-lg"
    >
      <div className="container-max py-2 sm:py-3">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-[#171C26] leading-snug min-w-0">
            Essential cookies only. No tracking.{' '}
            <Link href="/privacy" className="text-[#6C39EF] underline hover:no-underline focus-ring rounded">
              Privacy Policy
            </Link>
          </p>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="btn-secondary text-xs sm:text-sm px-3 py-2 min-h-[36px]"
            >
              Dismiss
            </button>
            <button
              onClick={handleAccept}
              className="btn-primary text-xs sm:text-sm px-3 py-2 min-h-[36px]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
