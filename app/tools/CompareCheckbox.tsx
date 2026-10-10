'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MAX_COMPARE = 3;

export function CompareCheckbox({ toolSlug }: { toolSlug: string }) {
  const [selected, setSelected] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('compareList');
    const list = stored ? JSON.parse(stored) : [];
    setCompareList(list);
    setSelected(list.includes(toolSlug));
  }, [toolSlug]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    let newList: string[];

    if (checked) {
      if (compareList.length >= MAX_COMPARE) {
        alert(`You can only compare up to ${MAX_COMPARE} tools at once`);
        return;
      }
      newList = [...compareList, toolSlug];
    } else {
      newList = compareList.filter(s => s !== toolSlug);
    }

    setCompareList(newList);
    setSelected(checked);
    localStorage.setItem('compareList', JSON.stringify(newList));
    
    // Dispatch event for sticky button
    window.dispatchEvent(new CustomEvent('compareListChanged', { detail: newList }));
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={selected}
        onChange={handleToggle}
        className="w-4 h-4 rounded border-[#5B657B] text-[#6C39EF] focus:ring-2 focus:ring-[#6C39EF] focus:ring-offset-2"
        aria-label={`Compare ${toolSlug}`}
      />
      <span className="text-sm text-[#5B657B]">Compare</span>
    </label>
  );
}

export function StickyCompareButton() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem('compareList');
      const list = stored ? JSON.parse(stored) : [];
      setCount(list.length);
    };

    updateCount();
    window.addEventListener('compareListChanged', updateCount);
    
    return () => window.removeEventListener('compareListChanged', updateCount);
  }, []);

  const handleCompare = () => {
    const stored = localStorage.getItem('compareList');
    const list = stored ? JSON.parse(stored) : [];
    
    if (list.length < 2) {
      alert('Please select at least 2 tools to compare');
      return;
    }
    
    router.push(`/compare?tools=${list.join(',')}`);
  };

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleCompare}
        className="btn-primary shadow-lg flex items-center gap-2"
        aria-label={`Compare ${count} selected tools`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        Compare ({count})
      </button>
    </div>
  );
}
