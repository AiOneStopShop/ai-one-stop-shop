import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'AI One Stop Shop is Free',
  description: 'Browse all AI tools for free. No subscriptions, no hidden costs.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  // Redirect to home - pricing page shouldn't exist per Kati's decision
  // redirect('/');
  
  // Or show a simple "it's free" page:
  return (
      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="heading-1 mb-4">It's free</h1>
              <p className="text-lead">
                It's free to use. No subscriptions, no paid memberships.
              </p>
            </div>

            <div className="space-y-8 text-lg text-[#171C26]">
              <div>
                <h2 className="heading-2 mb-4">What you get</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-[#6C39EF] text-xl">✓</span>
                    <span>Browse all tools - no account needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#6C39EF] text-xl">✓</span>
                    <span>Real pricing info (last updated Oct 2026)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#6C39EF] text-xl">✓</span>
                    <span>Hand-checked tools (no fake ratings)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#6C39EF] text-xl">✓</span>
                    <span>Search and filter by category</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#6C39EF] text-xl">✓</span>
                    <span>Compare tools side by side</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
                <h3 className="heading-3 mb-3">How we make money</h3>
                <p>
                  Some links are affiliate links. If you sign up through one, we may earn a commission at no extra cost to you. We also have a separate section for our own products (like ApproveGate).
                </p>
                <p className="mt-3">
                  <strong>Money never changes our ranking.</strong> A tool doesn't move up because it pays us.
                </p>
                <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded mt-2 inline-block">
                  Read our full disclosure →
                </Link>
              </div>

              <div>
                <h3 className="heading-3 mb-3">Will you ever charge?</h3>
                <p>
                  The directory is free to use. No account required.
                </p>
                <p className="mt-3">
                  We may offer optional paid features in the future, but the core directory will remain free.
                </p>
              </div>

              <div className="text-center pt-8">
                <Link href="/tools" className="btn-primary inline-block">
                  Start browsing tools
                </Link>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
