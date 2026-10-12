export type PriceKind = 'free' | 'monthly' | 'unknown';

export type ParsedPrice = {
  kind: PriceKind;
  monthlyUsd: number | null;
  label: string;
  source: string | null;
};

const MONTHLY_RE = /\$(\d+(?:\.\d+)?)\s*(?:\/\s*)?(?:mo|month)/i;
const DOLLAR_RE = /\$(\d+(?:\.\d+)?)/;

export function parseListedPrice(tool: {
  pricing_summary?: string | null;
  pricing_model?: string | null;
  has_free_tier?: boolean | null;
}): ParsedPrice {
  const summary = (tool.pricing_summary || '').trim();
  const model = (tool.pricing_model || '').toLowerCase();

  if (model === 'free') {
    return { kind: 'free', monthlyUsd: 0, label: 'Free', source: summary || 'Free' };
  }

  const monthlyMatch = summary.match(MONTHLY_RE);
  if (monthlyMatch) {
    const amount = Number(monthlyMatch[1]);
    if (Number.isFinite(amount)) {
      return {
        kind: 'monthly',
        monthlyUsd: amount,
        label: `$${amount}/month`,
        source: summary,
      };
    }
  }

  if (model === 'subscription') {
    const dollar = summary.match(DOLLAR_RE);
    if (dollar) {
      const amount = Number(dollar[1]);
      if (Number.isFinite(amount)) {
        return {
          kind: 'monthly',
          monthlyUsd: amount,
          label: `$${amount}/month`,
          source: summary,
        };
      }
    }
  }

  if (model === 'pay-per-use' || model === 'usage-based' || model === 'one-time' || model === 'contact') {
    return { kind: 'unknown', monthlyUsd: null, label: 'check price', source: summary || null };
  }

  if (!summary) {
    return { kind: 'unknown', monthlyUsd: null, label: 'check price', source: null };
  }

  return { kind: 'unknown', monthlyUsd: null, label: 'check price', source: summary };
}

export function priceForStack(
  tool: {
    pricing_summary?: string | null;
    pricing_model?: string | null;
    has_free_tier?: boolean | null;
  },
  options: { freeOnly?: boolean; freeFirst?: boolean }
): ParsedPrice {
  const listed = parseListedPrice(tool);
  if ((options.freeOnly || options.freeFirst) && tool.has_free_tier) {
    return {
      kind: 'free',
      monthlyUsd: 0,
      label: 'Free tier',
      source: listed.source,
    };
  }
  if (options.freeOnly && listed.kind !== 'free') {
    return { kind: 'unknown', monthlyUsd: null, label: 'check price', source: listed.source };
  }
  return listed;
}

export function formatStackTotal(amount: number, hasUnknown: boolean): string {
  const base = amount === 0 ? '$0/month' : `$${amount}/month`;
  return hasUnknown ? `${base} plus tools to check` : base;
}
