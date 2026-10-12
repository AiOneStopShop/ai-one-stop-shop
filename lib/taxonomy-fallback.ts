import { fallbackCategories } from '@/lib/fallback-data';
import { classifyTool, TAXONOMY } from '@/lib/taxonomy';

const TAXONOMY_CATEGORIES = TAXONOMY.map((category, index) => ({
  id: `tax-${category.slug}`,
  slug: category.slug,
  name: category.name,
  icon: category.icon,
  description: category.description,
  sort_order: category.sort_order,
  created_at: '2026-10-12T00:00:00Z',
  updated_at: '2026-10-12T00:00:00Z',
  _index: index,
}));

export function taxonomyFallbackCategories() {
  return TAXONOMY_CATEGORIES.map(({ _index, ...category }) => category);
}

export function applyFallbackTaxonomy<T extends Record<string, any>>(tool: T): T {
  const { slugs, primary } = classifyTool(tool);
  const categories = TAXONOMY_CATEGORIES.filter((category) => slugs.includes(category.slug as any));
  return {
    ...tool,
    tool_categories: categories.map((category) => ({
      category_id: category.id,
      is_primary: category.slug === primary,
      categories: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        description: category.description,
        sort_order: category.sort_order,
        created_at: category.created_at,
        updated_at: category.updated_at,
      },
    })),
  };
}

export function fallbackCategoryBySlug(slug: string) {
  return taxonomyFallbackCategories().find((category) => category.slug === slug)
    || fallbackCategories.find((category) => category.slug === slug)
    || null;
}
