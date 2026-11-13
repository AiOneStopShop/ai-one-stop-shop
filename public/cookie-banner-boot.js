// Loaded from the root layout with next/script beforeInteractive so the banner
// offset class is set before paint. Allowed by script-src 'self'. Keep in sync
// with lib/cookie-consent.ts.
try {
  var c = localStorage.getItem('cookieConsent');
  if (c === 'accepted' || c === 'declined' || navigator.globalPrivacyControl === true) {
    document.documentElement.classList.add('cookie-consent-given');
  } else {
    document.documentElement.classList.add('has-cookie-banner');
  }
} catch (e) {
  document.documentElement.classList.add('has-cookie-banner');
}
