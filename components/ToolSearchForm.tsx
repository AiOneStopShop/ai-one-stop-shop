'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, X } from 'lucide-react';
import { addRecentSearch, clearRecentSearches, readRecentSearches, removeRecentSearch } from '@/lib/recent-searches';

type ToolSearchFormProps = {
  id?: string;
  defaultValue?: string;
  value?: string;
  onQueryChange?: (value: string) => void;
  onSearchSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
  submitLabel?: string;
  shortcut?: boolean;
  children?: ReactNode;
};

type Suggestion = { slug: string; name: string; tagline: string };
type Item =
  | { kind: 'tool'; key: string; slug: string; name: string; tagline: string }
  | { kind: 'search'; key: string; query: string }
  | { kind: 'recent'; key: string; query: string };

const SUGGEST_DEBOUNCE_MS = 150;
const MIN_SUGGEST_CHARS = 2;

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable));
}

export function ToolSearchForm({
  id = 'tool-search',
  defaultValue = '',
  value,
  onQueryChange,
  onSearchSubmit,
  className = '',
  submitLabel = 'Search',
  shortcut = true,
  children,
}: ToolSearchFormProps) {
  const router = useRouter();
  const isControlled = typeof onQueryChange === 'function';
  const [localText, setLocalText] = useState(defaultValue);
  const text = isControlled ? (value ?? '') : localText;
  const setText = useCallback((next: string) => {
    if (isControlled) onQueryChange?.(next);
    else setLocalText(next);
  }, [isControlled, onQueryChange]);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const listId = `${useId().replace(/:/g, '')}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestQuery, setSuggestQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const trimmed = text.trim();
  const showSuggestions = trimmed.length >= MIN_SUGGEST_CHARS;

  const items: Item[] = showSuggestions
    ? [
      ...(suggestQuery === trimmed.toLowerCase() || suggestQuery === trimmed
        ? suggestions.map((s) => ({ kind: 'tool' as const, key: `tool-${s.slug}`, ...s }))
        : []),
      { kind: 'search' as const, key: 'search', query: trimmed },
    ]
    : recent.map((q) => ({ kind: 'recent' as const, key: `recent-${q}`, query: q }));
  const listVisible = open && items.length > 0;

  // Keyboard shortcuts: "/" (when enabled) and Cmd/Ctrl-K always focus the search box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const cmdK = (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k';
      const slash = shortcut && event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target);
      if (!cmdK && !slash) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);

  // Arriving via the global Cmd/Ctrl-K shortcut (/tools#search) focuses the box.
  useEffect(() => {
    if (window.location.hash === '#search') inputRef.current?.focus();
  }, []);

  // Fetch suggestions while typing (debounced, cancellable).
  useEffect(() => {
    if (!open || !showSuggestions) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json() as { q?: string; suggestions?: Suggestion[] };
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setSuggestQuery(trimmed.toLowerCase());
      } catch {
        /* aborted or offline: keep the plain "Search for" option */
      }
    }, SUGGEST_DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed, open, showSuggestions]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const openList = () => {
    setRecent(readRecentSearches());
    setOpen(true);
  };

  const submitQuery = (query: string) => {
    setText(query);
    close();
    // Let React commit the new value before the native submit reads the input.
    window.setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  const selectItem = (item: Item) => {
    if (item.kind === 'tool') {
      if (trimmed) setRecent(addRecentSearch(trimmed));
      close();
      router.push(`/tools/${item.slug}`);
      return;
    }
    submitQuery(item.query);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const composing = composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229;
    if (composing) {
      if (event.key === 'Enter') event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) { openList(); setActiveIndex(items.length ? 0 : -1); return; }
        if (items.length) setActiveIndex((i) => (i + 1) % items.length);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) { openList(); return; }
        if (items.length) setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
        return;
      case 'Enter':
        if (listVisible && activeIndex >= 0 && items[activeIndex]) {
          event.preventDefault();
          selectItem(items[activeIndex]);
        }
        return; // otherwise the form submits natively
      case 'Escape':
        if (listVisible) {
          event.preventDefault();
          close();
        } else if (text) {
          event.preventDefault();
          setText('');
        }
        return;
      case 'Tab':
        close();
        return;
      default:
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (composingRef.current) {
      event.preventDefault();
      return;
    }
    const raw = inputRef.current?.value ?? '';
    if (!raw.trim()) {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }
    if (inputRef.current && raw !== raw.trim() && !isControlled) {
      inputRef.current.value = raw.trim();
    }
    setRecent(addRecentSearch(raw.trim()));
    close();
    onSearchSubmit?.(event);
  };

  const activeId = listVisible && activeIndex >= 0 && items[activeIndex] ? `${listId}-${activeIndex}` : undefined;
  const toolCount = items.filter((item) => item.kind === 'tool').length;

  return (
    <form
      ref={formRef}
      role="search"
      action="/tools"
      method="get"
      onSubmit={handleSubmit}
      className={className}
    >
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-2">
        Search tools
        <span className="ml-2 font-normal text-soft hidden sm:inline">
          {shortcut ? (
            <>
              <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-xs">/</kbd>
              {' or '}
            </>
          ) : null}
          <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-xs">Ctrl/⌘</kbd>
          {' '}
          <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-xs">K</kbd>
          {' '}to focus
        </span>
      </label>
      <div className="relative flex flex-col sm:flex-row gap-2">
        <div
          className="relative flex-1"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
          }}
        >
          <Search className="absolute left-3 top-[1.4rem] -translate-y-1/2 h-5 w-5 text-soft pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            id={id}
            type="search"
            name="q"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={listVisible}
            aria-controls={listId}
            aria-activedescendant={activeId}
            data-tool-search-input=""
            placeholder="Search tools by name, job, or category..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            inputMode="search"
            maxLength={100}
            className="w-full pl-10 pr-4 py-3 text-base border border-soft rounded-xl focus-ring bg-white min-h-11"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={openList}
            onClick={() => { if (!open) openList(); }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
          />
          <ul
            id={listId}
            role="listbox"
            aria-label={showSuggestions ? 'Search suggestions' : 'Recent searches'}
            hidden={!listVisible}
            className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[60vh] overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg"
          >
            {!showSuggestions && items.length > 0 ? (
              <li role="presentation" className="flex items-center justify-between px-3 py-1.5 text-xs text-soft">
                <span>Recent searches (saved only on this device)</span>
                <button
                  type="button"
                  tabIndex={-1}
                  className="underline hover:text-ink"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => { clearRecentSearches(); setRecent([]); }}
                >
                  Clear
                </button>
              </li>
            ) : null}
            {items.map((item, index) => (
              <li
                key={item.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-left ${index === activeIndex ? 'bg-[#F3E9D4]' : 'hover:bg-[#FBF4E6]'}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectItem(item)}
              >
                {item.kind === 'tool' ? (
                  <span className="min-w-0">
                    <span className="block font-medium text-ink truncate">{item.name}</span>
                    {item.tagline ? <span className="block text-sm text-soft truncate">{item.tagline}</span> : null}
                  </span>
                ) : item.kind === 'search' ? (
                  <>
                    <Search className="h-4 w-4 shrink-0 text-soft" aria-hidden="true" />
                    <span className="truncate">Search for &ldquo;{item.query}&rdquo;</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 shrink-0 text-soft" aria-hidden="true" />
                    <span className="flex-1 truncate">{item.query}</span>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${item.query} from recent searches`}
                      className="rounded p-1 text-soft hover:text-ink"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => { event.stopPropagation(); setRecent(removeRecentSearch(item.query)); }}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite">
            {listVisible && showSuggestions ? `${toolCount} ${toolCount === 1 ? 'suggestion' : 'suggestions'} available. Use up and down arrows to choose.` : ''}
          </p>
        </div>
        <button type="submit" className="btn-primary shrink-0 w-full sm:w-auto self-start">
          {submitLabel}
        </button>
      </div>
      {children}
    </form>
  );
}
