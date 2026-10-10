import Link from 'next/link';

export const metadata = {
  title: 'How We Rank AI Tools',
  description: 'Learn about our methodology for choosing and ranking AI tools.',
};

export default function HowWeRankPage() {
  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">How we choose and rank AI tools</h1>

          <div className="prose prose-lg max-w-none space-y-8 text-[#171C26]">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-lg font-semibold mb-2">The short version</p>
              <p>
                We try tools ourselves, we write down what we find in plain English, and we put the tool we'd actually suggest first. Money never changes that order.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Why this page exists</h2>
              <p>
                There are a lot of AI tool lists out there. Many are huge, and some are ordered by who paid the most. We wanted the opposite: a short list you can trust, from people who'll tell you when a tool <em>isn't</em> right for you.
              </p>
              <p>
                So here's exactly how it works, including what we don't do yet.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">Who does the testing</h2>
              <p>
                I'm Kati Bartolec. I run AI One Stop Shop from Washington State, and I test tools hands-on: I sign up, use the tool on a real task, and note what worked and what got in the way.
              </p>
              <p>
                I use AI helpers for research, like gathering pricing pages and summarizing changelogs. They work alongside me. A person decides whether a tool gets listed and where it ranks.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we actually check</h2>
              <p>For every tool, we look at:</p>
              <ul className="space-y-2 mt-4">
                <li>✓ What it really does (in one or two plain sentences)</li>
                <li>✓ Who it's built for</li>
                <li>✓ Real pricing (with the date we checked)</li>
                <li>✓ How hard it is to get started</li>
                <li>✓ Hands-on notes from using it</li>
                <li>✓ Good alternatives</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How the order is decided</h2>
              <p>
                Within each category, we put first the tool we'd suggest to a friend who fits that category's "best for" description. The ranking is a judgment call, and we explain it in a sentence on every tool ("Why it's here").
              </p>
              <p>
                We don't use star ratings or scores like "9.2/10." We haven't built a system precise enough to back numbers like that, and we won't pretend we have.
              </p>
            </div>

            <div className="bg-[#4A2D86] text-white rounded-lg p-8">
              <h2 className="heading-2 mb-4">Money and ranking: the rule we don't break</h2>
              <p className="text-lg">
                Some links on this site are affiliate links. If you sign up through one, the tool maker may pay us a commission at no extra cost to you. Some tool makers may also pay for a clearly labeled <strong>Sponsored</strong> spot.
              </p>
              <p className="text-lg mt-4 font-semibold">
                None of that changes the ranking. A tool doesn't move up because it pays us, and it doesn't move down because it doesn't.
              </p>
              <p className="mt-4">
                Sponsored placements are always labeled "Sponsored" and kept separate from our ranked picks.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">How often we re-check</h2>
              <p>
                AI tools change fast: prices, plans, and features. We re-check each listed tool's pricing and key details regularly, and every tool page shows a "Last checked" date.
              </p>
            </div>

            <div>
              <h2 className="heading-2 mb-4">What we don't do (yet)</h2>
              <ul className="space-y-2">
                <li>• We don't review every AI tool, only the ones we've tried</li>
                <li>• We don't run formal security audits</li>
                <li>• We don't sell the tools ourselves</li>
                <li>• We don't offer legal, financial, or tax advice about tools</li>
              </ul>
            </div>

            <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6">
              <h2 className="heading-3 mb-3">Spotted a mistake?</h2>
              <p>
                Please tell us. Prices change and we're human.
              </p>
              <p className="mt-4">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:hello@aionestop.shop"
                  className="text-[#6C39EF] hover:underline focus-ring rounded"
                >
                  hello@aionestop.shop
                </a>
              </p>
              <p className="mt-2 text-sm">
                Tell us the tool, what looks wrong, and a link if you have one. We'll review facts you send, but corrections and payments are handled separately, and neither changes the ranking.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-sm text-[#5B657B]">
                — Kati<br />
                Last updated: October 10, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
