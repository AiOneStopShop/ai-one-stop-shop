import type { ReactNode } from 'react';
import { getBrandUrl } from '@/lib/site-config';

export function BrandName({
  className,
  children = 'oneTomorrow',
}: {
  className?: string;
  children?: ReactNode;
}) {
  const url = getBrandUrl();

  if (!url) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
