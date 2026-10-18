import Link from 'next/link';
import { CATALOG_PAGE_SIZE } from '@/lib/taxonomy';

export function CatalogPager({
  page,
  total,
  hrefForPage,
}: {
  page: number;
  total: number;
  hrefForPage: (page: number) => string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  if (pageCount <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-soft">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-3">
        {prev ? (
          <Link href={hrefForPage(prev)} className="btn-secondary" rel="prev">
            Previous page
          </Link>
        ) : null}
        {next ? (
          <Link href={hrefForPage(next)} className="btn-primary" rel="next">
            Next page
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
