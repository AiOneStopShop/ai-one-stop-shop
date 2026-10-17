import Link from 'next/link';

export function PaidVisitLink({
  slug,
  name,
  paid = false,
  goSlug,
  className = '',
}: {
  slug: string;
  name: string;
  paid?: boolean;
  goSlug?: string | null;
  className?: string;
}) {
  const href = `/go/${paid && goSlug ? goSlug : slug}`;
  const noteId = `visit-note-${slug}`;

  return (
    <span className={className}>
      <a
        href={href}
        rel={paid ? 'sponsored nofollow noopener' : 'noopener'}
        className={paid ? 'link-paid inline-flex items-center min-h-11' : 'inline-flex items-center min-h-11 text-[#6C39EF] hover:underline focus-ring rounded'}
        aria-describedby={paid ? noteId : undefined}
      >
        Visit {name}
        {paid ? <span className="sr-only"> (paid link)</span> : null}
      </a>
      {paid ? (
        <span id={noteId} className="block text-xs text-[#5B657B] mt-1">
          <span className="font-medium text-[#C62810]">Paid link:</span>{' '}
          We may earn a commission if you sign up.{' '}
          <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
            How we make money
          </Link>
        </span>
      ) : null}
    </span>
  );
}
