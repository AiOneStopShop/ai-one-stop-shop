'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { BLOCK_KEY, BLOCK_MS, isValidBirthYear, meetsMinAge } from '@/lib/newsletter-age';

type Variant = 'full' | 'compact';
type Status = 'idle' | 'sending' | 'done' | 'blocked' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readBlock(): boolean {
  let ts: number | null = null;
  try {
    const v = window.localStorage.getItem(BLOCK_KEY);
    if (v !== null) {
      ts = Number(v);
      if (!(Date.now() - ts < BLOCK_MS)) {
        window.localStorage.removeItem(BLOCK_KEY);
        ts = null;
      }
    }
  } catch {
    /* localStorage unavailable: fall through to cookie */
  }
  if (ts !== null) return true;
  const m = document.cookie.match(new RegExp(`(?:^|; )${BLOCK_KEY}=(\\d+)`));
  return Boolean(m && Date.now() - Number(m[1]) < BLOCK_MS);
}

function writeBlock() {
  const now = String(Date.now());
  try {
    window.localStorage.setItem(BLOCK_KEY, now);
    return;
  } catch {
    /* fall back to a first-party cookie */
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${BLOCK_KEY}=${now}; Max-Age=86400; Path=/; SameSite=Lax${secure}`;
}

function ErrIcon() {
  return (
    <svg className="nl-ic" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M10 1.5 19 18H1L10 1.5Zm-1 6v5h2v-5H9Zm0 6.5v2h2v-2H9Z" />
    </svg>
  );
}

function BlockedMessage() {
  return (
    <>
      <p className="nl-msg-title">Thanks for your interest!</p>
      <p className="m-0">
        We&apos;re not able to sign you up for the newsletter right now. We didn&apos;t save the email address you entered. You&apos;re still welcome to explore all the AI tools on the site.
      </p>
    </>
  );
}

export function NewsletterSignup({ variant = 'full', source = 'newsletter_page' }: { variant?: Variant; source?: string }) {
  const uid = useId().replace(/:/g, '');
  const ids = {
    h: `nl-h-${uid}`,
    email: `nl-email-${uid}`,
    emailErr: `nl-email-err-${uid}`,
    year: `nl-year-${uid}`,
    yearErr: `nl-year-err-${uid}`,
    consentErr: `nl-consent-err-${uid}`,
  };
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<{ email?: boolean; year?: boolean; consent?: boolean }>({});
  const [serverError, setServerError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (readBlock()) setStatus('blocked');
  }, []);

  useEffect(() => {
    if (moveFocus.current && (status === 'done' || status === 'blocked')) {
      msgRef.current?.focus();
      moveFocus.current = false;
    }
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setServerError('');

    // (1) format errors
    const emailOk = EMAIL_RE.test(email.trim());
    const yearOk = isValidBirthYear(year);
    if (!emailOk || !yearOk) {
      setErrors({ email: !emailOk, year: !yearOk });
      (!emailOk ? emailRef : yearRef).current?.focus();
      return;
    }

    // (2) age check, before any network call
    if (!meetsMinAge(Number(year))) {
      setEmail('');
      setYear('');
      setConsent(false);
      setErrors({});
      writeBlock();
      moveFocus.current = true;
      setStatus('blocked');
      return;
    }

    // (3) consent
    if (!consent) {
      setErrors({ consent: true });
      consentRef.current?.focus();
      return;
    }

    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), age_ok: true, consent: true, website, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setServerError(json.error || 'Something went wrong. Please try again.');
        return;
      }
      moveFocus.current = true;
      setStatus('done');
    } catch {
      setStatus('error');
      setServerError('Network error. Please check your connection and try again.');
    }
  }

  const sending = status === 'sending';
  const cls = `nl${variant === 'compact' ? ' nl--compact' : ''}`;

  return (
    <section className={cls} aria-labelledby={ids.h} data-testid="newsletter-signup">
      <h2 id={ids.h} className="nl-h">Get one helpful AI tool each week</h2>

      {status === 'done' || status === 'blocked' ? (
        <div ref={msgRef} tabIndex={-1} role="status" aria-live="polite" className={`nl-msg${status === 'blocked' ? ' nl-msg--info' : ''}`}>
          {status === 'done' ? (
            <>
              <p className="nl-msg-title">You&apos;re signed up.</p>
              <p className="m-0">The first tool arrives next week.</p>
            </>
          ) : (
            <BlockedMessage />
          )}
        </div>
      ) : (
        <>
          {variant === 'full' ? <p className="nl-sub">A short, plain-English pick. No hype.</p> : null}
          <form noValidate onSubmit={onSubmit}>
            <div className="nl-row">
              <div className="nl-field">
                <label htmlFor={ids.email} className="nl-label">Email</label>
                <input
                  ref={emailRef}
                  id={ids.email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  autoCapitalize="off"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={ids.emailErr}
                  className={`nl-input${errors.email ? ' nl-inv' : ''}`}
                />
                <p id={ids.emailErr} className="nl-err" aria-live="polite">
                  {errors.email ? (<><ErrIcon />Enter a full email, like name@example.com.</>) : null}
                </p>
              </div>
              <div className="nl-field nl-f-year">
                <label htmlFor={ids.year} className="nl-label">Birth year</label>
                <input
                  ref={yearRef}
                  id={ids.year}
                  name="birth_year"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  autoComplete="off"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  aria-invalid={errors.year ? true : undefined}
                  aria-describedby={ids.yearErr}
                  className={`nl-input nl-year${errors.year ? ' nl-inv' : ''}`}
                />
                <p id={ids.yearErr} className="nl-err" aria-live="polite">
                  {errors.year ? (<><ErrIcon />Enter your birth year as 4 digits.</>) : null}
                </p>
              </div>
            </div>

            <div aria-hidden="true" className="nl-hp">
              <label htmlFor={`nl-website-${uid}`}>Leave this field empty</label>
              <input id={`nl-website-${uid}`} type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div className="nl-row2">
              <div>
                <label className={`nl-consent${errors.consent ? ' nl-inv' : ''}`}>
                  <input
                    ref={consentRef}
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={ids.consentErr}
                  />
                  <span>
                    Yes, email me the AI One Stop Shop newsletter. It includes clearly labeled sponsor sections. I can unsubscribe anytime. See our <Link href="/privacy">Privacy Policy</Link>.
                  </span>
                </label>
                <p id={ids.consentErr} className="nl-err" aria-live="polite">
                  {errors.consent ? (<><ErrIcon />Check the box above to get the newsletter.</>) : null}
                </p>
              </div>
              <button type="submit" className={`nl-btn${sending ? ' nl-busy' : ''}`} aria-disabled={sending || undefined}>
                {sending ? (<><span className="nl-spin" aria-hidden="true" />Subscribing…</>) : 'Subscribe'}
              </button>
            </div>
            <div role="status" aria-live="polite" className="nl-live">
              {status === 'error' && serverError ? <p className="nl-err"><ErrIcon />{serverError}</p> : null}
            </div>
          </form>
          {variant === 'full' ? (
            <p className="nl-privacy">
              One email a week. Unsubscribe anytime. <Link href="/privacy">Privacy</Link>
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
