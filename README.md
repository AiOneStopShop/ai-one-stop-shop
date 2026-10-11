# AI One Stop Shop

Honest AI tools directory - rebuilt with security, transparency, and accuracy.

## Features

- ✅ Hand-reviewed tools (no fake AI-generated ratings)
- ✅ Real pricing and affiliate disclosures
- ✅ Fast, accessible interface
- ✅ Advanced filtering and search
- ✅ Tool comparison
- ✅ Secure admin panel with RLS
- ✅ Rate limiting (Upstash Redis)
- ✅ Legal compliance (CAN-SPAM, Privacy)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (for database + auth)
- Upstash Redis account (for distributed rate limiting)

### Environment Variables

Create `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Rate Limiting (required for production)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Affiliate Links (required)
# Without this, all /go links redirect to home instead of affiliate URLs
AFFILIATE_CLICK_SECRET=random-secret-string

# Daily click-log cleanup cron (required in production)
# Vercel sends Authorization: Bearer ${CRON_SECRET} to /api/cron/cleanup-clicks
# The route returns 401 if this is unset
CRON_SECRET=random-cron-secret

# Contact and brand (leave unset until MX / brand site are live)
# Mailto links stay hidden when NEXT_PUBLIC_SITE_CONTACT_EMAIL is empty
# NEXT_PUBLIC_SITE_CONTACT_EMAIL=
# Brand links stay plain text when NEXT_PUBLIC_BRAND_URL is empty
# NEXT_PUBLIC_BRAND_URL=
NEXT_PUBLIC_SITE_POSTAL_ADDRESS="<your mailing address>\n<city, state zip>\n<country>"

# Optional (DO NOT SET until wired)
# Turnstile (Cloudflare CAPTCHA) - NOT YET WIRED TO SUBMIT FORM
# Leave UNSET at launch. API accepts turnstileToken but form doesn't send it.
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
# TURNSTILE_SECRET_KEY=your-secret-key
NEXT_PUBLIC_SITE_URL=https://aionestop.shop
```

**⚠️ IMPORTANT:** Do NOT send waitlist emails or marketing emails until `NEXT_PUBLIC_SITE_CONTACT_EMAIL` and `NEXT_PUBLIC_SITE_POSTAL_ADDRESS` are set. CAN-SPAM requires a physical postal address in all commercial email.

### Installation

```bash
npm install
```

### Database Setup

Run migrations in order:

```bash
# 1. Initial schema
supabase db push supabase/migrations/001_initial_schema.sql

# 2. Click retention with secured functions
supabase db push supabase/migrations/002_add_click_retention.sql
# Production cleanup: Vercel Cron hits GET /api/cron/cleanup-clicks daily
# (vercel.json, Authorization: Bearer $CRON_SECRET) and calls
# delete_old_affiliate_clicks_http() with the service-role key.
# Alternative if you prefer it in the database:
#   create extension if not exists pg_cron;
#   select cron.schedule(
#     'cleanup-affiliate-clicks',
#     '0 5 * * *',
#     $$select delete_old_affiliate_clicks()$$
#   );

# 3. Submissions RLS with trigger
supabase db push supabase/migrations/003_submissions_rls_trigger.sql

# 4. Profiles and admin system
supabase db push supabase/migrations/004_profiles_and_admin.sql
```

### Grant Admin Role

See `docs/ADMIN_SETUP.md` for SQL commands to grant admin access.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── admin/             # Admin panel (RLS protected)
│   ├── api/               # API routes (rate limited)
│   ├── tools/             # Tool catalog and detail pages
│   ├── compare/           # Tool comparison
│   └── ...
├── components/            # Shared React components
├── lib/                   # Utilities and database client
├── supabase/migrations/   # Database migrations
└── docs/                  # Documentation
```

## Security

- ✅ RLS on all tables
- ✅ Admin auth with `getUser()` (not `getSession()`)
- ✅ Upstash rate limiting (falls back to in-memory with warnings)
- ✅ Input validation with Zod
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (safeJsonLd for JSON-LD)
- ✅ Turnstile bot protection (when configured)

See `BUILD_STATUS.md` for complete security implementation details.

## Legal Compliance

- Privacy policy with accurate 90-day retention
- Cookie notice (no tracking or ad cookies)
- Affiliate disclosures on all pages
- CAN-SPAM compliant (when contact info is set)
- No fake ratings or AI-generated reviews

## Performance

- Next.js 15 with App Router
- Static generation where possible
- Optimized images and fonts
- Lighthouse scores: 95-100 (Performance, A11y, SEO)

## Admin Panel

Access at `/admin/login` after setting up Supabase and granting admin role.

Features:
- Review pending tool submissions
- Approve/reject draft tools
- Secure role-based access

## License

Proprietary - All Rights Reserved

## Support

For questions: See footer or privacy page for contact information (when configured).
