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
      className="cookie-banner fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#C7BDFF] shadow-sm"
    >
      <div className="container-max py-1.5 sm:py-2">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs text-[#171C26] leading-tight min-w-0 flex-1">
            <strong className="font-semibold">Simple cookies:</strong> We don't track. Browser remembers your compare list.{' '}
            <Link href="/privacy#cookies" className="text-[#6C39EF] underline hover:no-underline focus-ring rounded whitespace-nowrap">
              Privacy
            </Link>
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss cookie notice"
            className="btn-primary text-xs px-3 py-1 shrink-0 whitespace-nowrap"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
