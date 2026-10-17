import { PRICE_CHECKED_LABEL } from '@/lib/site-dates';

export function PriceHonesty({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-[#5B657B] ${className}`}>
      Prices come from public pricing pages, checked on{' '}
      <time dateTime="2026-10-10">{PRICE_CHECKED_LABEL}</time>. We do not invent
      prices, ratings, or review counts. If a monthly price is not listed, we say
      check price.
    </p>
  );
}
