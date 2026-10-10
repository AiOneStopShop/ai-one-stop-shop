'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // If we add analytics in the future, initialize them here
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#6C39EF] shadow-lg z-50">
      <div className="container-max py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-[#171C26] mb-2">
              <strong>Cookie notice:</strong> This site uses essential cookies for authentication and site functions. We don't use tracking or advertising cookies.
            </p>
            <p className="text-xs text-[#5B657B]">
              By clicking "Accept", you agree to our use of essential cookies. See our{' '}
              <a href="/privacy" className="text-[#6C39EF] hover:underline">
                Privacy Policy
              </a>
              {' '}for details.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-sm font-medium text-[#171C26] hover:text-[#6C39EF] border border-[#E5E1DC] rounded-lg hover:border-[#6C39EF] transition-colors focus-ring"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-sm font-medium text-white bg-[#6C39EF] rounded-lg hover:bg-[#5B2FD8] transition-colors focus-ring"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
