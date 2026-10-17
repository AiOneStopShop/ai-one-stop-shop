'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem('cookieConsent')) {
      setShowBanner(false);
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
        handleDismiss();
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

  const handleDismiss = () => {
    localStorage.setItem('cookieConsent', 'dismissed');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie notice"
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#5B657B] shadow-lg"
    >
      <div className="container-max py-2 sm:py-2.5">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-[#171C26] leading-snug min-w-0">
            <strong>We keep it simple.</strong> We don't use tracking or ad cookies. Your browser just remembers your compare list and this choice. Some links may be paid links, and any site you visit from here may set its own cookies after you click.{' '}
            <Link href="/privacy#cookies" className="text-[#6C39EF] underline hover:no-underline focus-ring rounded">
              Privacy
            </Link>
            <span aria-hidden="true"> · </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn-primary text-xs sm:text-sm px-3 py-1.5 min-h-[36px] align-middle"
            >
              Got it
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
