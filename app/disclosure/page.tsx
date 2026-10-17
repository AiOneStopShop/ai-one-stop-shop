import Link from 'next/link';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail, isAffiliateLive } from '@/lib/site-config';

export const metadata = {
  title: 'Disclosure - How We Make Money',
  description: 'Learn how AI One Stop Shop makes money and how we keep our recommendations honest.',
  alternates: { canonical: '/disclosure' },
};

export default function DisclosurePage() {
  const affiliateLive = isAffiliateLive();

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">How we make money</h1>

          <p className="text-lead text-[#5B657B] mb-12">
            In plain English
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-[#171C26]">
            <div>
              <h2 className="heading-2 mb-4">The short version</h2>
              <p className="text-lg">
                We want you to know exactly how this site pays for itself, so you can judge our advice for yourself.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="heading-3 mb-3">1. Sponsorships (our main revenue)</h3>
                <p>
                  Tool makers may pay for a labeled spot in our sponsored row, at the top of a category page, or in our newsletter. Every sponsored placement is clearly marked <strong>Sponsored ad</strong> and kept separate from our ranked picks. If a sponsor's tool is also in our directory, its normal listing is reviewed and ranked exactly like every other tool's.
                </p>
                <p>
                  <strong>Money buys a labeled spot, never our opinion.</strong> Sponsors can't buy a higher rank, a better write-up, inclusion in &quot;best of&quot; lists, or the removal of honest criticism. Sponsored spots are always labeled and kept apart from our picks.
                </p>
                <p>
                  Learn more: <Link href="/advertise" className="text-[#6C39EF] hover:underline focus-ring rounded">Sponsor AI One Stop Shop</Link>
                </p>
              </div>

              {affiliateLive && (
                <div>
                  <h3 className="heading-3 mb-3">2. Paid links (affiliate programs)</h3>
                  <p>
                    Some &quot;Visit&quot; buttons are affiliate links. If you click one and later buy or subscribe, the tool maker may pay us a commission. Using a paid link doesn't add a fee from us. Prices are set by the tool maker, and offers can differ by link, so check the price before you buy.
                  </p>
                  <p>
                    Every affiliate link is marked <strong className="text-[#C62810]">&quot;Paid link&quot;</strong> right next to it, and we use <code>rel="sponsored nofollow noopener"</code> so search engines know it's a commercial relationship.
                  </p>
                </div>
              )}

              <div>
                <h3 className="heading-3 mb-3">{affiliateLive ? '3' : '2'}. Our own products</h3>
                <p>
                  We also make our own DIY packs and kits (like ApproveGate). When we mention one of our own projects, we say so right there. They&apos;re kept in a{' '}
                  <Link href="/our-kits" className="text-[#6C39EF] hover:underline focus-ring rounded">
                    separate section
                  </Link>{' '}
                  and never part of the ranked directory.
                </p>
              </div>
            </div>

            <div className="bg-[#4A2D86] text-white rounded-lg p-8 my-8">
              <h3 className="heading-3 mb-4">What payments never buy</h3>
              <ul className="space-y-2 text-lg">
                <li>✓ A higher rank</li>
                <li>✓ A better write-up</li>
                <li>✓ Removing honest criticism</li>
              </ul>
              <p className="mt-4">
                If a tool maker asks for that, the answer is no.
              </p>
            </div>

            <div>
              <h3 className="heading-3 mb-3">What we don&apos;t do</h3>
              <ul className="space-y-2">
                <li>• We don&apos;t accept free products in exchange for a positive review</li>
                {affiliateLive && <li>• We don&apos;t hide affiliate relationships</li>}
                <li>• We don&apos;t use fake urgency (&quot;only 3 spots left&quot;)</li>
                <li>• We don&apos;t make up ratings or review counts</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-3">Conflict of interest: our own tools</h3>
              <p>
                ApproveGate and HumanHold are products we made. When we mention them, we disclose that they&apos;re ours. They&apos;re never ranked inside the main directory or included in &quot;best of&quot; lists.
              </p>
            </div>

            {getSiteContactEmail() && (
              <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
                <h3 className="heading-3 mb-3">Questions?</h3>
                <p>
                  <ContactEmailText
                    className="text-[#6C39EF] hover:underline focus-ring rounded"
                    prefix="Email us at "
                    suffix=". We're happy to explain anything about how this works."
                  />
                </p>
              </div>
            )}

            <div className="mt-12">
              <p className="text-sm text-[#5B657B]">
                Last updated: October 17, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
