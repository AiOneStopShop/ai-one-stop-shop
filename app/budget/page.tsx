import type { Metadata } from 'next';
import Link from 'next/link';
import { BudgetForm } from '@/app/budget/BudgetForm';
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
    'Build an AI toolkit within a monthly budget, including $0. Real listed prices only — no invented numbers.',
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
              <li aria-current="page" className="text-[#171C26] font-medium">
                Budget calculator
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 mb-4">Budget calculator</h1>
          <p className="text-lead mb-4">
            Pick a persona or your goals, set a monthly budget (including $0), and get a starter stack from the live catalog.
          </p>
          <PriceHonesty className="mb-8" />
          {persona && (
            <p className="mb-8 text-[#171C26]">
              Building for{' '}
              <Link
                href={`/personas/${persona.slug}`}
                className="text-[#6C39EF] hover:underline focus-ring rounded"
              >
                {persona.name}
              </Link>
              : {persona.title}.
            </p>
          )}

          <div className="grid gap-12">
            <BudgetForm key={serializeBudgetSearchParams(query)} query={query} />
            <ToolkitResults result={result} query={query} affiliates={affiliates} />
          </div>

          <div className="mt-8 p-6 bg-[#F0EDFF] border border-[#C7BDFF] rounded-lg">
            <h2 className="text-lg font-semibold text-[#171C26] mb-2">
              Comparing LLM API costs?
            </h2>
            <p className="text-[#5B657B] mb-3">
              Check our LLM pricing comparison to estimate token costs for OpenAI, Anthropic, Google, and more.
            </p>
            <Link
              href="/compare/llm-pricing"
              className="inline-flex items-center text-[#6C39EF] hover:underline focus-ring rounded"
            >
              View LLM API pricing →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
