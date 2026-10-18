import type { CatalogTool } from '@/lib/catalog-tools';
import { categorySlugsOf, primaryCategorySlug } from '@/lib/catalog-tools';
import type { BudgetQuery } from '@/lib/budget-url';
import { formatStackTotal, priceForStack, type ParsedPrice } from '@/lib/pricing';
import { getPersona, slotsForSelection, type ToolkitSlot } from '@/lib/personas';

export type RankedTool = {
  tool: CatalogTool;
  score: number;
  price: ParsedPrice;
};

export type ToolkitSlotResult = {
  slot: ToolkitSlot;
  pick: RankedTool | null;
  alternatives: RankedTool[];
  freeAlternatives: RankedTool[];
  mustHave: boolean;
};

export type ToolkitResult = {
  slots: ToolkitSlotResult[];
  monthlyTotal: number;
  hasUnknown: boolean;
  totalLabel: string;
  pickedSlugs: string[];
  emptySlots: string[];
};

const MIN_SCORE = 8;
const ALT_LIMIT = 5;

function toolText(tool: CatalogTool): { name: string; haystack: string } {
  const name = tool.name.toLowerCase();
  const haystack = [
    tool.name,
    tool.tagline,
    tool.description,
    ...(tool.features || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return { name, haystack };
}

export function scoreToolForSlot(tool: CatalogTool, slot: ToolkitSlot): number {
  let score = 0;
  const slugs = categorySlugsOf(tool);
  const primary = primaryCategorySlug(tool);
  if (primary && slot.categorySlugs.includes(primary)) score += 8;
  if (slugs.some((slug) => slot.categorySlugs.includes(slug))) score += 6;

  const { name, haystack } = toolText(tool);
  for (const tag of slot.tags) {
    const needle = tag.toLowerCase();
    if (name.includes(needle)) score += 12;
    else if (haystack.includes(needle)) score += 3;
  }
  return score;
}

function priceOptions(query: BudgetQuery) {
  const freeOnly = query.budget === 0;
  return { freeOnly, freeFirst: freeOnly || query.freeFirst };
}

function rankForSlot(tools: CatalogTool[], slot: ToolkitSlot, query: BudgetQuery): RankedTool[] {
  const options = priceOptions(query);
  return tools
    .map((tool) => ({
      tool,
      score: scoreToolForSlot(tool, slot),
      price: priceForStack(tool, options),
    }))
    .filter((row) => row.score >= (slot.minScore ?? MIN_SCORE))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aCost = a.price.monthlyUsd;
      const bCost = b.price.monthlyUsd;
      if (aCost != null && bCost != null && aCost !== bCost) return aCost - bCost;
      if (aCost != null && bCost == null) return -1;
      if (aCost == null && bCost != null) return 1;
      return a.tool.name.localeCompare(b.tool.name);
    });
}

function canAutoPick(row: RankedTool, remaining: number): boolean {
  if (row.price.kind === 'unknown' || row.price.monthlyUsd == null) return false;
  return row.price.monthlyUsd <= remaining;
}

function fitsSwap(row: RankedTool, remaining: number): boolean {
  if (row.price.kind === 'unknown' || row.price.monthlyUsd == null) return false;
  return row.price.monthlyUsd <= remaining;
}

export function buildToolkit(tools: CatalogTool[], query: BudgetQuery): ToolkitResult {
  const slots = slotsForSelection(query.persona, query.goals, query.needs);
  const used = new Set<string>();
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  let remaining = query.budget;
  let monthlyTotal = 0;
  let hasUnknown = false;

  const ordered = [...slots].sort((a, b) => {
    const aMust = query.needs.includes(a.id) ? 0 : 1;
    const bMust = query.needs.includes(b.id) ? 0 : 1;
    return aMust - bMust;
  });

  const picked = new Map<string, RankedTool | null>();

  for (const slot of ordered) {
    const ranked = rankForSlot(tools, slot, query);
    const forcedSlug = query.picks[slot.id];
    if (forcedSlug) {
      const forcedTool = bySlug.get(forcedSlug);
      if (forcedTool) {
        const price = priceForStack(forcedTool, priceOptions(query));
        const row: RankedTool = {
          tool: forcedTool,
          score: scoreToolForSlot(forcedTool, slot),
          price,
        };
        picked.set(slot.id, row);
        used.add(forcedTool.slug);
        if (price.kind === 'unknown' || price.monthlyUsd == null) {
          hasUnknown = true;
        } else {
          monthlyTotal += price.monthlyUsd;
          remaining = Math.max(0, remaining - price.monthlyUsd);
        }
        continue;
      }
    }

    const choice = ranked.find((row) => !used.has(row.tool.slug) && canAutoPick(row, remaining)) || null;
    picked.set(slot.id, choice);
    if (choice) {
      used.add(choice.tool.slug);
      monthlyTotal += choice.price.monthlyUsd || 0;
      remaining = Math.max(0, remaining - (choice.price.monthlyUsd || 0));
    }
  }

  const results: ToolkitSlotResult[] = slots.map((slot) => {
    const pick = picked.get(slot.id) || null;
    const remainingForSwap = pick?.price.monthlyUsd != null
      ? remaining + pick.price.monthlyUsd
      : remaining;
    const ranked = rankForSlot(tools, slot, query);
    const alternatives = ranked
      .filter((row) => row.tool.slug !== pick?.tool.slug && !used.has(row.tool.slug) && fitsSwap(row, remainingForSwap))
      .slice(0, ALT_LIMIT);
    const freeAlternatives = ranked
      .filter((row) => row.tool.slug !== pick?.tool.slug && row.tool.has_free_tier)
      .slice(0, ALT_LIMIT);

    return {
      slot,
      pick,
      alternatives,
      freeAlternatives,
      mustHave: query.needs.includes(slot.id),
    };
  });

  const pickedSlugs = results.map((row) => row.pick?.tool.slug).filter(Boolean) as string[];
  const emptySlots = results.filter((row) => !row.pick).map((row) => row.slot.label);

  return {
    slots: results,
    monthlyTotal,
    hasUnknown,
    totalLabel: formatStackTotal(monthlyTotal, hasUnknown),
    pickedSlugs,
    emptySlots,
  };
}

export function starterToolkitForPersona(
  tools: CatalogTool[],
  personaSlug: string,
  options: { freeFirst?: boolean; budget?: number } = {}
): ToolkitResult {
  const persona = getPersona(personaSlug);
  return buildToolkit(tools, {
    persona: personaSlug,
    budget: options.budget ?? persona?.defaultBudget ?? 50,
    goals: persona?.goalIds || [],
    needs: [],
    freeFirst: Boolean(options.freeFirst),
    picks: {},
  });
}
