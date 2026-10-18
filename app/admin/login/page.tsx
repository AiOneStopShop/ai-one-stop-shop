'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { DeskAccent } from '@/components/DeskAccents';
import { OrangeSwoosh } from '@/components/OrangeSwoosh';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const AUTH_QUERY_MESSAGES = {
  auth: "That sign-in link didn't work or has expired. Request a new one.",
} as const;

/** Only same-site admin paths are allowed as a post-login destination. */
function safeAdminNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/admin') || raw.startsWith('//') || raw.includes('\\')) return '/admin/review';
  if (raw.startsWith('/admin/login')) return '/admin/review';
  return raw;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'signin' | 'magic'>('signin');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('error');
    if (code && Object.prototype.hasOwnProperty.call(AUTH_QUERY_MESSAGES, code)) {
      setError(AUTH_QUERY_MESSAGES[code as keyof typeof AUTH_QUERY_MESSAGES]);
    }
  }, [searchParams]);

  // Only create client if env vars are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="flex items-center justify-center bg-cream py-16 px-4">
        <div className="card max-w-md w-full text-center !p-8">
          <h1 className="heading-2 mb-3 text-balance">Team sign&#8209;in is off here</h1>
          <p className="text-soft">
            This copy of the site isn&apos;t connected to our database, so there&apos;s nothing to sign in to. Set
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to turn it on.
          </p>
          <Link href="/" className="btn-secondary mt-6 inline-flex">Back to the guide</Link>
        </div>
      </div>
    );
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Sign-in failed.');
        setLoading(false);
        return;
      }

      router.push(safeAdminNext(searchParams.get('next')));
      router.refresh();
    } catch {
      setError('Sign-in failed.');
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      });
    } catch {
      // Same message whether the address exists or not
    }

    setSuccess('If that address is an admin, a link is on its way.');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center bg-cream py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <DeskAccent name="key" className="w-24 h-auto mx-auto mb-2" />
          <h1 className="heading-2">Team sign&#8209;in</h1>
          <OrangeSwoosh className="swoosh mx-auto" />
          <p className="text-soft">
            For the people who review and publish tools. Visitors don&apos;t need an account to use the guide.
          </p>
        </div>

        <div className="card !p-6 md:!p-8">
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-cream-2 border border-line" role="group" aria-label="Sign-in method">
            <button
              type="button"
              onClick={() => setMode('signin')}
              aria-pressed={mode === 'signin'}
              className={`min-h-11 px-4 rounded-lg text-sm font-semibold transition-colors focus-ring ${
                mode === 'signin'
                  ? 'bg-card text-green shadow-[0_2px_6px_-3px_rgba(30,59,44,0.5)]'
                  : 'text-soft hover:text-green'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic')}
              aria-pressed={mode === 'magic'}
              className={`min-h-11 px-4 rounded-lg text-sm font-semibold transition-colors focus-ring ${
                mode === 'magic'
                  ? 'bg-card text-green shadow-[0_2px_6px_-3px_rgba(30,59,44,0.5)]'
                  : 'text-soft hover:text-green'
              }`}
            >
              Email me a link
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-leaf border border-leaf-line text-green rounded-lg p-3 text-sm" role="status">
              {success}
            </div>
          )}

          <form onSubmit={mode === 'signin' ? handleSignIn : handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-soft rounded-lg bg-white focus-ring"
                placeholder="admin@example.com"
              />
            </div>

            {mode === 'signin' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-soft rounded-lg focus-ring"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Email me a sign-in link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-green underline underline-offset-2 focus-ring rounded">
              Back to the guide
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-soft">
          Only team accounts can sign in. We don&apos;t create accounts from this page.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center bg-cream py-24">
        <div className="text-soft">One moment…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
