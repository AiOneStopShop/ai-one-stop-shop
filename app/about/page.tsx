import Link from 'next/link';

export const metadata = {
  title: 'About - AI One Stop Shop',
  description: 'Learn about AI One Stop Shop and who\'s behind the honest AI tools directory.',
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
              Hi, I'm Kati Bartolec. I run AI One Stop Shop from Washington State.
            </p>

            <h2 className="heading-2 mt-12">Why this exists</h2>
            <p>
              There are a lot of AI tool lists out there. Many are huge, and some are ordered by who paid the most. I wanted the opposite: a short list you can trust, from someone who'll tell you when a tool isn't right for you.
            </p>

            <p>
              So here's exactly how it works, including what I don't do yet.
            </p>

            <h2 className="heading-2 mt-12">How I work</h2>
            <p>
              I review each tool's public pricing and features. I use AI helpers for research, like gathering pricing pages and summarizing changelogs. They work alongside me. A person decides whether a tool gets listed and where it ranks.
            </p>

            <h2 className="heading-2 mt-12">The numbers you see</h2>
            <p>
              Right now, I have a small catalog of tools. Every number you see on this site comes from real data—tool counts, prices, and "Price last checked" dates. If I don't have real data for something, I don't show it.
            </p>

            <p>
              You won't see fake ratings, made-up review counts, or inflated numbers here.
            </p>

            <h2 className="heading-2 mt-12">How I make money</h2>
            <p>
              Some links are paid (affiliate) links. If you sign up through one, the tool maker may pay me a commission at no extra cost to you. Some tool makers may also pay for a clearly labeled "Sponsored" spot.
            </p>

            <p className="font-semibold">
              None of that changes the ranking. A tool doesn't move up because it pays me, and it doesn't move down because it doesn't.
            </p>

            <p>
              <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                Read my full disclosure →
              </Link>
            </p>

            <h2 className="heading-2 mt-12">A oneTomorrow venture</h2>
            <p>
              AI One Stop Shop is part of{' '}
              <a
                href="https://onetomorrow.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6C39EF] hover:underline focus-ring rounded"
              >
                oneTomorrow
              </a>
              , my collection of projects that help people use technology while staying in control.
            </p>

            <h2 className="heading-2 mt-12">Contact</h2>
            <p>
              Questions? Spotted a mistake? Email me at{' '}
              <a
                href="mailto:hello@aionestop.shop"
                className="text-[#6C39EF] hover:underline focus-ring rounded"
              >
                hello@aionestop.shop
              </a>
              . I read every message.
            </p>

            <div className="mt-12 p-6 bg-[#F3EFFF] border border-[#6C39EF] rounded-lg">
              <p className="font-semibold mb-2">The promise</p>
              <p>
                The best AI tools don't replace you. They give you more time for the work only you can do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
