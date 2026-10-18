import type { Metadata } from 'next';
import Link from 'next/link';
import { BudgetForm } from '@/app/budget/BudgetForm';
import { PageIntro } from '@/components/PageIntro';
import { PriceHonesty } from '@/components/PriceHonesty';
import { ToolkitResults } from '@/components/ToolkitResults';
import { parseBudgetSearchParams, serializeBudgetSearchParams } from '@/lib/budget-url';
import { getActiveAffiliateGoSlugs } from '@/lib/affiliate-links';
import { getPublishedCatalogTools } from '@/lib/catalog-tools';
import { getPersona } from '@/lib/personas';
import { buildToolkit } from '@/lib/toolkit';

export const metadata: Metadata = {
  title: 'Budget calculator',
  description:
    'Build an AI toolkit within a monthly budget, including $0. Real listed prices only, no invented numbers.',
  alternates: { canonical: '/budget' },
};

export const revalidate = 3600;

type SearchParams = Record<string, string | string[] | undefined>;

export default async function BudgetPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const query = parseBudgetSearchParams(searchParams);
  const [tools, affiliates] = await Promise.all([
    getPublishedCatalogTools(),
    getActiveAffiliateGoSlugs(),
  ]);
  const result = buildToolkit(tools, query);
  const persona = getPersona(query.persona);

  return (
    <div className="scroll-mt-16">
      <PageIntro
        narrow
        accent="jar"
        title="Build a stack to your budget"
        lead="Tell us who it's for and what you can spend each month, including $0. We'll pick one tool per job from the live catalog, and you can swap any of them."
        above={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">
                Budget calculator
              </li>
            </ol>
          </nav>
        }
      >
        {persona ? (
          <span className="badge bg-card text-green border border-line">
            Building for{' '}
            <Link
              href={`/personas/${persona.slug}`}
              className="ml-1 underline underline-offset-2 hover:text-green-2 focus-ring rounded"
            >
              {persona.name}
            </Link>
            , {persona.title.charAt(0).toLowerCase() + persona.title.slice(1)}
          </span>
        ) : null}
      </PageIntro>

      <section className="py-10 md:py-14">
        <div className="container-max max-w-4xl">
          <PriceHonesty className="mb-8" />
          <div className="grid gap-12">
            <BudgetForm key={serializeBudgetSearchParams(query)} query={query} />
            <ToolkitResults result={result} query={query} affiliates={affiliates} />
          </div>
        </div>
      </section>
    </div>
  );
}
