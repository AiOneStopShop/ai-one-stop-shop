import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/json-ld';

export const metadata = {
  title: 'Our Own Kits - Made by AI One Stop Shop',
  description: 'DIY packs and kits we made ourselves to help you use AI tools while staying in control. Clearly marked and never part of our rankings.',
};

export default function OurKitsPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Our Kits', url: '/our-kits' }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div id="main-content" className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            {/* Header */}
            <div className="mb-12 max-w-3xl">
              <h1 className="heading-1 mb-4">Our Own Kits</h1>
              <p className="text-lead mb-6">
                Packs and kits we made ourselves. Clearly marked, and never part of our rankings.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-[#171C26]">
                  <strong>Full disclosure:</strong> We made these and earn money if you buy them. They're kept separate from our tool directory and never appear in ranked lists.{' '}
                  <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                    Read more about how we handle our own products
                  </Link>
                </p>
              </div>
            </div>

            {/* ApproveGate Kit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <article className="card">
                <div className="mb-4">
                  <span className="badge-made-by-us mb-3 inline-block">Made by us</span>
                  <h2 className="heading-2 mb-2">ApproveGate Skill Pack</h2>
                  <p className="text-lg text-[#5B657B]">
                    Draft with AI. Ship with judgment.
                  </p>
                </div>

                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">
                    ⏱ Status: In testing
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Free sample coming soon. Join the list to hear when it's ready.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">What's the problem?</h3>
                  <p className="text-[#5B657B]">
                    Your agent drafts emails, posts, and payments. Who decides before they go out?
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">What's inside</h3>
                  <ul className="space-y-2 text-[#5B657B]">
                    <li>✓ 4 gate skills (send, pay, post, publish)</li>
                    <li>✓ Install card</li>
                    <li>✓ Decision checklist</li>
                    <li>✓ 3 worked examples</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">How it works with you</h3>
                  <p className="text-[#5B657B]">
                    AI drafts → it stops and holds → <strong>you decide</strong> → then it goes.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Pricing (when available)</h3>
                  <p className="text-2xl font-bold text-[#171C26]">$29 intro / $49 list</p>
                  <p className="text-sm text-[#5B657B] mt-1">One-time purchase</p>
                </div>

                <div className="mb-6 text-sm text-[#5B657B]">
                  <p className="mb-2">
                    <strong>Add-on planned:</strong> HumanHold Outreach Kit, for AI-drafted outreach
                  </p>
                </div>

                <a
                  href="mailto:hello@aionestop.shop?subject=ApproveGate%20Waitlist"
                  className="btn-secondary w-full text-center"
                >
                  Join the waitlist
                </a>

                <p className="text-xs text-[#5B657B] mt-4">
                  <strong>Important:</strong> A checkpoint is your judgment, not legal, compliance, or security clearance.
                </p>
              </article>

              {/* Info Panel */}
              <div className="space-y-6">
                <div className="card bg-[#F3EFFF]">
                  <h3 className="heading-3 mb-3">Who this is for</h3>
                  <p className="text-[#5B657B]">
                    Solo operators already running Cursor, Claude Projects, or similar agents who want to keep human judgment in the loop before drafts go out.
                  </p>
                </div>

                <div className="card">
                  <h3 className="heading-3 mb-3">What to expect</h3>
                  <ul className="space-y-2 text-[#5B657B]">
                    <li>• This is a DIY pack you implement yourself</li>
                    <li>• You keep final judgment on every decision</li>
                    <li>• Skills and examples, not a managed service</li>
                    <li>• Your responsibility for legal and compliance needs</li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="heading-3 mb-3">Questions?</h3>
                  <p className="text-[#5B657B] mb-4">
                    Email us at hello@aionestop.shop. A real person reads every message.
                  </p>
                  <Link href="/disclosure" className="text-[#6C39EF] font-medium hover:underline focus-ring rounded">
                    Read our full disclosure →
                  </Link>
                </div>
              </div>
            </div>

            {/* Why These Aren't in the Directory */}
            <div className="bg-[#4A2D86] text-white rounded-xl p-8">
              <h2 className="heading-2 mb-4">Why you won't find these in our tool rankings</h2>
              <p className="text-lg mb-4">
                Our main promise is that <strong>paying us never moves a tool up the list</strong>. That includes our own products.
              </p>
              <p className="text-lg">
                ApproveGate and HumanHold are kept in this separate section, clearly labeled as "Made by us," and never included in editorial "best of" lists or the tool finder.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
