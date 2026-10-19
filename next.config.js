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

    // The Content-Security-Policy header is set per request in middleware.ts
    // (nonce-based script-src, no 'unsafe-inline'). See lib/csp.ts.

    // One anti-framing pair: CSP frame-ancestors none (middleware.ts) + X-Frame-Options DENY.
    const xFrameOptions = {
      key: 'X-Frame-Options',
      value: 'DENY'
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
        headers: securityHeaders,
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
