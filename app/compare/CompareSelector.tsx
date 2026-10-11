'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Tool {
  slug: string;
  name: string;
}

export function CompareSelector({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(['', '', '']);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill from URL params or localStorage
    const urlTools = searchParams.get('tools')?.split(',').filter(Boolean) || [];
    const storageTools = (() => {
      try {
        const stored = localStorage.getItem('compareList');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    const initial = [...urlTools];
    // Add from localStorage if not already present
    storageTools.forEach((slug: string) => {
      if (!initial.includes(slug) && initial.length < 3) {
        initial.push(slug);
      }
    });

    // Pad to 3 slots
    while (initial.length < 3) {
      initial.push('');
    }

    setSelectedSlugs(initial.slice(0, 3));
  }, [searchParams]);

  const handleSlotChange = (index: number, slug: string) => {
    const newSlugs = [...selectedSlugs];
    newSlugs[index] = slug;
    setSelectedSlugs(newSlugs);
    setError('');
  };

  const handleCompare = () => {
    const filled = selectedSlugs.filter(Boolean);
    
    if (filled.length < 2) {
      setError('Please select at least 2 tools to compare');
      return;
    }

    router.push(`/compare?tools=${filled.join(',')}`);
  };

  const selectedCount = selectedSlugs.filter(Boolean).length;

  return (
    <div className="bg-white border border-[#E5E1DC] rounded-lg p-6">
      <h2 className="heading-3 mb-4">Select tools to compare</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {selectedCount} {selectedCount === 1 ? 'tool' : 'tools'} selected
      </div>

      <div className="space-y-4 mb-6">
        {selectedSlugs.map((slug, index) => (
          <div key={index}>
            <label htmlFor={`tool-${index}`} className="block text-sm font-medium text-[#171C26] mb-2">
              Tool {index + 1} {index === 0 && <span className="text-[#5B657B]">(required)</span>}
            </label>
            <select
              id={`tool-${index}`}
              value={slug}
              onChange={(e) => handleSlotChange(index, e.target.value)}
              className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
              aria-label={`Select tool ${index + 1}`}
            >
              <option value="">Select a tool...</option>
              {tools.map((tool) => (
                <option 
                  key={tool.slug} 
                  value={tool.slug}
                  disabled={selectedSlugs.includes(tool.slug) && slug !== tool.slug}
                >
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleCompare}
        className="btn-primary w-full"
      >
        Compare Selected Tools
      </button>
    </div>
  );
}
