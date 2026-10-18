import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { SponsorIntakeList } from './SponsorIntakeList';

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
  // Without a database there is no one to sign in; send people to the login page, which explains that.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/admin/login?next=/admin/sponsors');
  }
  const supabase = await getServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/admin/login?next=/admin/sponsors');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/admin/login?next=/admin/sponsors');
  }

  return user;
}

export default async function AdminSponsorsPage() {
  await checkAuth();

  // Fetch sponsor intake records
  const serviceSupabase = getServiceSupabase();
  const { data: intakeRecords, error } = await serviceSupabase
    .from('sponsor_intake')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching sponsor intake:', error);
  }

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">Sponsor Management</h1>
              <p className="text-soft">
                Review sponsor and partner requests
              </p>
            </div>
            <Link href="/admin/review" className="btn-secondary">
              Back to admin
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> Approve and Decline update the request status. Payment marking and placement creation are still done by hand.
            </p>
          </div>

          {intakeRecords && intakeRecords.length > 0 ? (
            <SponsorIntakeList records={intakeRecords} />
          ) : (
            <div className="card text-center py-12">
              <p className="text-lg text-soft mb-4">No sponsor requests yet</p>
              <Link href="/advertise" className="text-green hover:underline focus-ring rounded">
                View sponsorship page
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
