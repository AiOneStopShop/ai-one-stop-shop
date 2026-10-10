'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

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
      role="region" 
      aria-label="Cookie consent notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#E5E1DC] shadow-lg"
    >
      <div className="container-max py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-[#171C26] mb-2">Cookie Notice</h2>
            <p className="text-sm text-[#5B657B]">
              This site uses only essential cookies for basic functionality. We do not use tracking or advertising cookies.{' '}
              <Link href="/privacy" className="text-[#6C39EF] hover:underline focus-ring rounded">
                Learn more in our Privacy Policy
              </Link>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="btn-secondary text-sm"
              aria-label="Dismiss cookie notice"
            >
              Dismiss
            </button>
            <button
              onClick={handleAccept}
              className="btn-primary text-sm"
              aria-label="Acknowledge and continue"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
