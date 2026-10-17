# Security Fixes Applied

This document lists all security fixes applied to address the security review blocking deployment.

## ✅ Fixed Issues

### 1. Admin Actions Auth & Validation
- ✅ Added server-side admin auth check to all admin actions (`approveTool`, `rejectTool`)
- ✅ Verified Supabase session + admin role in DB before any action
- ✅ Validated UUIDs and status values
- ✅ Removed local-JSON write fallback in production (dev-only behind NODE_ENV)
- **Files**: `app/admin/review/actions.ts`

### 2. Admin Auth Middleware
- ✅ Created `middleware.ts` protecting `/admin/*`
- ✅ Supabase SSR session verification
- ✅ Admin role check against database
- ✅ Redirects unauthorized users
- **Files**: `middleware.ts`

### 3. Next.js Security Updates
- ✅ Upgraded Next.js to 14.2.35 (latest secure 14.x)
- ✅ Disabled AVIF image optimization
- ✅ Set `unoptimized: true` for production images
- ✅ Removed remote image patterns
- ✅ Updated CSP: removed unsafe-eval, added object-src 'none', base-uri 'self', form-action 'self'
- ✅ Removed X-Frame-Options (redundant with frame-ancestors in CSP)
- **Files**: `next.config.js`, `package.json`

### 4. RLS & Submissions Security
- ✅ Added trigger to force `status='pending'` on all new submissions
- ✅ Added length limits on all text columns (tool_submissions and tools tables)
- ✅ Updated status enum to include 'needs_review' and 'pending'
- ✅ Restricted submission insert policy to `anon` role explicitly
- **Files**: `supabase/migrations/001_initial_schema.sql`

### 5. Rate Limiting
- ✅ Implemented in-memory rate limiting on all API routes
- ✅ Safe IP extraction using Vercel's `x-real-ip` or `request.ip` (not raw x-forwarded-for)
- ✅ Applied to: `/api/v1/tools`, `/api/v1/categories`, `/api/submit-tool`, `/go/[slug]`
- **Note**: Production should use Upstash Redis for distributed rate limiting
- **Files**: `app/api/v1/tools/route.ts`, `app/api/v1/categories/route.ts`, `app/api/submit-tool/route.ts`, `app/go/[slug]/route.ts`

### 6. API Security
- ✅ Clamped `/api/v1/tools` limit to max 50
- ✅ Sanitized search queries (removed %, _ wildcards, 100 char limit)
- ✅ Parameterized all queries
- ✅ Added rate limiting
- ✅ Removed raw DB errors from responses
- **Files**: `app/api/v1/tools/route.ts`

### 7. JSON-LD XSS Protection
- ✅ Created `safeJsonLd()` function to escape <, >, &, U+2028/2029
- ✅ Updated all pages to use `safeJsonLd()` instead of `JSON.stringify()`
- **Files**: `lib/json-ld.ts`, `app/page.tsx`, `app/tools/[slug]/page.tsx`

### 8. Submit Form Security
- ✅ Added Zod validation schema with strict types
- ✅ URL protocol validation (https:// or http:// only, 500 char max)
- ✅ Length caps on all fields (name: 100, email: 255, description: 1000)
- ✅ Cloudflare Turnstile support (optional, behind env var)
- ✅ Safe IP extraction (x-real-ip)
- **Files**: `app/api/submit-tool/route.ts`

### 9. /go Redirect Security
- ✅ Removed 'default-secret-change-me' fallback
- ✅ Fails with 503 in production if AFFILIATE_CLICK_SECRET is missing
- ✅ Only redirects for published tools (joins tools.status='published')
- **Files**: `app/go/[slug]/route.ts`

### 10. .gitignore Security
- ✅ Added `.env`, `.env.*`, `.env.local` patterns
- ✅ Kept `!.env.example` exception
- **Files**: `.gitignore`

### 11. Legacy Files Removed
- ✅ Deleted `VISITOR_SUBSCRIBER_TABLES.sql` (contained Airtable tokens)
- ✅ Deleted `scripts/update-pat*.js` (hard-coded Airtable PATs)
- ✅ Deleted `scripts/test-pat*.js`
- **Note**: These tokens remain in git history and MUST be revoked by the owner

## 📝 Production Requirements

### Must Do Before Deploy:
1. Set `AFFILIATE_CLICK_SECRET` environment variable
2. Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
3. Set `TURNSTILE_SECRET_KEY` (optional, for Cloudflare Turnstile)
4. Revoke exposed Airtable tokens from git history
5. Consider setting up Upstash Redis for distributed rate limiting

### Recommended:
- Set `NEXT_PUBLIC_SITE_URL` for proper JSON-LD URLs
- Enable Cloudflare Turnstile on submit form
- Monitor rate limit effectiveness
- Review and adjust rate limits based on traffic patterns

## 🔍 Remaining Considerations

### npm audit Vulnerabilities
- **Production dependencies**: 1 high, 1 critical (in Next.js/PostCSS)
- **Mitigation**: Image optimization disabled, PostCSS only used at build time
- **Next steps**: Monitor for Next.js 14.2.36+ or upgrade to Next.js 15 when dependencies support React 19

### Rate Limiting
- Current implementation uses in-memory Map (single-instance only)
- For production multi-instance deployments, migrate to Upstash Redis
- Example: `@upstash/ratelimit` with `@upstash/redis`

## ✅ Security Checklist
- [x] Admin actions require authentication
- [x] Admin middleware protects routes
- [x] Next.js upgraded to latest secure version
- [x] RLS prevents status manipulation
- [x] Rate limiting on all public endpoints
- [x] API routes sanitize and validate input
- [x] JSON-LD safely serialized
- [x] Submit form has strict validation
- [x] /go redirect requires secret and published status
- [x] .gitignore covers all env files
- [x] Legacy files with secrets removed
