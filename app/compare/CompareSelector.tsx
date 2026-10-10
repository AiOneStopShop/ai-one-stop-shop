'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Tool {
  slug: string;
  name: string;
}

interface CompareSelectorProps {
  tools: Tool[];
}

export function CompareSelector({ tools }: CompareSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSlugs = searchParams.get('tools')?.split(',').filter(Boolean) || [];
  
  const [slot1, setSlot1] = useState(currentSlugs[0] || '');
  const [slot2, setSlot2] = useState(currentSlugs[1] || '');
  const [slot3, setSlot3] = useState(currentSlugs[2] || '');

  const handleCompare = () => {
    const selectedSlugs = [slot1, slot2, slot3].filter(Boolean);
    
    if (selectedSlugs.length < 2) {
      alert('Please select at least 2 tools to compare');
      return;
    }
    
    router.push(`/compare?tools=${selectedSlugs.join(',')}`);
  };

  return (
    <div className="card mb-8">
      <h2 className="heading-3 mb-4">Select Tools to Compare</h2>
      <p className="text-[#5B657B] mb-6">
        Choose 2-3 tools to compare side-by-side
      </p>
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div>
          <label htmlFor="tool-1" className="block text-sm font-medium text-[#171C26] mb-2">
            Tool 1
          </label>
          <select
            id="tool-1"
            value={slot1}
            onChange={(e) => setSlot1(e.target.value)}
            className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
          >
            <option value="">Select a tool...</option>
            {tools.map((tool) => (
              <option 
                key={tool.slug} 
                value={tool.slug}
                disabled={tool.slug === slot2 || tool.slug === slot3}
              >
                {tool.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tool-2" className="block text-sm font-medium text-[#171C26] mb-2">
            Tool 2
          </label>
          <select
            id="tool-2"
            value={slot2}
            onChange={(e) => setSlot2(e.target.value)}
            className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
          >
            <option value="">Select a tool...</option>
            {tools.map((tool) => (
              <option 
                key={tool.slug} 
                value={tool.slug}
                disabled={tool.slug === slot1 || tool.slug === slot3}
              >
                {tool.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tool-3" className="block text-sm font-medium text-[#171C26] mb-2">
            Tool 3 (Optional)
          </label>
          <select
            id="tool-3"
            value={slot3}
            onChange={(e) => setSlot3(e.target.value)}
            className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
          >
            <option value="">Select a tool...</option>
            {tools.map((tool) => (
              <option 
                key={tool.slug} 
                value={tool.slug}
                disabled={tool.slug === slot1 || tool.slug === slot2}
              >
                {tool.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        className="btn-primary w-full md:w-auto"
        disabled={!slot1 || !slot2}
      >
        Compare Selected Tools
      </button>
    </div>
  );
}
