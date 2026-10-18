/** Recent searches are kept only in this browser's localStorage. Nothing is sent to the server. */
const KEY = 'aios:recent-searches';
const MAX = 5;

export function readRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): string[] {
  const q = query.trim().slice(0, 100);
  if (!q || typeof window === 'undefined') return readRecentSearches();
  const next = [q, ...readRecentSearches().filter((v) => v.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or blocked */ }
  return next;
}

export function removeRecentSearch(query: string): string[] {
  const next = readRecentSearches().filter((v) => v !== query);
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export function clearRecentSearches(): void {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
