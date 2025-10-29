import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { addSecurityHeaders } from '@/lib/authMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSRF Protection: GEÇICI OLARAK TAMAMEN PASİF
  // Debug için CSRF koruması devre dışı bırakıldı

  // Public paths that don't require authentication
  const publicPaths = [
    '/api/auth',
    '/api/email/track',
    '/api/health',
    '/api/create-admin-emergency',
    '/api/auth/send-2fa-code',
    '/api/auth/verify-2fa-code'
  ]

  // Exact match için root path kontrolü - root path her zaman public
  const isRootPath = pathname === '/' || pathname === '/login'
  const isPublicPath = isRootPath || publicPaths.some(path => pathname.startsWith(path))

  // Root path için özel kontrol - session varsa dashboard'a yönlendir
  if (isRootPath) {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    // Eğer geçerli bir session varsa dashboard'a yönlendir
    if (token && (token.role === 'admin' || token.role === 'Super Admin' || token.role === 'Admin' || token.role === 'Temsilci' || token.role === 'Moderator' || token.role === 'Satış' || token.role === 'Email Yöneticisi' || token.role === 'API Yöneticisi' || token.role === 'Viewer')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Session yoksa root path'de kal
    return NextResponse.next()
  }

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
      // Vercel Cron istisnası: Backup endpoint'leri için cron header/secret varsa auth'u atla
      if (pathname.startsWith('/api/database-backup')) {
        const cronHeader = request.headers.get('x-vercel-cron')
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET
        const cronAuthorized = !!cronHeader || (cronSecret && authHeader === `Bearer ${cronSecret}`)
        if (cronAuthorized) {
          const response = NextResponse.next()
          return addSecurityHeaders(response)
        }
      }

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

        if (token.role !== 'admin' && token.role !== 'Super Admin' && token.role !== 'Admin' && token.role !== 'Temsilci' && token.role !== 'Moderator' && token.role !== 'Satış' && token.role !== 'Email Yöneticisi' && token.role !== 'API Yöneticisi' && token.role !== 'Viewer') {
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

        if (token.role !== 'admin' && token.role !== 'Super Admin' && token.role !== 'Admin' && token.role !== 'Temsilci' && token.role !== 'Moderator' && token.role !== 'Satış' && token.role !== 'Email Yöneticisi' && token.role !== 'API Yöneticisi' && token.role !== 'Viewer') {
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
