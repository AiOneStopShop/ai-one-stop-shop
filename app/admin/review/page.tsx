import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SubmissionReviewActions } from './SubmissionReviewActions';

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

async function getHeldTools() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data } = await supabase
    .from('tools')
    .select('id, name, slug, tagline, website_url, status, review_notes, created_at, pricing_summary')
    .eq('status', 'needs_review')
    .order('updated_at', { ascending: false });

  return data || [];
}

async function getDrafts() {
  // Use service_role to bypass RLS
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  return data || [];
}

async function getSubmissions() {
  // Use service_role to bypass RLS and see all submissions
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  
  const { data } = await supabase
    .from('tool_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });

  return data || [];
}

export default async function AdminReviewPage() {
  await checkAuth();
  
  const [drafts, submissions, held] = await Promise.all([
    getDrafts(),
    getSubmissions(),
    getHeldTools(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-white">
        <div className="container-max py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">✨</span>
              <span className="font-fraunces font-bold text-lg text-ink">
                AI One Stop Shop
              </span>
            </Link>
            <span className="text-soft" aria-hidden="true">/</span>
            <h1 className="font-fraunces font-semibold text-lg text-ink">
              Admin Review
            </h1>
          </div>
          <nav aria-label="Admin">
            <Link href="/" className="text-sm text-green hover:underline">
              View Site <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container-max py-12">
        {/* Submissions Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6">
            Pending Submissions ({submissions.length})
          </h2>
          
          {submissions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-soft">No pending submissions</p>
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
                        className="text-sm text-green hover:underline"
                      >
                        {submission.website_url}
                        <span className="sr-only"> (opens in new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </div>
                    <span className="badge bg-amber-50 text-yellow-700 border border-amber-200">
                      Pending
                    </span>
                  </div>
                  
                  {submission.description && (
                    <p className="text-soft mb-4">{submission.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    <div className="text-sm text-soft">
                      <p>Contact: {submission.contact_email}</p>
                      <p>Submitted: {new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <SubmissionReviewActions
                      submissionId={submission.id}
                      toolName={submission.tool_name}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="heading-2 mb-6">
            Held for review ({held.length})
          </h2>
          {held.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-soft">No tools on hold</p>
            </div>
          ) : (
            <div className="space-y-4">
              {held.map((tool: any) => (
                <div key={tool.id} className="card">
                  <h3 className="heading-3 mb-2">{tool.name}</h3>
                  {tool.tagline && <p className="text-soft mb-3">{tool.tagline}</p>}
                  <form
                    action={async (formData) => {
                      'use server';
                      const { saveReviewNotes } = await import('./actions');
                      await saveReviewNotes(tool.id, String(formData.get('review_notes') || ''));
                    }}
                    className="space-y-3"
                  >
                    <label htmlFor={`notes-${tool.id}`} className="block text-sm font-medium">
                      Hold reason (admin only)
                    </label>
                    <textarea
                      id={`notes-${tool.id}`}
                      name="review_notes"
                      defaultValue={tool.review_notes || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-soft rounded-lg focus-ring bg-white"
                    />
                    <button type="submit" className="btn-secondary">Save notes</button>
                  </form>
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
              <p className="text-soft">No draft tools</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((tool: any) => (
                <div key={tool.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="heading-3 mb-2">{tool.name}</h3>
                      {tool.tagline && (
                        <p className="text-soft mb-2">{tool.tagline}</p>
                      )}
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green hover:underline"
                      >
                        {tool.website_url}
                        <span className="sr-only"> (opens in new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </div>
                    <span className="badge bg-cream-2 text-soft border border-line">
                      Draft
                    </span>
                  </div>
                  
                  {tool.description && (
                    <p className="text-soft mb-4">{tool.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    <div className="text-sm text-soft">
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
                          className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green transition-colors text-sm font-medium"
                        >
                          Publish
                          <span className="sr-only"> {tool.name}</span>
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
                          <span className="sr-only"> {tool.name}</span>
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
