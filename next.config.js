import { createClient } from '@supabase/supabase-js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ensure metadata is in <head> for crawlers/bots (Next 15 streams metadata by default)
  htmlLimitedBots: /.*/,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'aionestop.shop',
      },
      {
        protocol: 'https',
        hostname: '**.aionestop.shop',
      },
    ],
  },

  async headers() {
    // Check that NEXT_PUBLIC_AFFILIATE_LIVE matches database state
    const affiliateLiveFlag = process.env.NEXT_PUBLIC_AFFILIATE_LIVE === 'true';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { count, error } = await supabase
          .from('affiliate_links')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (!error) {
          const hasAffiliateData = (count || 0) > 0;
          
          if (affiliateLiveFlag !== hasAffiliateData) {
            const message = affiliateLiveFlag
              ? `FATAL: NEXT_PUBLIC_AFFILIATE_LIVE=true but no active affiliate_links rows exist in the database. Either add affiliate data or set the flag to false.`
              : `FATAL: NEXT_PUBLIC_AFFILIATE_LIVE=false but ${count} active affiliate_links row(s) exist in the database. Either remove affiliate data or set the flag to true.`;
            
            console.error('\n' + '='.repeat(80));
            console.error(message);
            console.error('='.repeat(80) + '\n');
            
            throw new Error(message);
          }
          
          console.log(`✓ Affiliate flag check passed: NEXT_PUBLIC_AFFILIATE_LIVE=${affiliateLiveFlag}, active affiliate_links rows=${count || 0}`);
        }
      } catch (err) {
        if (err.message && err.message.includes('FATAL:')) {
          throw err;
        }
        console.warn('Warning: Could not validate affiliate flag consistency (database connection failed)');
      }
    } else {
      console.warn('Warning: Could not validate affiliate flag consistency (missing SUPABASE credentials)');
    }

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
        "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
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
};

export default nextConfig;
