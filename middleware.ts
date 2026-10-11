import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  CRON_CLEANUP_PATH,
  disallowAllRobotsTxt,
  isCanonicalHost,
  shouldBlockProductionAlias,
} from '@/lib/site-config'

function hostOf(request: NextRequest): string | null {
  return request.headers.get('host')
}

function withNonCanonicalRobots(response: NextResponse, host: string | null): NextResponse {
  if (!isCanonicalHost(host)) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }
  return response
}

async function continueRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
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
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return response
  }

  return NextResponse.next()
}

export async function middleware(request: NextRequest) {
  const host = hostOf(request)
  const { pathname } = request.nextUrl

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

  const response = await continueRequest(request)
  return withNonCanonicalRobots(response, host)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
