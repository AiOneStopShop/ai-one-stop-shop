try {
  if (localStorage.getItem('cookieConsent')) {
    document.documentElement.classList.add('cookie-consent-given');
  } else {
    document.documentElement.classList.add('has-cookie-banner');
  }
} catch (e) {
  document.documentElement.classList.add('has-cookie-banner');
}
