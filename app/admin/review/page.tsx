import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminActions } from './AdminActions';

// Server-side auth check
async function checkAdminAccess() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If Supabase is not configured, return null (will show config message)
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  // TODO: Implement real auth check using Supabase Auth
  // For now, return a placeholder that shows the page exists but needs config
  return null;
}

async function getDraftTools() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });
    
    return data || [];
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
}

export default async function AdminReviewPage() {
  const hasAccess = await checkAdminAccess();
  const drafts = await getDraftTools();
  
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return (
    <div id="main-content" className="scroll-mt-16 min-h-screen">
      <section className="section-spacing">
        <div className="container-max max-w-5xl">
          <div className="mb-8">
            <Link href="/" className="text-[#6C39EF] hover:underline focus-ring rounded mb-4 inline-block">
              ← Back to home
            </Link>
            <h1 className="heading-1 mb-2">Admin Review Queue</h1>
            <p className="text-[#5B657B]">
              Review and approve draft tools and submissions before publishing
            </p>
          </div>
          
          {!supabaseConfigured ? (
            // Show configuration message when Supabase is not set up
            <div className="card max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="heading-2 mb-4">Configure Supabase</h2>
              <p className="text-[#5B657B] mb-6">
                The admin review queue requires Supabase to be configured.
                Set the following environment variables to enable this feature:
              </p>
              <div className="bg-[#F9F8F5] rounded-lg p-4 text-left font-mono text-sm mb-6">
                <div>NEXT_PUBLIC_SUPABASE_URL=your-project-url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=your-service-key</div>
              </div>
              <p className="text-sm text-[#5B657B]">
                After configuration, draft tools and submissions will appear here for review.
              </p>
            </div>
          ) : hasAccess === null ? (
            // Show auth requirement when Supabase is configured but user not authenticated
            <div className="card max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="heading-2 mb-4">Authentication Required</h2>
              <p className="text-[#5B657B] mb-6">
                You must be logged in with an admin account to access this page.
              </p>
              <Link href="/" className="btn-primary">
                Go to home
              </Link>
            </div>
          ) : (
            // Show review queue when authenticated
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-[#5B657B]">
                    {drafts.length} items pending review
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm border-2 border-[#E5E1DC] rounded-lg hover:bg-[#F9F8F5] transition-colors">
                    Filters
                  </button>
                  <Link href="/admin/settings" className="px-4 py-2 text-sm border-2 border-[#E5E1DC] rounded-lg hover:bg-[#F9F8F5] transition-colors">
                    Settings
                  </Link>
                </div>
              </div>
              
              {drafts.length === 0 ? (
                <div className="card text-center py-16">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="heading-3 mb-2">No items to review</h2>
                  <p className="text-[#5B657B]">
                    All submissions and imports have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((tool: any) => (
                    <div key={tool.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{tool.name}</h3>
                            <span className="badge badge-sponsored text-xs">DRAFT</span>
                            {tool.import_source && (
                              <span className="text-xs text-[#5B657B]">
                                from {tool.import_source}
                              </span>
                            )}
                          </div>
                          <p className="text-[#5B657B] mb-3">{tool.tagline || tool.description}</p>
                          <div className="flex items-center gap-4 text-sm text-[#5B657B]">
                            <a
                              href={tool.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6C39EF] hover:underline"
                            >
                              Visit website →
                            </a>
                            {tool.created_at && (
                              <span>
                                Submitted {new Date(tool.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <AdminActions tool={tool} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
