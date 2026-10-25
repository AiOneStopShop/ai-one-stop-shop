import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'AI tool guides',
  description: 'Short, honest guides to the best AI tools for teachers, small business, writers, students, $20 budgets and free use.',
  alternates: { canonical: '/guides' },
};

export default function GuidesPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ]);
  const list = generateItemListSchema(
    'AI tool guides',
    'Best AI tools by audience and budget',
    GUIDES.map((guide) => ({ name: guide.title, url: `/guides/${guide.slug}`, description: guide.question }))
  );
  return (
    <div className="scroll-mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }} />
      <PageIntro
        title="AI tool guides"
        accent="books"
        lead="We are oneTomorrow. Each guide starts with a real question people ask and answers it with tools from our catalog, with real prices."
      />
      <section className="py-10 md:py-14">
        <div className="container-max max-w-3xl">
          <ul className="grid gap-4 sm:grid-cols-2 list-none m-0 p-0">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="block h-full rounded-2xl border border-line bg-white p-5 hover:border-green focus-ring">
                  <span className="font-bold text-lg text-green">{guide.title}</span>
                  <span className="block text-soft text-sm mt-1">{guide.question}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
