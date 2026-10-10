import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getServerSupabase() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

async function checkAuth() {
  const supabase = await getServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/admin/login');
  }

  return { user, profile };
}

async function getDrafts() {
  const supabase = await getServerSupabase();
  
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  return data || [];
}

async function getSubmissions() {
  const supabase = await getServerSupabase();
  
  const { data } = await supabase
    .from('tool_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function AdminReviewPage() {
  await checkAuth();
  
  const [drafts, submissions] = await Promise.all([
    getDrafts(),
    getSubmissions(),
  ]);

  return (
    <div className="min-h-screen bg-[#F9F8F5]">
      <div className="border-b border-[#E5E1DC] bg-white">
        <div className="container-max py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-dm-sans font-bold text-lg text-[#171C26]">
                AI One Stop Shop
              </span>
            </Link>
            <span className="text-[#5B657B]">/</span>
            <h1 className="font-dm-sans font-semibold text-lg text-[#171C26]">
              Admin Review
            </h1>
          </div>
          <Link href="/" className="text-sm text-[#6C39EF] hover:underline">
            View Site →
          </Link>
        </div>
      </div>

      <div className="container-max py-12">
        {/* Submissions Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6">
            Pending Submissions ({submissions.length})
          </h2>
          
          {submissions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-[#5B657B]">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="heading-3 mb-2">{submission.tool_name}</h3>
                      <a
                        href={submission.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#6C39EF] hover:underline"
                      >
                        {submission.website_url} ↗
                      </a>
                    </div>
                    <span className="badge bg-yellow-50 text-yellow-700 border border-yellow-200">
                      Pending
                    </span>
                  </div>
                  
                  {submission.description && (
                    <p className="text-[#5B657B] mb-4">{submission.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#E5E1DC]">
                    <div className="text-sm text-[#5B657B]">
                      <p>Contact: {submission.contact_email}</p>
                      <p>Submitted: {new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <form action="/admin/review/approve-submission" method="POST">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Approve & Create Draft
                        </button>
                      </form>
                      <form action="/admin/review/reject-submission" method="POST">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Drafts Section */}
        <section>
          <h2 className="heading-2 mb-6">
            Draft Tools ({drafts.length})
          </h2>
          
          {drafts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-[#5B657B]">No draft tools</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((tool: any) => (
                <div key={tool.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="heading-3 mb-2">{tool.name}</h3>
                      {tool.tagline && (
                        <p className="text-[#5B657B] mb-2">{tool.tagline}</p>
                      )}
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#6C39EF] hover:underline"
                      >
                        {tool.website_url} ↗
                      </a>
                    </div>
                    <span className="badge bg-gray-100 text-gray-700 border border-gray-200">
                      Draft
                    </span>
                  </div>
                  
                  {tool.description && (
                    <p className="text-[#5B657B] mb-4">{tool.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#E5E1DC]">
                    <div className="text-sm text-[#5B657B]">
                      <p>Created: {new Date(tool.created_at).toLocaleDateString()}</p>
                      {tool.pricing_summary && <p>Pricing: {tool.pricing_summary}</p>}
                    </div>
                    
                    <div className="flex gap-2">
                      <form action={async () => {
                        'use server';
                        const { approveTool } = await import('./actions');
                        await approveTool(tool.id);
                      }}>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Publish
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        const { rejectTool } = await import('./actions');
                        await rejectTool(tool.id);
                      }}>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
