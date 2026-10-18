'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(json.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  }

  if (status === 'done') {
    return (
      <div className="note" role="status">
        <p className="font-fraunces font-bold text-green text-xl m-0">You&apos;re on the list.</p>
        <p className="mt-2 mb-0">We&apos;ll send the first issue when it&apos;s ready. To leave, just reply &quot;unsubscribe&quot; to any issue.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" noValidate={false}>
      <div>
        <label htmlFor="newsletter-email" className="block font-semibold text-ink mb-2">
          Your email
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 min-h-[52px] border border-soft rounded-xl bg-white text-ink focus-ring"
          aria-describedby="newsletter-help"
          disabled={status === 'sending'}
        />
        <p id="newsletter-help" className="text-sm text-soft mt-2 mb-0">
          We use it only to send this newsletter. No sharing, no selling.
        </p>
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor="newsletter-website">Leave this field empty</label>
        <input id="newsletter-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {status === 'error' && message ? (
        <p role="alert" className="text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 m-0">{message}</p>
      ) : null}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === 'sending'}>
        {status === 'sending' ? 'Adding you…' : 'Join the list'}
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </form>
  );
}
