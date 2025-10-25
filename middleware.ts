import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { addSecurityHeaders } from '@/lib/authMiddleware'
import { prisma } from '@/app/lib/prisma'

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
    '/api/admin/2fa' // 2FA setup ve verify endpoint'leri
  ]

  // 2FA setup path'i public olsun
  const is2FASetupPath = pathname === '/setup/2fa'

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

        // Dashboard'a erişim kontrolü - 2FA setup kontrolü
        if (pathname === '/dashboard' && token.sub) {
          try {
            const admin = await prisma.admin.findUnique({
              where: { id: token.sub },
              select: { twoFactorEnabled: true }
            })

            // Eğer 2FA setup sayfasına gidiyorsa izin ver
            if (!is2FASetupPath && !admin?.twoFactorEnabled) {
              // 2FA kurulmamışsa setup sayfasına yönlendir
              return NextResponse.redirect(new URL('/setup/2fa', request.url))
            }
          } catch (error) {
            console.error('2FA check error:', error)
          }
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
