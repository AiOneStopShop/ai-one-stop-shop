import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { isAffiliateLive } from '@/lib/site-config';
import { PRICE_CHECKED_LABEL } from '@/lib/site-dates';

export const metadata = {
  title: 'AI One Stop Shop is Free',
  description: 'Browse all AI tools for free. No subscriptions, no hidden costs.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  const affiliateLive = isAffiliateLive();
  const included = [
    'Browse all tools, no account needed',
    `Real pricing info (price checked ${PRICE_CHECKED_LABEL})`,
    'Curated tools, no fake ratings',
    'Search and filter by category',
    'Compare tools side by side',
  ];

  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="It's free"
        accent="jar"
        lead="It's free to use. No subscriptions, no paid memberships."
      >
        <Link href="/tools" className="btn-primary">
          Start browsing tools
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </PageIntro>

      <section className="py-12 md:py-16">
        <div className="container-max grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 className="heading-2 mb-5">What you get</h2>
            <ul className="space-y-3 text-lg list-none p-0 m-0">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1.5 shrink-0 text-green-2" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="heading-3 mt-10 mb-3">Will you ever charge?</h2>
            <p className="text-lg">The directory is free to use. No account required.</p>
            <p className="text-lg mt-3">We may offer optional paid features in the future, but the core directory will remain free.</p>
          </div>

          <div className="panel-honest">
            <h2 className="heading-3 mb-3">How we make money</h2>
            <p>
              {affiliateLive
                ? 'Some links may be paid (affiliate) links. If you sign up through one, we may earn a commission. We don’t add any fee. '
                : 'Tool makers can pay for clearly labeled sponsored spots. '}
              We also have a separate section for our own products (like ApproveGate).
            </p>
            <p className="mt-3">
              <strong>Money never changes our ranking.</strong> A tool doesn&apos;t move up because it pays us.
            </p>
            <p className="mt-4 mb-0">
              <Link href="/disclosure">Read our full disclosure</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
