#!/usr/bin/env node
/**
 * M1: keep Stripe Payment Link redirects pointed at this site.
 *
 * Every Payment Link's "after completion" redirect should be
 *   ${NEXT_PUBLIC_SITE_URL}/advertise/thanks?source=stripe
 * (falls back to https://aionestop.shop). Hardcoding a host such as www.aionestop.shop
 * breaks previews and sends payers to a 404 before the page is deployed.
 *
 * Dry run (default): lists links and the change it would make. Nothing is written.
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-payment-link-redirects.mjs
 * Apply (needs explicit --apply):
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-payment-link-redirects.mjs --apply
 *
 * Refuses live keys unless --allow-live is also passed.
 */
const key = process.env.STRIPE_SECRET_KEY || '';
const apply = process.argv.includes('--apply');
const allowLive = process.argv.includes('--allow-live');
const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop').replace(/\/$/, '');
const target = `${base}/advertise/thanks?source=stripe`;

if (!key) {
  console.log(`Target redirect: ${target}`);
  console.log('STRIPE_SECRET_KEY not set: nothing to check. Set it to list or update Payment Links.');
  process.exit(0);
}
if (key.startsWith('sk_live_') && !allowLive) {
  console.error('Refusing to touch live-mode Payment Links without --allow-live.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${key}` };
const res = await fetch('https://api.stripe.com/v1/payment_links?limit=100&active=true', { headers });
if (!res.ok) {
  console.error(`Stripe list failed: HTTP ${res.status}`);
  process.exit(1);
}
const { data } = await res.json();
let changes = 0;
for (const link of data) {
  const current = link.after_completion?.type === 'redirect' ? link.after_completion.redirect?.url : `(${link.after_completion?.type})`;
  if (current === target) {
    console.log(`ok      ${link.id}  ${current}`);
    continue;
  }
  changes += 1;
  console.log(`${apply ? 'update ' : 'would  '} ${link.id}  ${current}  ->  ${target}`);
  if (apply) {
    const body = new URLSearchParams({
      'after_completion[type]': 'redirect',
      'after_completion[redirect][url]': target,
    });
    const up = await fetch(`https://api.stripe.com/v1/payment_links/${link.id}`, { method: 'POST', headers, body });
    if (!up.ok) {
      console.error(`  failed: HTTP ${up.status}`);
      process.exitCode = 1;
    }
  }
}
console.log(`${data.length} active link(s), ${changes} ${apply ? 'updated' : 'to update (dry run)'}.`);
