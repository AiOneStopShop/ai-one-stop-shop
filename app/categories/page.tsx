import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { getCategories } from '@/lib/search-catalog';

const TINTS = ['#DCEBD9', '#FBE1D6', '#F7EBCB', '#E3ECF3', '#EFE3F0', '#F4EAD6'];

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse AI tools by job: chat, writing, image, video, coding, and more.',
  alternates: { canonical: '/categories' },
};

export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await getCategories();
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
  ]);
  const list = generateItemListSchema(
    'AI tool categories',
    'Browse the catalog by job',
    categories.map((category: any) => ({
      name: category.name,
      url: `/category/${category.slug}`,
      description: category.description,
    }))
  );

  return (
    <div className="scroll-mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }} />
      <PageIntro
        title="Categories"
        accent="books"
        lead="Browse by the job you want done. Each tool can sit in more than one category."
      />
      <section className="py-10 md:py-14">
        <div className="container-max">
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {categories.map((category: any, i: number) => (
              <li key={category.id || category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="card !p-0 overflow-hidden flex flex-col h-full hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-22px_rgba(30,59,44,0.8)] transition-all duration-200 focus-ring group"
                >
                  <span aria-hidden="true" className="block h-3" style={{ background: TINTS[i % TINTS.length] }} />
                  <span className="flex items-start justify-between gap-4 p-6">
                    <span>
                      <h2 className="heading-3 mb-2 group-hover:text-green-2 transition-colors">{category.name}</h2>
                      {category.description && <span className="block text-soft">{category.description}</span>}
                    </span>
                    <ArrowRight className="w-5 h-5 mt-2 shrink-0 text-green transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
