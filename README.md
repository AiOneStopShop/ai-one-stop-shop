# AI One Stop Shop - Honest AI Tools Directory

**Rebuilt:** October 2026  
**Stack:** Next.js 14 (App Router) + Supabase + Vercel  
**Status:** Draft (unpublished)

## What this is

AI One Stop Shop is a hand-checked directory of AI tools. No fake ratings, no paid rankings. Just honest reviews of tools we've actually tried.

This is a complete rebuild of the original Replit prototype, following the specifications in the attached team documentation.

## Key Features

### ✅ What's Built

- **Server-rendered pages** for all tools, categories, and static content (SEO-ready)
- **FREE directory** - no email gates, no paid memberships at launch
- **Affiliate link system** with `/go/[slug]` redirects and click tracking
- **"Made by us" section** at `/our-kits` for ApproveGate (clearly separated from rankings)
- **Public tool submission** form
- **Honest numbers** - real counts from database, no fake ratings
- **SEO complete**: JSON-LD, sitemap.xml, robots.txt, llms.txt
- **Public API** at `/api/v1/tools` and `/api/v1/categories`
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Accessibility**: WCAG 2.2 AA compliant (no zoom blocking, proper labels, skip links, focus management)
- **Performance optimized**: Server-side rendering, optimized fonts, no unnecessary JS

### 📋 Not Yet Built (Future Work)

- **Import pipeline** for bulk tool ingestion
- **Enrichment job** for automatic price/category updates
- **Admin review queue** (use Supabase Table Editor for now)
- **Search and filtering** (basic category filter exists)
- **Tool finder / stack builder**
- **MCP endpoint** (documented as TODO in llms.txt)
- **Stripe integration** for future paid tiers
- **Compare feature**

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Database:** Supabase (Postgres with RLS)
- **Hosting:** Vercel (requires Pro plan - $20/mo)
- **Styling:** Tailwind CSS
- **Security:** Content Security Policy, security headers, HTTPS-only
- **Performance:** Static generation + ISR, optimized fonts, minimal JS

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with Header/Footer
│   ├── page.tsx                   # Home page
│   ├── tools/
│   │   ├── page.tsx              # Tools directory
│   │   └── [slug]/page.tsx       # Individual tool pages
│   ├── category/[slug]/page.tsx  # Category pages
│   ├── our-kits/page.tsx         # ApproveGate & HumanHold
│   ├── about/page.tsx            # About page
│   ├── disclosure/page.tsx       # Affiliate disclosure
│   ├── how-we-rank/page.tsx      # Ranking methodology
│   ├── pricing/page.tsx          # Pricing (placeholder)
│   ├── submit/page.tsx           # Tool submission form
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   ├── robots.ts                 # robots.txt
│   ├── sitemap.ts                # sitemap.xml
│   ├── llms.txt/route.ts         # llms.txt for AI crawlers
│   ├── go/[slug]/route.ts        # Affiliate redirect handler
│   └── api/
│       ├── v1/
│       │   ├── tools/route.ts    # Public tools API
│       │   └── categories/route.ts # Public categories API
│       └── submit-tool/route.ts  # Tool submission endpoint
├── components/
│   ├── Header.tsx                # Site header with navigation
│   └── Footer.tsx                # Site footer
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── json-ld.ts               # JSON-LD schema generators
├── types/
│   └── database.ts              # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
└── scripts/
    └── seed-database.ts         # Seed script with JSON data
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-one-stop-shop
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and keys
3. Go to SQL Editor and run the migration:
   ```sql
   -- Copy and paste contents of supabase/migrations/001_initial_schema.sql
   ```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Affiliate tracking
AFFILIATE_CLICK_SECRET=generate_a_random_string_here

