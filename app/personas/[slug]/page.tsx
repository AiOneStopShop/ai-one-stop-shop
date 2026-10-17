import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PriceHonesty } from '@/components/PriceHonesty';
import { ToolkitResults } from '@/components/ToolkitResults';
import { budgetPath } from '@/lib/budget-url';
import { getActiveAffiliateGoSlugs } from '@/lib/affiliate-links';
import { getPublishedCatalogTools } from '@/lib/catalog-tools';
import {
  generateBreadcrumbSchema,
  generatePersonaPageSchema,
  safeJsonLd,
} from '@/lib/json-ld';
import { getPersona, PERSONAS } from '@/lib/personas';
import { starterToolkitForPersona } from '@/lib/toolkit';

export const revalidate = 3600;

export function generateStaticParams() {
  return PERSONAS.map((persona) => ({ slug: persona.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const persona = getPersona(slug);
  if (!persona) return { title: 'Persona not found' };
  return {
    title: `${persona.name}: ${persona.title}`,
    description: persona.whoFor,
    alternates: { canonical: `/personas/${persona.slug}` },
  };
}

export default async function PersonaPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ free?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const persona = getPersona(slug);
  if (!persona) notFound();

  const freeFirst = searchParams.free === '1';
  const [tools, affiliates] = await Promise.all([
    getPublishedCatalogTools(),
    getActiveAffiliateGoSlugs(),
  ]);
  const result = starterToolkitForPersona(tools, persona.slug, { freeFirst });

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Personas', url: '/personas' },
    { name: persona.name, url: `/personas/${persona.slug}` },
  ]);
  const pageSchema = generatePersonaPageSchema(
    persona,
    result.slots
      .map((row) => row.pick?.tool)
      .filter(Boolean)
      .map((tool) => ({ name: tool!.name, slug: tool!.slug, tagline: tool!.tagline }))
  );

  const budgetHref = budgetPath({
    persona: persona.slug,
    budget: freeFirst ? 0 : persona.defaultBudget,
    goals: persona.goalIds,
    needs: [],
    freeFirst,
    picks: {},
  });

  return (
    <div className="scroll-mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(pageSchema) }}
      />

      <section className="section-spacing">
        <div className="container-max max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#5B657B]">/</li>
              <li>
                <Link href="/personas" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                  Personas
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#5B657B]">/</li>
              <li aria-current="page" className="text-[#171C26] font-medium">
                {persona.name}
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 mb-3">{persona.name}</h1>
          <p className="text-xl text-[#6C39EF] font-medium mb-4">{persona.title}</p>
          <p className="text-lead mb-8">{persona.whoFor}</p>

          <h2 className="heading-2 mb-4">Top jobs</h2>
          <ul className="list-disc pl-6 mb-10 space-y-2 text-[#171C26]">
            {persona.jobs.map((job) => (
              <li key={job}>{job}</li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href={budgetHref} className="btn-primary">
              Adjust this stack to a budget
            </Link>
            {freeFirst ? (
              <Link href={`/personas/${persona.slug}`} className="btn-secondary">
                Show listed monthly prices
              </Link>
            ) : (
              <Link href={`/personas/${persona.slug}?free=1`} className="btn-secondary">
                Prefer free tiers
              </Link>
            )}
          </div>

          <PriceHonesty className="mb-8" />
          <ToolkitResults
            result={result}
            heading={freeFirst ? 'Free-first starter toolkit' : 'Recommended starter toolkit'}
            showSwap={false}
            affiliates={affiliates}
          />
        </div>
      </section>
    </div>
  );
}
