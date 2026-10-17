export function knownSlugsInOrder(
  requested: string[],
  catalog: Array<{ slug: string }>
): string[] {
  const known = new Set(catalog.map((tool) => tool.slug));
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const slug of requested) {
    if (!slug || !known.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }

  return ordered;
}

export function orderBySlug<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is T => Boolean(item));
}
