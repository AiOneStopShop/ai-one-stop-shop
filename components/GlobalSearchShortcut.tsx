'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Cmd/Ctrl-K on pages without a search box opens /tools with the search focused.
 * Pages that render ToolSearchForm handle the shortcut themselves.
 */
export function GlobalSearchShortcut() {
  const router = useRouter();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      if (document.querySelector('[data-tool-search-input]')) return;
      event.preventDefault();
      router.push('/tools#search');
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);
  return null;
}
