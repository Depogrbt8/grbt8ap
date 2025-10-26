import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createLog } from '@/lib/logger'

// Rate limiting store for API calls
const apiRateLimit = new Map<string, { count: number; resetTime: number }>()

interface AuthUser {
  id: string
  email: string
  role: string
  status: string
}

// Get user from JWT token
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token || !token.sub || !token.role || !token.status) {
      return null
    }

    // Check if user status is active
    if (token.status !== 'active') {
      return null
    }

    return {
      id: token.sub,
      email: token.email as string,
      role: token.role as string,
      status: token.status as string
    }
  } catch (error) {
    console.error('getAuthUser error:', error)
    return null
  }
}

// Require authentication for API routes
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (!user) {
    await createLog({
      level: 'warn',
      message: 'Unauthenticated API access attempt',
      category: 'security',
      metadata: {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized', 
        message: 'Lütfen giriş yapın' 
      },
      { status: 401 }
    )
  }

  return null // No error, user is authenticated
}

// Require admin role for API routes
export async function requireAdmin(request: NextRequest) {
  // Rate limiting kontrolü (15 dakikada 50 istek)
  const rateLimitError = checkApiRateLimit(request, 50, 15 * 60 * 1000)
  if (rateLimitError) {
    return rateLimitError
  }

  const authError = await requireAuth(request)
  if (authError) {
    return authError
  }

  const user = await getAuthUser(request)
  
  if (!user || (user.role !== 'admin' && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Temsilci' && user.role !== 'Moderator' && user.role !== 'Satış' && user.role !== 'Email Yöneticisi' && user.role !== 'API Yöneticisi' && user.role !== 'Viewer')) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Forbidden', 
        message: 'Admin yetkisi gereklidir' 
      },
      { status: 403 }
    )
  }

  return null // No error, user is admin
}

// Rate limiting for API calls
export function checkApiRateLimit(request: NextRequest, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  const key = `api:${ip}:${request.nextUrl.pathname}`
  
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean old entries
  const keys = Array.from(apiRateLimit.keys())
  for (const key of keys) {
    const record = apiRateLimit.get(key)
    if (record && record.resetTime < windowStart) {
      apiRateLimit.delete(key)
    }
  }
  
  const current = apiRateLimit.get(key)
  
  if (!current) {
    apiRateLimit.set(key, { count: 1, resetTime: now })
    return null // No rate limit exceeded
  }
  
  if (current.count >= maxRequests) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Too Many Requests', 
        message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' 
      },
      { status: 429 }
    )
  }
  
  current.count++
  return null // No rate limit exceeded
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.github.com https://www.grbt8.store https://anasite.grbt8.store",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  return response
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item))
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}
