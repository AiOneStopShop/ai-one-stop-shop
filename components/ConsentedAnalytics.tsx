'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { CONSENT_EVENT, CONSENT_KEY, hasAnalyticsConsent, isAdminPath } from '@/lib/cookie-consent';

// Vercel Web Analytics, loaded only after the visitor explicitly opts in through
// the cookie banner, and never on /admin. beforeSend re-checks both at send time,
// so withdrawing consent (or navigating into /admin) stops events at once even
// though the already-loaded script stays in memory until the next full load.
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!hasAnalyticsConsent()) return null;
  try {
    const url = new URL(event.url);
    if (isAdminPath(url.pathname)) return null;
    // Drop query strings and fragments (search terms, filters) before anything leaves the browser.
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}

export function ConsentedAnalytics() {
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const sync = () => setConsented(hasAnalyticsConsent());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === CONSENT_KEY) sync();
    };
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!consented || isAdminPath(pathname)) return null;
  return <Analytics beforeSend={beforeSend} />;
}
