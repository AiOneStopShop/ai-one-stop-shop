import { createClient } from '@supabase/supabase-js';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Validate affiliate flag consistency at build time
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
    
    return [];
  },
};

export default nextConfig;
