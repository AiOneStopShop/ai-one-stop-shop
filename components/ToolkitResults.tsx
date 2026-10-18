import Link from 'next/link';
import type { BudgetQuery } from '@/lib/budget-url';
import { budgetPath, withPick } from '@/lib/budget-url';
import type { ToolkitResult } from '@/lib/toolkit';
import { PaidVisitLink } from '@/components/PaidVisitLink';
import { ResultLiveRegion } from '@/components/ResultLiveRegion';
import type { AffiliateGoMap } from '@/lib/affiliate-links';
import { toolHasAffiliate } from '@/lib/affiliate-links';

export function ToolkitResults({
  result,
  query,
  heading = 'Recommended stack',
  showSwap = true,
  affiliates = {},
}: {
  result: ToolkitResult;
  query?: BudgetQuery;
  heading?: string;
  showSwap?: boolean;
  affiliates?: AffiliateGoMap;
}) {
  const compareHref = result.pickedSlugs.length >= 2
    ? `/compare?tools=${result.pickedSlugs.join(',')}`
    : null;

  return (
    <section aria-labelledby="toolkit-results-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 id="toolkit-results-heading" className="heading-2">
            {heading}
          </h2>
          <p
            className="text-lg text-ink mt-2"
            data-testid="toolkit-total"
            data-monthly-total={result.monthlyTotal}
            data-has-unknown={result.hasUnknown ? '1' : '0'}
          >
            Monthly total: <strong>{result.totalLabel}</strong>
          </p>
        </div>
        {compareHref && (
          <Link href={compareHref} className="btn-secondary">
            Compare these tools
          </Link>
        )}
      </div>

      <ResultLiveRegion
        message={`Recommended stack updated. Monthly total ${result.totalLabel}. ${result.pickedSlugs.length} tools.`}
      />

      {result.emptySlots.length > 0 && (
        <p className="text-sm text-soft">
          No listed tool with a known monthly price fit {result.emptySlots.join(', ')} within this budget.
        </p>
      )}

      <ol className="grid gap-6">
        {result.slots.map((row) => (
          <li
            key={row.slot.id}
            className="card"
            data-testid="toolkit-slot"
            data-slot={row.slot.id}
            data-tool-slug={row.pick?.tool.slug || ''}
            data-price-kind={row.pick?.price.kind || 'empty'}
            data-monthly={row.pick?.price.monthlyUsd ?? ''}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h3 className="heading-3">{row.slot.label}</h3>
              {row.mustHave && (
                <span className="badge bg-card text-[#4A2D86] border border-green">
                  Must-have
                </span>
              )}
            </div>

            {row.pick ? (
              <div>
                <p className="text-lg font-medium">
                  <Link
                    href={`/tools/${row.pick.tool.slug}`}
                    className="text-ink hover:text-green focus-ring rounded"
                  >
                    {row.pick.tool.name}
                  </Link>
                </p>
                {row.pick.tool.tagline && (
                  <p className="text-soft mt-1">{row.pick.tool.tagline}</p>
                )}
                <p className="mt-2 text-sm">
                  <span className="font-medium">{row.pick.price.label}</span>
                  {row.pick.price.source && row.pick.price.label !== row.pick.price.source && (
                    <span className="text-soft"> · listed as {row.pick.price.source}</span>
                  )}
                </p>
                <div className="mt-4">
                  <PaidVisitLink
                    slug={row.pick.tool.slug}
                    name={row.pick.tool.name}
                    paid={toolHasAffiliate(affiliates, row.pick.tool.slug)}
                    goSlug={affiliates[row.pick.tool.slug]}
                  />
                </div>
              </div>
            ) : (
              <p className="text-soft">
                No listed tool fits this slot within the budget. Raise the budget or pick a free-first stack.
              </p>
            )}

            {showSwap && query && row.alternatives.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-green focus-ring rounded min-h-11 inline-flex items-center">
                  Swap this tool
                </summary>
                <ul className="mt-3 space-y-2">
                  {row.alternatives.map((alt) => (
                    <li key={alt.tool.slug}>
                      <Link
                        href={budgetPath(withPick(query, row.slot.id, alt.tool.slug))}
                        className="text-ink hover:text-green underline focus-ring rounded"
                      >
                        {alt.tool.name}
                      </Link>
                      <span className="text-soft"> — {alt.price.label}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {row.freeAlternatives.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-green focus-ring rounded min-h-11 inline-flex items-center">
                  Free alternatives
                </summary>
                <ul className="mt-3 space-y-2">
                  {row.freeAlternatives.map((alt) => (
                    <li key={alt.tool.slug}>
                      {query ? (
                        <Link
                          href={budgetPath(withPick(query, row.slot.id, alt.tool.slug))}
                          className="text-ink hover:text-green underline focus-ring rounded"
                        >
                          {alt.tool.name}
                        </Link>
                      ) : (
                        <Link
                          href={`/tools/${alt.tool.slug}`}
                          className="text-ink hover:text-green underline focus-ring rounded"
                        >
                          {alt.tool.name}
                        </Link>
                      )}
                      <span className="text-soft"> — has a free tier</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
