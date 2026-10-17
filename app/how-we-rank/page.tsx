import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';
import { PRICE_CHECKED_LONG } from '@/lib/site-dates';

export const metadata = {
  title: 'How We Rank AI Tools',
  description: 'Learn about our methodology for choosing and ranking AI tools.',
  alternates: { canonical: '/how-we-rank' },
};

export default function HowWeRankPage() {
  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">How we choose and rank AI tools</h1>

          <div className="prose prose-lg max-w-none space-y-8 text-[#171C26]">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-lg font-semibold mb-2">The short version</p>
              <p>
                We review each tool&apos;s public pricing and features, we write down what we find in plain English, and we put the tool we&apos;d actually suggest first. Money never changes that order.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Why this page exists</h2>
              <p>
                There are a lot of AI tool lists out there. Many are huge, and some are ordered by who paid the most. We wanted the opposite: a short list you can trust, from people who&apos;ll tell you when a tool <em>isn&apos;t</em> right for you.
              </p>
              <p>
                So here&apos;s exactly how it works, including what we don&apos;t do yet.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Who reviews the tools</h2>
              <p>
                We run AI One Stop Shop from Washington State, and we review each tool&apos;s public pricing and features: what it claims to do, what it costs, and who it appears to be for.
              </p>
              <p>
                We use AI helpers for research, like gathering pricing pages and summarizing changelogs. They work alongside us. A person decides whether a tool gets listed and where it ranks.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we actually check</h2>
              <p>For every tool, we look at:</p>
              <ul className="space-y-2 mt-4">
                <li>✓ What it really does (in one or two plain sentences)</li>
                <li>✓ Who it&apos;s built for</li>
                <li>✓ Real pricing (with the date we checked)</li>
                <li>✓ How hard it is to get started, from public docs</li>
                <li>✓ Notes from the vendor&apos;s own feature and pricing pages</li>
                <li>✓ Good alternatives</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How the order is decided</h2>
              <p>
                Within each category, we put first the tool we&apos;d suggest to a friend who fits that category&apos;s &quot;best for&quot; description. The ranking is a judgment call, and we explain it in a sentence on every tool (&quot;Why it&apos;s here&quot;).
              </p>
              <p>
                We don&apos;t use star ratings or scores like &quot;9.2/10.&quot; We haven&apos;t built a system precise enough to back numbers like that, and we won&apos;t pretend we have.
              </p>
            </div>

            <div className="bg-[#4A2D86] text-white rounded-lg p-8">
              <h2 className="heading-2 mb-4">Editorial independence</h2>
              <p className="text-lg font-semibold mb-4">
                Money buys a labeled spot, never our opinion.
              </p>
              <p className="text-lg">
                Sponsors can't buy a higher rank, a better write-up, inclusion in "best of" lists, or the removal of honest criticism. Sponsored ads are never mixed into our ranked lists, the finder, comparisons or 'best of' pages, and we mark a tool 'Current sponsor' wherever we recommend it.
              </p>
              <p className="text-lg mt-4">
                If a sponsor's tool is also in our directory, its listing is reviewed the same way as every other tool's. We can decline any sponsor that doesn't fit our readers.
              </p>
              <p className="mt-4 text-base">
                Some links on this site are affiliate links. If you sign up through one, the tool maker may pay us a commission at no extra cost to you. That doesn't change the ranking either.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How often we re-check</h2>
              <p>
                AI tools change fast: prices, plans, and features. We re-check listed tools&apos; pricing and key details. When we have a check date, tool pages show a &quot;Price last checked&quot; date.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we don&apos;t do</h2>
              <ul className="space-y-2">
                <li>• We don&apos;t review every AI tool, only the ones whose public pricing and features we check</li>
                <li>• We don&apos;t run formal security audits</li>
                <li>• We are not the seller or maker of the tools listed here</li>
                <li>• We don&apos;t offer legal, financial, or tax advice about tools</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">About &quot;Our Kits&quot; (ApproveGate)</h2>
              <p>
                ApproveGate is our own product. It appears in the &quot;Our Kits&quot; section, which is kept completely separate from the ranked tool directory.
              </p>
              <p className="mt-4">
                <strong>ApproveGate is never ranked</strong> alongside the other tools. We don&apos;t include it in comparisons, search results, or category pages. It lives only in the &quot;Our Kits&quot; section, clearly marked as &quot;Made by us.&quot;
              </p>
            </div>

            <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
              <h2 className="heading-3 mb-3">Spotted a mistake?</h2>
              <p>
                Please tell us. Prices change and we&apos;re human.
              </p>
              {getSiteContactEmail() && (
                <p className="mt-4">
                  <strong>Email:</strong>{' '}
                  <ContactEmailText className="text-[#6C39EF] hover:underline focus-ring rounded" />
                </p>
              )}
              <p className="mt-2 text-sm">
                Tell us the tool, what looks wrong, and a link if you have one. We&apos;ll review facts you send, but corrections and payments are handled separately, and neither changes the ranking.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-sm text-[#5B657B]">
                — oneTomorrow<br />
                Last updated: {PRICE_CHECKED_LONG}
                <br />
                <strong>Note:</strong> Copy pending legal review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
