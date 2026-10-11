/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ensure metadata is in <head> for crawlers/bots (Next 15 streams metadata by default)
  htmlLimitedBots: /.*/,
  
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
    ];

    // CSP on HTML pages only. Applying it to /_next/static caused 400s and
    // MIME mismatches that blocked hydration in real Chrome / Playwright.
    const pageCsp = {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'"
      ].join('; ')
    };

    return [
      {
        // HTML routes only — do not attach CSP to hashed /_next/static assets
        source: '/((?!_next/).*)',
        headers: [...securityHeaders, pageCsp],
      },
    ];
  },

  images: {
    formats: ['image/webp'],
    unoptimized: process.env.NODE_ENV === 'production',
    remotePatterns: [],
  },

  async redirects() {
    return [
      {
        source: '/agents',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/toolkit',
        destination: '/finder',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/get-started',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
