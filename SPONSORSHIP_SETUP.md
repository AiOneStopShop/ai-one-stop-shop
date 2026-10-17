# Sponsorship Feature - Setup Notes

## Environment Variables Required

### For Production
- `NEXT_PUBLIC_STRIPE_LINK_FEATURED` - Stripe Payment Link for Featured Tool package (optional, falls back to request form)
- `NEXT_PUBLIC_STRIPE_LINK_SPOTLIGHT` - Stripe Payment Link for Category Spotlight package (optional)
- `NEXT_PUBLIC_STRIPE_LINK_NEWSLETTER` - Stripe Payment Link for Newsletter package (optional, currently disabled)
- `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` - Stripe Payment Link for Founding Bundle package (optional)
- `RESEND_API_KEY` - Resend API key for sending notification emails (server-side only)
- `NEXT_PUBLIC_SITE_CONTACT_EMAIL` - Contact email for receiving notifications (e.g., aionestopshop25@gmail.com)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

### Launch Mode
Current launch mode is **request-only**. All "Book" buttons fall back to "Request a spot" when Stripe Payment Link env vars are empty. This is intentional for the initial launch.

## Supabase Setup

### Storage Bucket
Create a storage bucket named `sponsor-assets` in Supabase:
1. Go to Storage in Supabase dashboard
2. Create new bucket: `sponsor-assets`
3. Set as **private** (public access controlled via signed URLs if needed)
4. File size limit: 200KB (enforced in code)
5. Allowed types: PNG, SVG

### Database Migration
Apply migration `018_sponsor_data_model.sql` to the **test project only** (`aionestop-uat`, ref `gvjslfdgulkkabfhmjke`):

```bash
# Apply to UAT project
supabase db push --project-ref gvjslfdgulkkabfhmjke
```

### RLS Policies
The migration sets up RLS policies where:
- Anonymous users can ONLY read from `public_live_placements` view
- All direct table access requires service_role
- Admin users need `profiles.role='admin'` to access /admin/sponsors

## Features Implemented

### T1: Data Model ✅
- `sponsors` table
- `sponsor_placements` table with package types
- `sponsor_intake` table for form submissions
- `placement_events` table for click/impression tracking
- `public_live_placements` view for anonymous access
- Helper function `increment_placement_event()` for counting

### T2: Ranking Isolation + Label ✅
- `SponsoredLabel` component with "Sponsored ad" text (14px, high contrast)
- Sponsor links use `rel="sponsored noopener"`
- Sponsored placements excluded from rankings (via separate queries)

### T3: Surfaces ✅
- Homepage sponsored row (max 3 placements)
- Category spotlight (max 1 per category, top of page)
- Tool page sponsored badge (shown when tool is in live placement)

### T4: Counting ✅
- `/go/s/[placementId]` redirect with click tracking
- `/api/placements/track` for impression counting
- Bot filtering by User-Agent
- No IP storage, only aggregated daily counts
- CSP-compliant (connect-src 'self')

### T5: Pages ✅
- `/advertise` - Main sponsorship page with packages and pricing
- `/advertise/thanks` - Confirmation page after request
- `/advertise/request` - Simple request form
- `/advertise/intake` - Detailed intake form with asset upload
- `/sponsor-terms` - DRAFT placeholder (pending legal review)

### T6: Forms ✅
- Request form with honeypot + rate limiting (5/IP/hour)
- Intake form with logo upload to Supabase Storage
- SVG sanitization for security
- Zod-like validation on server
- Email notifications via Resend API
- Under-13 targeting auto-decline

### T7: Admin ✅
- `/admin/sponsors` - List intake records
- Status badges (pending/approved/declined/processing)
- View all submission details
- Placeholder for approve/decline actions (manual in Supabase for now)

### T8: Copy Updates ✅
- Updated `/disclosure` - Sponsorships as primary revenue
- Updated `/how-we-rank` - Editorial independence rule (verbatim from spec)
- Updated footer disclosure
- Updated `/privacy` - Added Gmail, Upstash, Resend as processors; 5-year intake retention
- All copy marked "pending legal review"

## Legal Review Changes Applied
1. ✅ Label text changed to "Sponsored ad" everywhere
2. ✅ Removed list prices, show founding prices only + "plus sales tax where it applies"
3. ✅ /sponsor-terms is clearly marked DRAFT placeholder
4. ✅ Privacy updated with Gmail, Upstash processors; 5-year retention
5. ✅ Launch mode is request-only (Book buttons fall back to Request)
6. ✅ No personal names anywhere in code or copy

## Testing Checklist
- [ ] Playwright test: Ranking isolation (tool rank unchanged with/without live placement)
- [ ] Playwright test: "Sponsored ad" label visible at 390px and 1440px
- [ ] Playwright test: Placement only shown within date range
- [ ] Playwright test: Form validation and 429 rate limit
- [ ] Playwright test: Admin access control (requires admin role)
- [ ] Playwright test: Book button env fallback to "Request a spot"
- [ ] axe accessibility test passes
- [ ] Type check passes
- [ ] Apply migration to UAT and verify RLS policies

## Next Phase (T9-T12 - Newsletter)
NOT included in this PR:
- T9: Newsletter signup + double opt-in
- T10: Resend Audience sync
- T11: Newsletter template + archive
- T12: Stripe webhook automation

## PR Checklist
- [x] Draft PR open into `cursor/rebuild-aionestop-shop-aaf2`
- [x] CI and type-check green (will verify after push)
- [ ] Playwright tests added and passing
- [ ] Vercel preview URL in PR description
- [ ] Screenshots at 390px and 1440px
- [ ] List migrations and DB they were applied to
- [ ] List new env vars
- [ ] Note overlap with PR #5 (if any)
- [ ] Note "copy pending legal review"
