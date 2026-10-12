import { getGoal, getPersona } from '@/lib/personas';

export const BUDGET_PRESETS = [0, 20, 50, 100, 150, 500] as const;

export type BudgetQuery = {
  persona: string | null;
  budget: number;
  goals: string[];
  needs: string[];
  freeFirst: boolean;
  picks: Record<string, string>;
};

const PERSONA_ALIASES: Record<string, string> = {
  'tech-savvy-sarah': 'sarah',
  'freelance-fred': 'fred',
  'corporate-claire': 'claire',
  'startup-steve': 'steve',
};

type ParamValue = string | string[] | undefined;

function asList(value: ParamValue): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : [value];
  return parts
    .flatMap((part) => part.split(','))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function uniqueValid(ids: string[], allow: (id: string) => boolean): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id) || !allow(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function normalizePersonaSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const key = slug.trim().toLowerCase();
  const mapped = PERSONA_ALIASES[key] || key;
  return getPersona(mapped) ? mapped : null;
}

export function parseBudgetAmount(value: ParamValue, fallback = 50): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') return fallback;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return fallback;
  return Math.min(Math.round(amount), 10000);
}

export function parsePicks(value: ParamValue): Record<string, string> {
  const picks: Record<string, string> = {};
  for (const pair of asList(value)) {
    const [slot, slug] = pair.split(':');
    if (slot && slug && getGoal(slot)) {
      picks[slot] = slug;
    }
  }
  return picks;
}

export function parseBudgetSearchParams(
  searchParams: Record<string, ParamValue>,
  fallbackBudget = 50
): BudgetQuery {
  const budgetRaw = Array.isArray(searchParams.budget) ? searchParams.budget[0] : searchParams.budget;
  const budgetSource = budgetRaw === 'custom' ? searchParams.budget_custom : searchParams.budget;
  return {
    persona: normalizePersonaSlug(
      Array.isArray(searchParams.persona) ? searchParams.persona[0] : searchParams.persona
    ),
    budget: parseBudgetAmount(budgetSource, fallbackBudget),
    goals: uniqueValid(asList(searchParams.goals), (id) => Boolean(getGoal(id))),
    needs: uniqueValid(asList(searchParams.need), (id) => Boolean(getGoal(id))),
    freeFirst: asList(searchParams.free)[0] === '1',
    picks: parsePicks(searchParams.picks),
  };
}

export function serializeBudgetSearchParams(query: BudgetQuery): string {
  const params = new URLSearchParams();
  if (query.persona) params.set('persona', query.persona);
  params.set('budget', String(query.budget));
  if (query.goals.length) params.set('goals', query.goals.join(','));
  if (query.needs.length) params.set('need', query.needs.join(','));
  if (query.freeFirst) params.set('free', '1');
  const pickPairs = Object.entries(query.picks)
    .filter(([slot, slug]) => slot && slug)
    .map(([slot, slug]) => `${slot}:${slug}`);
  if (pickPairs.length) params.set('picks', pickPairs.join(','));
  return params.toString();
}

export function budgetPath(query: BudgetQuery): string {
  const qs = serializeBudgetSearchParams(query);
  return qs ? `/budget?${qs}` : '/budget';
}

export function withPick(query: BudgetQuery, slotId: string, slug: string | null): BudgetQuery {
  const picks = { ...query.picks };
  if (!slug) delete picks[slotId];
  else picks[slotId] = slug;
  return { ...query, picks };
}
