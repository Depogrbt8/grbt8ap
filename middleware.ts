import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { addSecurityHeaders } from '@/lib/authMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/api/auth',
    '/api/email/track',
    '/api/health'
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Admin paneli veya API rotaları için kontrol
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
    pathname.startsWith('/dashboard') ||
    (pathname.startsWith('/api/') && !isPublicPath)
  ) {
    // Check authentication for protected routes
    if (!isPublicPath) {
      const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET
      })

      // API endpoint'leri için
      if (pathname.startsWith('/api/')) {
        if (!token) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Unauthorized', 
              message: 'Lütfen giriş yapın' 
            },
            { status: 401 }
          )
        }

        if (token.role !== 'admin') {
          return NextResponse.json(
            { 
              success: false,
              error: 'Forbidden', 
              message: 'Admin yetkisi gereklidir' 
            },
            { status: 403 }
          )
        }
      }
      // UI sayfaları için
      else {
        if (!token) {
          return NextResponse.redirect(new URL('/', request.url))
        }

        if (token.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    }

    const response = NextResponse.next()
    return addSecurityHeaders(response)
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
