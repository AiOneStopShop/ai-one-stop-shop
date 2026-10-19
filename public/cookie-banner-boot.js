// Mirror of the inline boot script in app/layout.tsx (that one runs, with the CSP nonce).
// Keep both in sync with lib/cookie-consent.ts.
try {
  var c = localStorage.getItem('cookieConsent');
  if (c === 'accepted' || c === 'declined') {
    document.documentElement.classList.add('cookie-consent-given');
  } else {
    document.documentElement.classList.add('has-cookie-banner');
  }
} catch (e) {
  document.documentElement.classList.add('has-cookie-banner');
}
