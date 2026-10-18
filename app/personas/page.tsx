import type { Metadata } from 'next';
import Link from 'next/link';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { PERSONAS } from '@/lib/personas';

export const metadata: Metadata = {
  title: 'Personas',
  description: 'Starter AI stacks for builders, freelancers, teams, and founders — pulled from the live catalog.',
  alternates: { canonical: '/personas' },
};

export default function PersonasPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Personas', url: '/personas' },
  ]);
  const list = generateItemListSchema(
    'AI tool personas',
    'Who each starter stack is built for',
    PERSONAS.map((persona) => ({
      name: `${persona.name}: ${persona.title}`,
      url: `/personas/${persona.slug}`,
      description: persona.whoFor,
    }))
  );

  return (
    <div className="scroll-mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }}
      />

      <section className="section-spacing">
        <div className="container-max">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-soft hover:text-green focus-ring rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">
                Personas
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 mb-4">Personas</h1>
          <p className="text-lead max-w-3xl mb-8">
            Four starting points. Each page recommends a live toolkit from the catalog — not a fixed list of names.
          </p>
          <p className="mb-12">
            <Link href="/budget" className="btn-primary">
              Build a stack to a budget
            </Link>
          </p>

          <ul className="grid gap-6 md:grid-cols-2">
            {PERSONAS.map((persona) => (
              <li key={persona.slug}>
                <Link
                  href={`/personas/${persona.slug}`}
                  className="card block h-full hover:shadow-lg focus-ring"
                >
                  <h2 className="heading-3 mb-2">{persona.name}</h2>
                  <p className="font-medium text-green mb-3">{persona.title}</p>
                  <p className="text-soft">{persona.whoFor}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
