import type { Metadata } from 'next';
import Link from 'next/link';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { getCategories } from '@/lib/search-catalog';

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
      <section className="section-spacing">
        <div className="container-max">
          <h1 className="heading-1 mb-4">Categories</h1>
          <p className="text-xl text-ink leading-relaxed max-w-3xl mb-10">
            Each tool can sit in more than one category. These pages stay paginated as the catalog grows.
          </p>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <li key={category.id || category.slug}>
                <Link href={`/category/${category.slug}`} className="card block h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-ring group">
                  <h2 className="heading-3 mb-2 group-hover:text-green-2 transition-colors">
                    {category.icon ? <span aria-hidden="true">{category.icon} </span> : null}
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-soft">{category.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
