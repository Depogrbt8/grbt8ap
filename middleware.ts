import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { addSecurityHeaders } from '@/lib/authMiddleware'

export async function middleware(request: NextRequest) {
  // Geçici olarak middleware tamamen devre dışı
  // Test için authentication kontrolü yapılmıyor
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
