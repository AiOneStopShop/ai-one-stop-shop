import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { personaStyle } from '@/lib/persona-style';
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
  const style = personaStyle(persona.slug);
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

      <PageIntro
        narrow
        accent={style.accent}
        title={<>{persona.name}: {persona.title.charAt(0).toLowerCase() + persona.title.slice(1)}</>}
        lead={persona.whoFor}
        above={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li>
                <Link href="/personas" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">
                  Personas
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">
                {persona.name}
              </li>
            </ol>
          </nav>
        }
      >
        <span className="badge bg-card text-green border border-line">{persona.audience}</span>
      </PageIntro>

      <section className="py-10 md:py-14">
        <div className="container-max max-w-4xl">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] mb-10">
            <div className="card !p-0 overflow-hidden">
              <div aria-hidden="true" className="h-3" style={{ background: style.tint }} />
              <div className="p-6">
                <h2 className="heading-3 mb-3">What {persona.name} needs to get done</h2>
                <ul className="space-y-2 text-ink">
                  {persona.jobs.map((job) => (
                    <li key={job} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 shrink-0 text-green-2" aria-hidden="true" />
                      <span>{job}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <figure className="note !m-0 flex flex-col justify-center">
              <blockquote className="font-fraunces text-[1.35rem] leading-snug text-green">
                &ldquo;{persona.voice}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm text-soft">
                {persona.name} is a composite of the people this toolkit is for, not a real customer.
              </figcaption>
            </figure>
          </div>

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
            heading={freeFirst ? `Free-first starter toolkit for ${persona.name}` : `Starter toolkit for ${persona.name}`}
            showSwap={false}
            affiliates={affiliates}
          />

          <nav aria-label="Other toolkits" className="mt-12 pt-8 border-t border-line">
            <h2 className="heading-3 mb-4">Not quite you? Try another toolkit</h2>
            <ul className="grid gap-3 sm:grid-cols-3 list-none p-0 m-0">
              {PERSONAS.filter((other) => other.slug !== persona.slug).map((other) => (
                <li key={other.slug}>
                  <Link href={`/personas/${other.slug}`} className="card !p-4 block h-full hover:border-green focus-ring">
                    <span className="block font-semibold text-green">{other.name}</span>
                    <span className="block text-sm text-soft">{other.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
}
