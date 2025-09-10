import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin paneli veya ilgili rotalar için kontrol
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/ayarlar') ||
    pathname.startsWith('/dis-apiler') ||
    pathname.startsWith('/email') ||
    pathname.startsWith('/apiler') ||
    pathname.startsWith('/kampanyalar') ||
    pathname.startsWith('/kullanici') ||
    pathname.startsWith('/sistem') ||
    pathname.startsWith('/raporlar') ||
    pathname.startsWith('/istatistikler') ||
    pathname.startsWith('/rezervasyonlar') ||
    pathname.startsWith('/ucuslar') ||
    pathname.startsWith('/odemeler') ||
    pathname.startsWith('/api/')
  ) {
    const response = NextResponse.next()
    
    // SEO güvenlik headers'larını ekle
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'no-referrer')

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
