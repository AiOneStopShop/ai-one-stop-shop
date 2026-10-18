import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tool } from '@/types/database';
import { fallbackTools } from '@/lib/fallback-data';
import { generateOrganizationSchema, generateWebSiteSchema, safeJsonLd } from '@/lib/json-ld';
import { DeskIllustration } from '@/components/DeskIllustration';
import { OrangeSwoosh } from '@/components/OrangeSwoosh';
import { HomeSponsoredRow } from '@/components/HomeSponsoredRow';
import { isAffiliateLive } from '@/lib/site-config';
import { ToolSearchForm } from '@/components/ToolSearchForm';

// Revalidate every 60 seconds so sponsored placements appear/disappear on time
export const revalidate = 60;

async function getToolsCount(): Promise<number> {
  const { count } = await supabase
    .from('tools')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');
  
  return count || 0;
}

export const metadata = {
  title: 'AI One Stop Shop - AI that fits your life',
  description: 'Curated AI tools directory. No fake ratings, no paid rankings. Find the right tool for your work and budget.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const toolsCount = await getToolsCount();

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <div className="scroll-mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center pt-6 pb-8 md:pt-14 md:pb-16">
            <div>
              <h1 className="heading-1 mb-5">
                AI that fits your life. And your budget.
              </h1>
              <OrangeSwoosh />
              <p className="text-xl leading-relaxed mb-8 max-w-[26em]">
                New to AI? Start with your situation. We'll help you find a useful first step, and you stay in charge of every choice.
              </p>
              <Link href="/finder" className="btn-primary">
                Find my starting point
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <p className="text-sm text-soft mt-4">Free to use. No account needed.</p>
            </div>
            <div className="w-full max-w-[560px] mx-auto md:max-w-none">
              <DeskIllustration className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Brings Section */}
      <section className="py-4 md:py-10 border-t border-line bg-cream-2">
        <div className="container-max">
          <h2 className="heading-2 pt-12 mb-3">What brings you here?</h2>
          <p className="text-lg text-soft mb-7 max-w-2xl">
            Pick the one that sounds most like you. You can change it any time.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8">
            <Link 
              href="/finder?situation=work"
              className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="mb-4">
                <svg viewBox="0 0 320 200" className="w-full h-auto rounded-lg" aria-hidden="true">
                  <rect width="320" height="200" fill="#DCEBD9"/>
                  <g transform="rotate(-8 120 100)">
                    <rect x="70" y="36" width="110" height="140" rx="4" fill="#fff" stroke="#C9C1B1"/>
                    <text x="88" y="70" fontFamily="Fraunces,Georgia,serif" fontSize="24" fontWeight="700" fill="#22201B">JOB</text>
                    <path d="M88 92h74M88 110h74M88 128h56M88 146h66" stroke="#C9C1B1" strokeWidth="4" strokeLinecap="round"/>
                  </g>
                  <rect x="160" y="96" width="118" height="80" rx="10" fill="#2F6B47"/>
                  <path d="M196 96v-14a8 8 0 0 1 8-8h30a8 8 0 0 1 8 8v14" fill="none" stroke="#1E3B2C" strokeWidth="7"/>
                  <rect x="160" y="124" width="118" height="6" fill="#24533A"/>
                  <rect x="210" y="118" width="18" height="18" rx="3" fill="#E7C9A0"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-green-2 transition-colors">
                Looking for work
              </h3>
              <p className="text-sm text-soft hidden sm:block">CVs, cover letters, interview prep</p>
            </Link>

            <Link 
              href="/finder?situation=business"
              className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="mb-4">
                <svg viewBox="0 0 320 200" className="w-full h-auto rounded-lg" aria-hidden="true">
                  <rect width="320" height="200" fill="#FBE1D6"/>
                  <rect x="70" y="80" width="180" height="104" fill="#F6EEE2"/>
                  <path d="M60 52h200l14 34H46Z" fill="#fff"/>
                  <g fill="#E2562B">
                    <path d="M60 52h28l-6 34H46Z"/>
                    <path d="M116 52h28l2 34h-36Z"/>
                    <path d="M172 52h28l8 34h-36Z"/>
                    <path d="M228 52h32l14 34h-36Z"/>
                  </g>
                  <path d="M46 86c0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0 0 12 26 12 26 0" fill="#E2562B"/>
                  <rect x="92" y="112" width="52" height="72" fill="#4E7FA0"/>
                  <rect x="162" y="112" width="68" height="44" fill="#A9C4D6"/>
                  <path d="M40 184h240" stroke="#C59C6B" strokeWidth="4"/>
                  <path d="M262 184v-30c0-12 8-20 18-20" fill="none" stroke="#3F7347" strokeWidth="4"/>
                  <ellipse cx="276" cy="134" rx="16" ry="9" fill="#5E8F5C" transform="rotate(-30 276 134)"/>
                  <rect x="250" y="168" width="28" height="18" rx="3" fill="#C9603F"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-green-2 transition-colors">
                Running a small business
              </h3>
              <p className="text-sm text-soft hidden sm:block">Posts, planning, customer emails</p>
            </Link>

            <Link 
              href="/finder?situation=everyday"
              className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="mb-4">
                <svg viewBox="0 0 320 200" className="w-full h-auto rounded-lg" aria-hidden="true">
                  <rect width="320" height="200" fill="#F7EBCB"/>
                  <path d="M110 112c0-22 14-36 40-36h50c26 0 40 14 40 36v30H110Z" fill="#5C83B0"/>
                  <rect x="92" y="120" width="36" height="58" rx="14" fill="#4D73A0"/>
                  <rect x="222" y="120" width="36" height="58" rx="14" fill="#4D73A0"/>
                  <rect x="120" y="140" width="110" height="34" rx="10" fill="#6A92BF"/>
                  <path d="M118 178v14M232 178v14" stroke="#3A2A1C" strokeWidth="5" strokeLinecap="round"/>
                  <path d="M58 186V120" stroke="#3F7347" strokeWidth="3"/>
                  <path d="M58 130c-14-14-34-14-42-6 12 12 30 14 42 6ZM58 140c14-16 34-18 44-10-12 14-32 16-44 10ZM58 118c-6-18 0-36 12-42 6 18 0 34-12 42Z" fill="#4E8452"/>
                  <rect x="40" y="170" width="36" height="22" rx="4" fill="#E9DCC7"/>
                  <rect x="262" y="160" width="40" height="32" rx="4" fill="#C59C6B"/>
                  <path d="M272 146h18v14h-18z" fill="#D9472B"/>
                  <path d="M290 150c8 0 8 8 0 8" fill="none" stroke="#D9472B" strokeWidth="3"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-green-2 transition-colors">
                Everyday life
              </h3>
              <p className="text-sm text-soft hidden sm:block">Home, family, learning something new</p>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/finder" className="btn-primary">
              Start the finder
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <span className="text-soft">Or browse <Link href="/tools" className="text-green hover:underline focus-ring rounded">all {toolsCount} tools</Link></span>
          </div>

          <div className="mt-12 pb-12 max-w-2xl">
            <h2 className="heading-3 mb-2">Already know what you need?</h2>
            <p className="text-soft mb-4">Search by tool name, a job like &ldquo;writing&rdquo;, or a category.</p>
            <ToolSearchForm id="home-search" shortcut={false} />
          </div>
        </div>
      </section>

      {/* Sponsored Row */}
      <HomeSponsoredRow />

      {/* Honesty Section */}
      <section className="bg-green text-[#F3EEE2] py-20">
        <div className="container-max">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <blockquote className="text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-fraunces leading-tight text-white m-0">
              The best AI tools don't replace you. They give you more time for the work only you can do.
            </blockquote>
            <div className="space-y-4">
              <p className="text-[#E3EADF] m-0">
                We list {toolsCount} AI tools today, with real prices and the date we last checked them. No fake ratings, no made-up numbers.
              </p>
              <p className="text-[#E3EADF] m-0">
                {isAffiliateLive()
                  ? 'Some links are paid links. If you sign up through one, the tool maker may pay us. You pay the same, and it never changes the order.'
                  : 'Sponsored spots are clearly labeled and kept apart from our list. Paying us never changes the order.'}{' '}
                <Link href="/how-we-rank" className="text-white hover:underline focus-ring rounded">
                  How we rank
                </Link>
                {' · '}
                <Link href="/disclosure" className="text-white hover:underline focus-ring rounded">
                  Our disclosure
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
