/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ensure metadata is in <head> for crawlers/bots (Next 15 streams metadata by default)
  htmlLimitedBots: /.*/,
  
  async headers() {
    // nosniff + HSTS live only on `/:path*` so HTML routes do not send them twice.
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
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
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
    ].join(' ');

    // One anti-framing pair: CSP frame-ancestors none + X-Frame-Options DENY.
    // Each header is set once — XFO on all paths, CSP only on HTML routes.
    const xFrameOptions = {
      key: 'X-Frame-Options',
      value: 'DENY'
    };
    const pageCsp = {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    };

    return [
      {
        // Apply on every path, including /_next/*
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          xFrameOptions,
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains'
          },
        ],
      },
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
        source: '/advertise/intake',
        destination: '/advertise/request',
        permanent: false,
      },
      {
        source: '/agents',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/toolkit',
        destination: '/budget',
        permanent: true,
      },
      {
        source: '/category/content',
        destination: '/category/writing',
        permanent: true,
      },
      {
        source: '/category/ai-models',
        destination: '/category/local-open-source',
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
