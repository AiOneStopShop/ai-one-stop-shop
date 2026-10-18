import Link from 'next/link';
import { BrandName } from '@/components/BrandName';
import { ContactEmailText } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';

export const metadata = {
  title: 'About - AI One Stop Shop',
  description: 'Learn about AI One Stop Shop, a oneTomorrow venture and honest AI tools directory.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max max-w-3xl">
          <h1 className="heading-1 mb-8">About AI One Stop Shop</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-[#171C26]">
            <p className="text-lead text-[#5B657B]">
              We are oneTomorrow. We run AI One Stop Shop from Washington State.
            </p>

            <h2 className="heading-2 mt-12">Why this exists</h2>
            <p>
              There are a lot of AI tool lists out there. Many are huge, and some are ordered by who paid the most. We wanted the opposite: a short list you can trust, from people who&apos;ll tell you when a tool isn&apos;t right for you.
            </p>

            <p>
              So here&apos;s exactly how it works, including what we don&apos;t do yet.
            </p>

            <h2 className="heading-2 mt-12">How we work</h2>
            <p>
              We review each tool&apos;s public pricing and features. We use AI helpers for research, like gathering pricing pages and summarizing changelogs. They work alongside us. A person sets the rules and reviews what's listed.
            </p>

            <h2 className="heading-2 mt-12">The numbers you see</h2>
            <p>
              Right now, we have a small catalog of tools. Every number you see on this site comes from real data—tool counts, prices, and &quot;Price last checked&quot; dates. If we don&apos;t have real data for something, we don&apos;t show it.
            </p>

            <p>
              You won&apos;t see fake ratings, made-up review counts, or inflated numbers here.
            </p>

            <h2 className="heading-2 mt-12">How we make money</h2>
            <p>
              We earn money from clearly labeled sponsored ads and our own kits. Payments never change how we rank tools.
            </p>

            <p className="font-semibold">
              None of that changes the ranking. A tool doesn&apos;t move up because it pays us, and it doesn&apos;t move down because it doesn&apos;t.
            </p>

            <p>
              <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                Read our full disclosure →
              </Link>
            </p>

            <h2 className="heading-2 mt-12">A oneTomorrow venture</h2>
            <p>
              AI One Stop Shop is part of{' '}
              <BrandName className="text-[#6C39EF] hover:underline focus-ring rounded" />
              , our collection of projects that help people use technology while staying in control.
            </p>

            {getSiteContactEmail() && (
              <>
                <h2 className="heading-2 mt-12">Contact</h2>
                <p>
                  <ContactEmailText
                    className="text-[#6C39EF] hover:underline focus-ring rounded"
                    prefix="Questions? Spotted a mistake? Email us at "
                    suffix=". We read every message."
                  />
                </p>
              </>
            )}

            <div className="mt-12 p-6 bg-[#F3EFFF] border border-[#6C39EF] rounded-lg">
              <p className="font-semibold mb-2">The promise</p>
              <p>
                The best AI tools don&apos;t replace you. They give you more time for the work only you can do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
