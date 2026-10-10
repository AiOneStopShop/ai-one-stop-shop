import Link from 'next/link';

export const metadata = {
  title: 'Pricing - Simple Plans for AI Tool Discovery',
  description: 'Free to browse. Upgrade only if the extra features save you time.',
};

export default function PricingPage() {
  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="heading-1 mb-4">Simple plans. Honest prices.</h1>
            <p className="text-lead">
              Browsing is free. Upgrade only if the extra help saves you time.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {/* Free Plan */}
            <div className="card">
              <div className="mb-6">
                <h2 className="heading-2 mb-2">Explorer</h2>
                <p className="text-[#5B657B]">You're curious and want to look around first</p>
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-[#171C26]">$0</p>
                <p className="text-sm text-[#5B657B]">Free forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Browse all tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>See honest pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Read editorial picks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Filter by category</span>
                </li>
              </ul>

              <Link href="/tools" className="btn-secondary w-full text-center">
                Start exploring free
              </Link>

              <p className="text-xs text-center text-[#5B657B] mt-4">
                No card needed
              </p>
            </div>

            {/* Member Plan - Placeholder for future */}
            <div className="card border-2 border-[#6C39EF] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#6C39EF] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Coming soon
                </span>
              </div>

              <div className="mb-6">
                <h2 className="heading-2 mb-2">Member</h2>
                <p className="text-[#5B657B]">You're choosing tools for real this month</p>
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-[#171C26]">$19</p>
                <p className="text-sm text-[#5B657B]">per month</p>
              </div>

              <p className="text-sm font-semibold text-[#171C26] mb-3">Everything in Explorer, plus:</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Advanced filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Save your shortlists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Tool finder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Export to PDF</span>
                </li>
              </ul>

              <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                Available soon
              </button>

              <p className="text-xs text-center text-[#5B657B] mt-4">
                Cancel anytime
              </p>
            </div>

            {/* Power Plan - Placeholder for future */}
            <div className="card">
              <div className="mb-6">
                <h2 className="heading-2 mb-2">Power Member</h2>
                <p className="text-[#5B657B]">You make tool decisions often</p>
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-[#171C26]">$39</p>
                <p className="text-sm text-[#5B657B]">per month</p>
              </div>

              <p className="text-sm font-semibold text-[#171C26] mb-3">Everything in Member, plus:</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Deeper comparisons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Pros & cons lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Setup complexity ratings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6C39EF] mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>

              <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                Available soon
              </button>

              <p className="text-xs text-center text-[#5B657B] mt-4">
                Cancel anytime
              </p>
            </div>
          </div>

          {/* Note about current status */}
          <div className="max-w-3xl mx-auto mb-16 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-[#171C26]">
              <strong>Currently:</strong> All tools are free to browse. We're testing whether paid tiers make sense for our users. Your feedback helps shape what we build.
            </p>
          </div>

          {/* What membership doesn't do */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="heading-2 mb-6 text-center">What membership does not do</h2>
            <div className="space-y-4 text-lg text-[#5B657B]">
              <p>• It doesn't buy you a higher ranking for your own tool</p>
              <p>• It doesn't change which tools we recommend</p>
              <p>• It doesn't sell you the AI tools themselves (we link to them)</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-2 mb-8 text-center">Common questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="heading-3 mb-2">Can I try before I buy?</h3>
                <p className="text-[#5B657B]">
                  Yes! Explorer is free forever. You can browse everything before deciding to upgrade.
                </p>
              </div>

              <div>
                <h3 className="heading-3 mb-2">Can I cancel anytime?</h3>
                <p className="text-[#5B657B]">
                  Yes. You can cancel from your account settings. Your access continues until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="heading-3 mb-2">Do you offer refunds?</h3>
                <p className="text-[#5B657B]">
                  Yes. If you're not happy within 14 days, email us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
