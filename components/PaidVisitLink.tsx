import Link from 'next/link';

export function PaidVisitLink({
  slug,
  name,
  className = '',
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const noteId = `paid-${slug}`;
  return (
    <span className={className}>
      <a
        href={`/go/${slug}`}
        rel="sponsored nofollow"
        className="link-paid"
        aria-describedby={noteId}
      >
        Visit {name}
        <span className="sr-only"> (paid link)</span>
      </a>
      <span id={noteId} className="block text-xs text-[#5B657B] mt-1">
        <span className="font-medium text-[#C62810]">Paid link:</span>{' '}
        We may earn a commission if you sign up.{' '}
        <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
          How we make money
        </Link>
      </span>
    </span>
  );
}
