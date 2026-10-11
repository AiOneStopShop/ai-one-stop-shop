'use client';

import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { Search } from 'lucide-react';

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
  const isControlled = typeof onQueryChange === 'function';
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target
        && (target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.tagName === 'SELECT'
          || target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);

  return (
    <form
      role="search"
      action="/tools"
      method="get"
      onSubmit={onSearchSubmit}
      className={className}
    >
      <label htmlFor={id} className="block text-sm font-medium text-[#171C26] mb-2">
        Search tools
        {shortcut ? (
          <span className="ml-2 font-normal text-[#5B657B]">
            <kbd className="rounded border border-[#E5E1DC] bg-white px-1.5 py-0.5 text-xs">/</kbd>
            {' '}to focus
          </span>
        ) : null}
      </label>
      <div className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5B657B]" aria-hidden="true" />
          <input
            ref={inputRef}
            id={id}
            type="search"
            name="q"
            placeholder="Search tools by name, job, or category..."
            autoComplete="off"
            enterKeyHint="search"
            inputMode="search"
            maxLength={100}
            className="w-full pl-10 pr-4 py-3 text-base border border-[#5B657B] rounded-lg focus-ring bg-white min-h-11"
            {...(isControlled
              ? { value: value ?? '', onChange: (event) => onQueryChange(event.target.value) }
              : { defaultValue })}
          />
        </div>
        <button type="submit" className="btn-primary shrink-0 w-full sm:w-auto">
          {submitLabel}
        </button>
      </div>
      {children}
    </form>
  );
}
