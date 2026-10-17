'use client';

import type { SponsorIntake } from '@/types/database';

interface SponsorIntakeListProps {
  records: SponsorIntake[];
}

export function SponsorIntakeList({ records }: SponsorIntakeListProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPackageLabel = (pkg: string) => {
    const labels: Record<string, string> = {
      featured_tool: 'Featured Tool ($39)',
      category_spotlight: 'Category Spotlight ($69)',
      newsletter: 'Newsletter ($29)',
      founding_bundle: 'Founding Bundle ($99)',
      request: 'Request Only',
    };
    return labels[pkg] || pkg;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="heading-3 mb-1">{record.tool_name}</h3>
              <p className="text-sm text-[#5B657B]">
                {record.company_name} · {record.contact_name}
              </p>
            </div>
            <span className={`badge ${getStatusBadge(record.status)} text-sm px-3 py-1`}>
              {record.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-[#5B657B] mb-1"><strong>Email:</strong></p>
              <a 
                href={`mailto:${record.contact_email}`} 
                className="text-[#6C39EF] hover:underline focus-ring rounded"
              >
                {record.contact_email}
              </a>
            </div>

            <div>
              <p className="text-[#5B657B] mb-1"><strong>Package:</strong></p>
              <p>{getPackageLabel(record.package)}</p>
            </div>

            <div>
              <p className="text-[#5B657B] mb-1"><strong>Tool URL:</strong></p>
              <a 
                href={record.tool_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#6C39EF] hover:underline focus-ring rounded"
              >
                {record.tool_url}
              </a>
            </div>

            {record.preferred_start_date && (
              <div>
                <p className="text-[#5B657B] mb-1"><strong>Preferred start:</strong></p>
                <p>{new Date(record.preferred_start_date).toLocaleDateString()}</p>
              </div>
            )}

            {record.category_slug && (
              <div>
                <p className="text-[#5B657B] mb-1"><strong>Category:</strong></p>
                <p>{record.category_slug}</p>
              </div>
            )}

            {record.destination_url && (
              <div>
                <p className="text-[#5B657B] mb-1"><strong>Destination URL:</strong></p>
                <a 
                  href={record.destination_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#6C39EF] hover:underline focus-ring rounded"
                >
                  {record.destination_url}
                </a>
              </div>
            )}
          </div>

          {record.blurb && (
            <div className="mb-4 p-4 bg-[#F9F8F5] rounded">
              <p className="text-sm text-[#5B657B] mb-1"><strong>Blurb:</strong></p>
              <p className="text-sm">{record.blurb}</p>
            </div>
          )}

          {(record.logo_url || record.logo_file_path) && (
            <div className="mb-4">
              <p className="text-sm text-[#5B657B] mb-1"><strong>Logo:</strong></p>
              {record.logo_url && (
                <p className="text-sm">
                  URL:{' '}
                  <a 
                    href={record.logo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#6C39EF] hover:underline focus-ring rounded"
                  >
                    {record.logo_url}
                  </a>
                </p>
              )}
              {record.logo_file_path && (
                <p className="text-sm text-[#5B657B]">
                  File: {record.logo_file_path}
                </p>
              )}
            </div>
          )}

          {record.targets_children && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-900">
                <strong>⚠️ Targets children under 13</strong> – Auto-decline
              </p>
            </div>
          )}

          {record.decline_reason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-[#5B657B]"><strong>Decline reason:</strong></p>
              <p className="text-sm">{record.decline_reason}</p>
            </div>
          )}

          {record.notes && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-[#5B657B]"><strong>Internal notes:</strong></p>
              <p className="text-sm">{record.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E1DC]">
            <p className="text-xs text-[#5B657B]">
              Submitted: {formatDate(record.submitted_at)}
              {record.reviewed_at && ` · Reviewed: ${formatDate(record.reviewed_at)}`}
            </p>
            
            {record.status === 'pending_review' && (
              <div className="flex gap-2">
                <button 
                  className="btn-secondary text-sm"
                  onClick={() => alert('Approve functionality coming soon. For now, update directly in Supabase.')}
                >
                  Approve
                </button>
                <button 
                  className="btn-secondary text-sm"
                  onClick={() => alert('Decline functionality coming soon. For now, update directly in Supabase.')}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
