'use client';

import { PLATFORM_LABELS, PRICING_LABELS, type FacetOption, type SearchFacets } from '@/lib/search-facets';

type Category = { id?: string; slug: string; name: string };

export type FacetState = { category: string; price: string; free: boolean; platform: string };

type Props = {
  idPrefix: string;
  facets: SearchFacets | null;
  categories: Category[];
  state: FacetState;
  onChange: (next: Partial<FacetState>) => void;
};

function withFallback(options: FacetOption[] | undefined, fallback: Array<{ value: string; label: string }>): Array<FacetOption & { hasCount: boolean }> {
  if (options && options.length) return options.map((o) => ({ ...o, hasCount: true }));
  return fallback.map((o) => ({ ...o, count: 0, hasCount: false }));
}

function RadioGroup({
  idPrefix,
  name,
  legend,
  allLabel,
  value,
  options,
  onSelect,
}: {
  idPrefix: string;
  name: string;
  legend: string;
  allLabel: string;
  value: string;
  options: Array<FacetOption & { hasCount: boolean }>;
  onSelect: (value: string) => void;
}) {
  // Hide empty options (they would lead to zero results) unless currently selected.
  const visible = options
    .filter((o) => !o.hasCount || o.count > 0 || o.value === value)
    .sort((a, b) => (a.hasCount && b.hasCount ? b.count - a.count : 0) || a.label.localeCompare(b.label));
  return (
    <fieldset className="mb-6">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <ul className="space-y-1">
        <li>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-cream">
            <input
              type="radio"
              name={`${idPrefix}-${name}`}
              value="all"
              checked={value === 'all'}
              onChange={() => onSelect('all')}
              className="h-5 w-5 accent-[#1E3B2C] focus-ring"
            />
            <span className="flex-1 text-sm">{allLabel}</span>
          </label>
        </li>
        {visible.map((option) => (
          <li key={option.value}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-cream">
              <input
                type="radio"
                name={`${idPrefix}-${name}`}
                value={option.value}
                checked={value === option.value}
                onChange={() => onSelect(option.value)}
                className="h-5 w-5 accent-[#1E3B2C] focus-ring"
              />
              <span className="flex-1 text-sm">{option.label}</span>
              {option.hasCount ? (
                <span className="text-xs tabular-nums text-soft" aria-label={`${option.count} tools`}>
                  {option.count}
                </span>
              ) : null}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export function FacetPanel({ idPrefix, facets, categories, state, onChange }: Props) {
  return (
    <div>
      <fieldset className="mb-6">
        <legend className="sr-only">Free tier</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-soft px-3 hover:bg-cream">
          <input
            type="checkbox"
            checked={state.free}
            onChange={(event) => onChange({ free: event.target.checked })}
            className="h-5 w-5 accent-[#1E3B2C] focus-ring"
          />
          <span className="flex-1 text-sm">Has a free tier</span>
          {facets ? (
            <span className="text-xs tabular-nums text-soft" aria-label={`${facets.free} tools`}>{facets.free}</span>
          ) : null}
        </label>
      </fieldset>
      <RadioGroup
        idPrefix={idPrefix}
        name="category"
        legend="Category"
        allLabel="All categories"
        value={state.category}
        options={withFallback(facets?.category, categories.map((c) => ({ value: c.slug, label: c.name })))}
        onSelect={(category) => onChange({ category })}
      />
      <RadioGroup
        idPrefix={idPrefix}
        name="price"
        legend="Pricing model"
        allLabel="Any pricing"
        value={state.price}
        options={withFallback(facets?.pricing, Object.entries(PRICING_LABELS).map(([value, label]) => ({ value, label })))}
        onSelect={(price) => onChange({ price })}
      />
      <RadioGroup
        idPrefix={idPrefix}
        name="platform"
        legend="Platform"
        allLabel="Any platform"
        value={state.platform}
        options={withFallback(facets?.platform, Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label })))}
        onSelect={(platform) => onChange({ platform })}
      />
    </div>
  );
}
