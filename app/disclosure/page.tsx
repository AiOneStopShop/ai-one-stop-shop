import Link from 'next/link';
import { Check } from 'lucide-react';
import { ContactEmailText } from '@/components/ContactEmail';
import { PageIntro } from '@/components/PageIntro';
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
      <PageIntro
        title="How we make money"
        accent="jar"
        lead="In plain English. We want you to know exactly how this site pays for itself, so you can judge our advice for yourself."
      />

      <div className="container-max py-12 md:py-16 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-14 items-start">
        <article className="guide-prose">
          <h2>The short version</h2>
          <p>
            Tool makers can pay for a clearly labeled spot. {affiliateLive ? 'Some links are paid links. ' : ''}We also sell a few kits we made ourselves. None of that changes where a tool sits in our list.
          </p>

          <h3>1. Sponsorships (our main revenue)</h3>
          <p>
            Tool makers may pay for a labeled spot in our sponsored row, at the top of a category page, or in our newsletter. Every sponsored placement is clearly marked <strong>Sponsored ad</strong> and kept separate from our ranked picks. If a sponsor&apos;s tool is also in our directory, its normal listing is reviewed and ranked exactly like every other tool&apos;s.
          </p>
          <p>
            <strong>Money buys a labeled spot, never our opinion.</strong> Sponsors can&apos;t buy a higher rank, a better write-up, inclusion in &quot;best of&quot; lists, or the removal of honest criticism. Sponsored spots are always labeled and kept apart from our picks.
          </p>
          <p>
            Learn more: <Link href="/advertise">Sponsor AI One Stop Shop</Link>
          </p>

          {affiliateLive && (
            <>
              <h3>2. Paid links (affiliate programs)</h3>
              <p>
                Some &quot;Visit&quot; buttons are affiliate links. If you click one and later buy or subscribe, the tool maker may pay us a commission. Using a paid link doesn&apos;t add a fee from us. Prices are set by the tool maker, and offers can differ by link, so check the price before you buy.
              </p>
              <p>
                Every affiliate link is marked <strong className="text-orange-ink">&quot;Paid link&quot;</strong> right next to it, and we use <code>rel=&quot;sponsored nofollow noopener&quot;</code> so search engines know it&apos;s a commercial relationship.
              </p>
            </>
          )}

          <h3>{affiliateLive ? '3' : '2'}. Our own products</h3>
          <p>
            We also make our own DIY packs and kits (like ApproveGate). When we mention one of our own projects, we say so right there. They&apos;re kept in a <Link href="/our-kits">separate section</Link> and never part of the ranked directory.
          </p>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>We don&apos;t accept free products in exchange for a positive review</li>
            {affiliateLive && <li>We don&apos;t hide affiliate relationships</li>}
            <li>We don&apos;t use fake urgency (&quot;only 3 spots left&quot;)</li>
            <li>We don&apos;t make up ratings or review counts</li>
          </ul>

          <h2>Conflict of interest: our own tools</h2>
          <p>
            ApproveGate and HumanHold are products we made. When we mention them, we disclose that they&apos;re ours. They&apos;re never ranked inside the main directory or included in &quot;best of&quot; lists.
          </p>

          {getSiteContactEmail() && (
            <>
              <h2>Questions?</h2>
              <p>
                <ContactEmailText prefix="Email us at " suffix=". We're happy to explain anything about how this works." />
              </p>
            </>
          )}

          <p className="text-sm text-soft !mt-10">Last updated: October 17, 2026</p>
        </article>

        <aside className="lg:sticky lg:top-24 space-y-5">
          <div className="panel-honest">
            <h2 className="heading-3 mb-4">What payments never buy</h2>
            <ul className="space-y-3 text-lg list-none p-0 m-0">
              {['A higher rank', 'A better write-up', 'Removing honest criticism'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 shrink-0 text-[#BFE0C6]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5">If a tool maker asks for that, the answer is no.</p>
          </div>
          <div className="note text-[0.98rem]">
            <p className="m-0">
              See exactly how the list is ordered on <Link href="/how-we-rank">How we rank</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
