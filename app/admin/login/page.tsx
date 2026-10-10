'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'signin' | 'magic'>('signin');
  const router = useRouter();

  // Only create client if env vars are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F5] p-4">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Supabase Not Configured</h1>
          <p className="text-[#5B657B]">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable admin login.</p>
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
        setError('Access denied. Admin role required.');
        setLoading(false);
        return;
      }

      // Success - redirect to admin review
      router.push('/admin/review');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/review`,
        },
      });

      if (magicError) throw magicError;

      setSuccess('Check your email for the magic link!');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-4xl">✨</span>
            <span className="font-dm-sans font-bold text-2xl text-[#171C26]">
              AI One Stop Shop
            </span>
          </Link>
          <h2 className="mt-6 text-center heading-2">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-[#5B657B]">
            Sign in with your admin account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E5E1DC] p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-[#6C39EF] text-white'
                  : 'bg-[#F3EFFF] text-[#6C39EF] hover:bg-[#E5D9FF]'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'magic'
                  ? 'bg-[#6C39EF] text-white'
                  : 'bg-[#F3EFFF] text-[#6C39EF] hover:bg-[#E5D9FF]'
              }`}
            >
              Magic Link
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={mode === 'signin' ? handleSignIn : handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#171C26] mb-2">
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
                className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                placeholder="admin@example.com"
              />
            </div>

            {mode === 'signin' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#171C26] mb-2">
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
                  className="w-full px-4 py-3 border border-[#5B657B] rounded-lg focus-ring"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#6C39EF] hover:underline focus-ring rounded">
              ← Back to home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[#5B657B]">
          Admin access only. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