# Optional: For future AI enrichment
# OPENAI_API_KEY=your_openai_api_key
```

⚠️ **Important:** Never commit `.env.local` to git. The `.gitignore` file already excludes it.

### 4. Seed the Database

```bash
npm run seed
```

This will populate the database with:
- 9 categories (including empty placeholders)
- 10 verified tools with corrected data
- Tool-category relationships

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test the Build

```bash
npm run build
npm start
```

## Deployment to Vercel

### Prerequisites

- Vercel account
- Vercel Pro plan ($20/mo) - **required** for commercial use

### Steps

1. **Push to GitHub**
   ```bash
   git push origin cursor/rebuild-aionestop-shop-aaf2
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`
   - Make sure to use production Supabase keys

4. **Set Spending Limit**
   - Go to Settings → Usage
   - Set a hard limit (e.g., $10/month) to stay under budget

5. **Deploy**
   - Vercel will automatically deploy
   - Each push to main triggers a new deployment

### DNS Configuration (Later, with Kati's approval)

When ready to point aionestop.shop to Vercel:

1. In Vercel, go to Project → Settings → Domains
2. Add `aionestop.shop` and `www.aionestop.shop`
3. Update DNS at GoDaddy with Vercel's nameservers
4. Wait for DNS propagation (usually < 1 hour)

## Database Management

### Using Supabase Table Editor

For now, manage tools directly in Supabase:

1. Go to your Supabase project → Table Editor
2. Select the `tools` table
3. Add, edit, or delete tools
4. Set `status` to `published` to make tools visible

### Adding Affiliate Links

1. In Supabase, go to the `affiliate_links` table
2. Insert a new row:
   - `tool_id`: UUID of the tool
   - `go_slug`: Short slug (e.g., "chatgpt")
   - `destination_url`: The affiliate URL
   - `program_name`: e.g., "OpenAI Affiliate"
   - `is_active`: true

3. The link will be available at `/go/{go_slug}`

### Tool Submissions

User submissions appear in the `tool_submissions` table with `status='pending'`. Review and either:
- Approve: Create a new tool in the `tools` table
- Reject: Update the status to `rejected`

## Performance Targets (Quinn's QA Baseline)

### Current Goals

| Metric | Target |
|--------|--------|
| Mobile Lighthouse Performance | ≥ 90 |
| Desktop Lighthouse Performance | ≥ 95 |
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| TBT (Total Blocking Time) | ≤ 150ms |
| CLS (Cumulative Layout Shift) | ≤ 0.05 |
| Homepage weight | ≤ 1 MB |
| Accessibility Score | 100 |
| Zero dead links or buttons | ✓ |
| Every page readable without email | ✓ |

### How We Achieve This

- Server-side rendering (no empty HTML shell)
- Optimized web fonts (self-hosted, subset)
- No background videos
- Minimal JavaScript
- Proper security headers
- No Stripe loaded on public pages
- Semantic HTML with proper ARIA labels

## Security

### Headers Configured

- ✅ Content-Security-Policy
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy
- ✅ Strict-Transport-Security (HSTS)
- ✅ x-powered-by removed

### Privacy

- IP addresses are hashed (HMAC-SHA256) before storage
- No raw IPs stored in the database
- Rate limiting on affiliate redirects
- Bot detection and flagging

### RLS (Row Level Security)

- ✅ Enabled on all tables
- ✅ Public can read published tools only
- ✅ Affiliate links are server-only (no public access)
- ✅ Admin operations require service role key

## Accessibility (WCAG 2.2 AA)

- ✅ Zoom allowed (no maximum-scale)
- ✅ Skip to main content link
- ✅ Proper heading hierarchy
- ✅ All inputs have visible labels
- ✅ Focus visible on all interactive elements
- ✅ Keyboard navigable
- ✅ Color contrast ≥ 4.5:1
- ✅ No autoplay videos
- ✅ Respects prefers-reduced-motion
- ✅ Touch targets ≥ 44×44px
- ✅ Landmarks and ARIA labels

## API Documentation

### GET /api/v1/tools

Returns published tools with pagination.

**Query Parameters:**
- `q` (string, optional): Search query
- `category` (string, optional): Category slug
- `limit` (number, optional): Items per page (max 100, default 100)
- `offset` (number, optional): Pagination offset (default 0)

**Response:**
```json
{
  "tools": [...],
  "pagination": {
    "total": 10,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /api/v1/categories

Returns all categories.

**Response:**
```json
{
  "categories": [...]
}
```

### POST /api/submit-tool

Submit a new tool for review.

**Body:**
```json
{
  "toolName": "Tool Name",
  "websiteUrl": "https://example.com",
  "contactEmail": "you@example.com",
  "description": "Optional description"
}
```

## Testing

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Tools display correctly
- [ ] Categories filter works
- [ ] Tool detail pages load
- [ ] Affiliate /go/ links redirect
- [ ] Submit form works
- [ ] Mobile menu opens/closes
- [ ] All footer links work
- [ ] No 404 errors for valid pages
- [ ] robots.txt loads
- [ ] sitemap.xml loads
- [ ] llms.txt loads

### Lighthouse Testing

```bash
# Install lighthouse
npm install -g lighthouse

# Test mobile
lighthouse http://localhost:3000 --preset=perf --view

# Test desktop
lighthouse http://localhost:3000 --preset=desktop --view
```

### Accessibility Testing

Use axe DevTools browser extension:
1. Install [axe DevTools](https://www.deque.com/axe/devtools/)
2. Open any page
3. Run axe scan
4. Fix any issues found

## Cost Breakdown

### Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20/mo |
| Supabase | Free → Pro | $0 → $25/mo |
| Domain (GoDaddy) | - | ~$12/year |
| **Total** | | **$20-45/mo** |

Stripe fees (when used): 2.9% + $0.30 per transaction + 0.7% for subscriptions

### Staying Under Budget

- Use Supabase Free tier initially (500MB database, pauses after 1 week inactive)
- Set Vercel spending limit at $10
- No paid API calls (OpenAI enrichment is optional)
- Use Upstash Redis free tier for rate limiting (if needed)

## Troubleshooting

### Database Connection Errors

```
Error: Invalid Supabase credentials
```

Solution: Check your `.env.local` file has correct SUPABASE_URL and keys.

### Build Errors

```
Error: Cannot find module '@supabase/supabase-js'
```

Solution: Run `npm install`

### Affiliate Links Not Working

Check that:
1. The affiliate_links table has an entry with the go_slug
2. is_active is true
3. The tool_id matches a real tool

### Pages Returning 404

If a tool page returns 404:
1. Check the tool's `status` is `published` in Supabase
2. Check the slug matches exactly (case-sensitive)
3. Try rebuilding: `npm run build`

## Future Improvements (TODO)

### High Priority
- [ ] Add search functionality (Supabase full-text search or Algolia)
- [ ] Build import pipeline for bulk tool ingestion
- [ ] Add enrichment job (price checking, link validation)
- [ ] Create admin dashboard (approve submissions, manage tools)
- [ ] Implement compare feature (side-by-side tool comparison)

### Medium Priority
- [ ] Build tool finder / stack builder with AI
- [ ] Add email newsletter integration
- [ ] Create MCP endpoint for agent access
- [ ] Add real user reviews system
- [ ] Implement sponsored listing workflow

### Low Priority
- [ ] Add tool uptime monitoring
- [ ] Create automated screenshot capture
- [ ] Build analytics dashboard
- [ ] Add A/B testing framework

## Contributing

This is a private project, but if you're on the team:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally
4. Commit: `git commit -m "Description of changes"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## Support

For questions or issues:
- **Email:** hello@aionestop.shop
- **Documentation:** This README
- **Team Docs:** See attached specification documents

## License

Private and confidential. © 2026 AI One Stop Shop / oneTomorrow

---

**Built with:** Next.js, Supabase, Tailwind CSS, and a focus on honesty.
