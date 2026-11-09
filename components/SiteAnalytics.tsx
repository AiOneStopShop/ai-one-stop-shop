'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { CONSENT_EVENT, CONSENT_KEY, hasAnalyticsConsent, isAdminPath } from '@/lib/cookie-consent';

// Vercel Web Analytics, loaded only after the visitor explicitly opts in through
// the cookie banner ("Allow analytics"), and never on /admin. GPC counts as
// "No thanks". beforeSend re-checks consent and /admin at send time, so
// withdrawing consent stops events at once, and it strips query strings and
// fragments before anything leaves the browser. No custom events, no user IDs.
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!hasAnalyticsConsent()) return null;
  try {
    const url = new URL(event.url);
    if (isAdminPath(url.pathname)) return null;
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}

export function SiteAnalytics() {
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
