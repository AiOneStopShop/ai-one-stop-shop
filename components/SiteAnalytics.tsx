'use client';

import { usePathname } from 'next/navigation';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { isAdminPath } from '@/lib/cookie-consent';

// Vercel Web Analytics, default script only. It sets no cookies and writes
// nothing to localStorage or sessionStorage, so it loads for every visitor
// (legitimate interest, see /privacy#analytics) without the consent banner.
// No custom events, no user IDs. Query strings and fragments are removed
// before anything leaves the browser, and /admin is never measured.
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
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
  if (isAdminPath(pathname)) return null;
  return <Analytics beforeSend={beforeSend} />;
}
