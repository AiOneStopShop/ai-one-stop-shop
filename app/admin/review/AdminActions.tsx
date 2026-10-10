'use client';

import { useState } from 'react';
import { approveTool, rejectTool } from './actions';

export function AdminActions({ tool }: { tool: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleApprove() {
    setLoading(true);
    setMessage('');
    
    const result = await approveTool(tool.id, tool);
    
    if (result.success) {
      setMessage('✅ Approved!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    
    setLoading(false);
  }

  async function handleReject() {
    if (!confirm(`Reject "${tool.name}"?`)) return;
    
    setLoading(true);
    setMessage('');
    
    const result = await rejectTool(tool.id, tool);
    
    if (result.success) {
      setMessage('✅ Rejected');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 bg-[#6C39EF] text-white font-medium rounded-lg hover:bg-[#5A2FD0] transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 border-2 border-[#E5E1DC] text-[#5B657B] font-medium rounded-lg hover:bg-[#F9F8F5] transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {message && (
        <div className="mt-2 text-sm">{message}</div>
      )}
    </div>
  );
}
