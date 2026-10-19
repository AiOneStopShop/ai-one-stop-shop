// Visitor choice for optional analytics, kept in localStorage (never a cookie).
// Only an explicit 'accepted' turns analytics on. Anything else, including no
// value and the old 'dismissed' value from the info-only banner, means off.
export const CONSENT_KEY = 'cookieConsent';
export const CONSENT_EVENT = 'cookie-consent-change';
export const CONSENT_OPEN_EVENT = 'cookie-consent-open';

export type ConsentChoice = 'accepted' | 'declined';

/** True when the browser sends a Global Privacy Control signal. */
export function hasGpcSignal(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/** The visitor's explicit choice, if they made one. */
export function readStoredConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Effective choice. An explicit choice wins; otherwise a Global Privacy Control
 * signal counts as "No thanks" (and we don't prompt). No choice and no GPC: null.
 */
export function readConsent(): ConsentChoice | null {
  return readStoredConsent() ?? (hasGpcSignal() ? 'declined' : null);
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'accepted';
}

export function isAdminPath(pathname: string | null | undefined): boolean {
  return !!pathname && (pathname === '/admin' || pathname.startsWith('/admin/'));
}
