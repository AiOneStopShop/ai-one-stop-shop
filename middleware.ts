import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  CRON_CLEANUP_PATH,
  disallowAllRobotsTxt,
  isCanonicalHost,
  shouldBlockProductionAlias,
} from '@/lib/site-config'
import { buildCsp, generateNonce, isCrossOriginServerAction } from '@/lib/csp'

function hostOf(request: NextRequest): string | null {
  return request.headers.get('host')
}

function withNonCanonicalRobots(response: NextResponse, host: string | null): NextResponse {
  if (!isCanonicalHost(host)) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }
  return response
}

async function continueRequest(request: NextRequest, requestHeaders: Headers): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Fail closed without a database: no session can exist, so go to the login page (which explains it).
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    let response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            requestHeaders.set('cookie', request.cookies.toString())
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options })
            requestHeaders.set('cookie', request.cookies.toString())
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      const url = new URL('/admin/login', request.url);
      const nextParam = request.nextUrl.searchParams.get('next');
      if (nextParam) {
        url.searchParams.set('next', nextParam);
      }
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = new URL('/admin/login', request.url);
      const nextParam = request.nextUrl.searchParams.get('next');
      if (nextParam) {
        url.searchParams.set('next', nextParam);
      }
      return NextResponse.redirect(url);
    }

    return response
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export async function middleware(request: NextRequest) {
  const host = hostOf(request)
  const { pathname } = request.nextUrl

  // Cross-origin server-action POSTs: answer 403 instead of letting Next throw a 500.
  if (isCrossOriginServerAction({ method: request.method, headers: request.headers, host: request.nextUrl.host })) {
    return new NextResponse(null, { status: 403 })
  }

  if (shouldBlockProductionAlias(process.env.VERCEL_ENV, host, pathname)) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  if (pathname === '/robots.txt' && !isCanonicalHost(host)) {
    return new NextResponse(disallowAllRobotsTxt(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  if (pathname === CRON_CLEANUP_PATH) {
    return withNonCanonicalRobots(NextResponse.next(), host)
  }

  // Per-request nonce CSP. Next.js reads the nonce from the request's CSP header
  // and adds it to its own scripts; app/layout.tsx reads x-nonce for ours.
  const nonce = generateNonce()
  const csp = buildCsp(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = await continueRequest(request, requestHeaders)
  response.headers.set('Content-Security-Policy', csp)
  return withNonCanonicalRobots(response, host)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
