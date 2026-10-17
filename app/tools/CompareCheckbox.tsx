'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MAX_COMPARE = 3;

function readCompareList(): string[] {
  try {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function countLabel(count: number): string {
  if (count === 1) return '1 tool selected';
  return `${count} tools selected`;
}

export function CompareCheckbox({ toolSlug, toolName }: { toolSlug: string; toolName: string }) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      setSelected(readCompareList().includes(toolSlug));
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    window.addEventListener('compareListChanged', updateFromStorage);

    return () => {
      window.removeEventListener('storage', updateFromStorage);
      window.removeEventListener('compareListChanged', updateFromStorage);
    };
  }, [toolSlug]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const currentList = readCompareList();
    let newList: string[];

    if (checked) {
      if (currentList.length >= MAX_COMPARE) {
        window.dispatchEvent(new CustomEvent('compareAnnounce', {
          detail: `Can't add more than ${MAX_COMPARE} tools`,
        }));
        return;
      }
      newList = currentList.includes(toolSlug) ? currentList : [...currentList, toolSlug];
    } else {
      newList = currentList.filter(s => s !== toolSlug);
    }

    localStorage.setItem('compareList', JSON.stringify(newList));
    setSelected(newList.includes(toolSlug));
    window.dispatchEvent(new CustomEvent('compareListChanged', { detail: newList }));
    window.dispatchEvent(new CustomEvent('compareAnnounce', { detail: countLabel(newList.length) }));
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer min-h-11">
      <input
        type="checkbox"
        checked={selected}
        onChange={handleToggle}
        className="w-6 h-6 rounded border-[#5B657B] text-[#6C39EF] focus:ring-2 focus:ring-[#6C39EF] focus:ring-offset-2"
      />
      <span className="text-sm text-[#5B657B]">
        Compare<span className="sr-only"> {toolName}</span>
      </span>
    </label>
  );
}

function useCompareCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCount(readCompareList().length);
    updateCount();
    window.addEventListener('compareListChanged', updateCount);
    return () => window.removeEventListener('compareListChanged', updateCount);
  }, []);

  return count;
}

export function CompareSelectedButton({ sticky = false }: { sticky?: boolean }) {
  const count = useCompareCount();
  const router = useRouter();

  const handleCompare = () => {
    const list = readCompareList();
    if (list.length < 2) {
      window.dispatchEvent(new CustomEvent('compareAnnounce', {
        detail: 'Select at least 2 tools to compare',
      }));
      return;
    }
    router.push(`/compare?tools=${list.join(',')}`);
  };

  if (count === 0) return null;

  const button = (
    <button
      type="button"
      onClick={handleCompare}
      className="btn-primary shadow-lg flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
      {sticky ? `Compare (${count})` : `Compare selected (${count})`}
    </button>
  );

  if (sticky) {
    return <div className="sticky-compare-btn fixed right-6 z-[60] bottom-6">{button}</div>;
  }

  return button;
}

export function StickyCompareButton() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    const onAnnounce = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setStatus(detail);
    };
    window.addEventListener('compareAnnounce', onAnnounce);
    return () => window.removeEventListener('compareAnnounce', onAnnounce);
  }, []);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </div>
      <CompareSelectedButton sticky />
    </>
  );
}
