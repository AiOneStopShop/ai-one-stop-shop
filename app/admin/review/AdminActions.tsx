'use client';

import { useState } from 'react';
import { approveTool, rejectTool } from './actions';

export function AdminActions({ tool }: { tool: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleApprove() {
    setLoading(true);
    setMessage('');
    
    const result = await approveTool(tool.id);
    
    if (result.success) {
      setMessage('Approved.');
      setTimeout(() => window.location.reload(), 2500);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setLoading(false);
  }

  async function handleReject() {
    if (!confirm(`Reject "${tool.name}"?`)) return;
    
    setLoading(true);
    setMessage('');
    
    const result = await rejectTool(tool.id);
    
    if (result.success) {
      setMessage('Rejected.');
      setTimeout(() => window.location.reload(), 2500);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-[#5A2FD0] transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Approve'}
          <span className="sr-only"> {tool.name}</span>
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 border-2 border-line text-soft font-medium rounded-lg hover:bg-cream transition-colors disabled:opacity-50"
        >
          Reject
          <span className="sr-only"> {tool.name}</span>
        </button>
      </div>
      {message && (
        <div className="mt-2 text-sm" role="status" aria-live="polite">{message}</div>
      )}
    </div>
  );
}
