import Link from 'next/link';
import { redirect } from 'next/navigation';
import { checkAdminAuth, getAdminServiceClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Search insights - Admin', robots: { index: false, follow: false } };

type StatRow = {
  query: string;
  searches: number;
  zero_result_searches: number;
  avg_results: number | null;
  last_searched: string;
};

const RANGES = [7, 30, 90] as const;

function formatPacific(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(iso));
}

function StatsTable({ rows, caption, empty }: { rows: StatRow[]; caption: string; empty: string }) {
  if (rows.length === 0) return <p className="text-soft">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-left">
            <th scope="col" className="py-2 pr-4">Query</th>
            <th scope="col" className="py-2 pr-4 text-right">Searches</th>
            <th scope="col" className="py-2 pr-4 text-right">Zero-result</th>
            <th scope="col" className="py-2 pr-4 text-right">Avg results</th>
            <th scope="col" className="py-2">Last searched</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.query} className="border-b border-line/60">
              <td className="py-2 pr-4">
                <Link href={`/tools?q=${encodeURIComponent(row.query)}`} className="text-green hover:underline">{row.query}</Link>
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">{row.searches}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{row.zero_result_searches}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{row.avg_results ?? '-'}</td>
              <td className="py-2 whitespace-nowrap">{formatPacific(row.last_searched)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminSearchInsightsPage(props: { searchParams: Promise<{ days?: string }> }) {
  const auth = await checkAdminAuth();
  if (!auth.authorized) redirect('/admin/login?next=/admin/search');

  const { days: daysParam } = await props.searchParams;
  const days = RANGES.includes(Number(daysParam) as (typeof RANGES)[number]) ? Number(daysParam) : 30;

  const supabase = getAdminServiceClient();
  let rows: StatRow[] = [];
  let loadError = '';
  if (!supabase) {
    loadError = 'Service client not configured.';
  } else {
    const { data, error } = await supabase.rpc('search_query_stats', { days, max_rows: 500 });
    if (error) loadError = 'Search stats are unavailable (has migration 026 been applied?).';
    else rows = (data ?? []) as StatRow[];
  }

  const top = rows.slice(0, 50);
  const zero = rows
    .filter((row) => row.zero_result_searches > 0)
    .sort((a, b) => b.zero_result_searches - a.zero_result_searches)
    .slice(0, 50);
  const totalSearches = rows.reduce((sum, row) => sum + Number(row.searches), 0);
  const totalZero = rows.reduce((sum, row) => sum + Number(row.zero_result_searches), 0);

  return (
    <section className="section-spacing">
      <div className="container-max space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="heading-1 mb-2">Search insights</h1>
            <p className="text-soft">
              Anonymous query text and result counts only. Logs are deleted after 90 days.
            </p>
          </div>
          <Link href="/admin/review" className="btn-secondary">Back to admin</Link>
        </div>

        <nav aria-label="Date range" className="flex gap-2">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin/search?days=${range}`}
              aria-current={range === days ? 'page' : undefined}
              className={range === days ? 'btn-primary' : 'btn-secondary'}
            >
              Last {range} days
            </Link>
          ))}
        </nav>

        {loadError ? (
          <div className="card text-soft">{loadError}</div>
        ) : (
          <>
            <p className="text-sm text-soft">
              {totalSearches} searches across {rows.length} distinct queries. Zero-result rate:{' '}
              {totalSearches ? `${Math.round((totalZero / totalSearches) * 1000) / 10}%` : '-'}.
            </p>
            <div className="card">
              <h2 className="heading-3 mb-4">Zero-result queries (catalog gaps)</h2>
              <StatsTable rows={zero} caption="Zero-result queries" empty="No zero-result searches in this range." />
            </div>
            <div className="card">
              <h2 className="heading-3 mb-4">Top queries</h2>
              <StatsTable rows={top} caption="Top queries" empty="No searches logged in this range." />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
