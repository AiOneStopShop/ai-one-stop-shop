import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { ContactEmail } from '@/components/ContactEmail';
import { getSiteContactEmail } from '@/lib/site-config';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export const metadata = {
  title: 'Newsletter',
  description: 'A short, occasional email from oneTomorrow about AI tools that help people. Not started yet: join the list for the first issue.',
  alternates: { canonical: '/newsletter' },
};

const WHAT_YOU_GET = [
  'One or two tools worth trying, with the real price and the date we checked it',
  'Price changes on tools already in our list',
  'A small, practical way to use AI that leaves you in charge of the work',
];

export default function NewsletterPage() {
  const hasEmail = Boolean(getSiteContactEmail());

  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="The newsletter"
        accent="envelope"
        lead="A short, occasional email from us. It hasn't started yet. Join the list and we'll send the first issue when it's ready."
      />

      <div className="container-max py-12 md:py-16 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
        <div className="max-w-xl">
          <NewsletterSignup variant="full" source="newsletter_page" />
          {hasEmail ? (
            <p className="text-soft mt-5">
              Prefer email? Write to <ContactEmail subject="Newsletter" /> with &quot;Newsletter&quot; in the subject and we&apos;ll add you.
            </p>
          ) : null}
        </div>

        <div className="guide-prose">
          <h2 className="!mt-0">What to expect</h2>
          <ul className="list-none !pl-0 space-y-3">
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 mt-1 shrink-0 text-green-2" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <h2>The honest bits</h2>
          <ul>
            <li>About once a month at most. We&apos;ll only send one when we have something useful.</li>
            <li>A person writes and checks every issue.</li>
            <li>If an issue ever includes a sponsor, it will say <strong>Sponsored</strong> right there. Sponsors never pick what we recommend.</li>
            <li>Leave any time by replying &quot;unsubscribe&quot;.</li>
          </ul>
          <p>
            How we handle your email: <Link href="/privacy">Privacy</Link>. How we make money: <Link href="/disclosure">Disclosure</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
