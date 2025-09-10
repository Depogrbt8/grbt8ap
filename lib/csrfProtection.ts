import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// CSRF token store (production'da Redis kullanılmalı)
const csrfTokens = new Map<string, { token: string; expires: number }>()

interface CSRFConfig {
  tokenLength: number
  tokenExpiry: number // ms
  cookieName: string
  headerName: string
  skipMethods: string[]
}

const defaultConfig: CSRFConfig = {
  tokenLength: 32,
  tokenExpiry: 60 * 60 * 1000, // 1 saat
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  skipMethods: ['GET', 'HEAD', 'OPTIONS']
}

export function createCSRFProtection(config: Partial<CSRFConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function csrfMiddleware(req: NextRequest) {
    // Skip methods için kontrol
    if (finalConfig.skipMethods.includes(req.method)) {
      return NextResponse.next()
    }

    // CSRF token'ı al
    const tokenFromHeader = req.headers.get(finalConfig.headerName)
    const tokenFromCookie = req.cookies.get(finalConfig.cookieName)?.value

    // Token yoksa hata
    if (!tokenFromHeader && !tokenFromCookie) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    const token = tokenFromHeader || tokenFromCookie

    // Token'ı doğrula
    if (!token || !isValidCSRFToken(token)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

// CSRF token oluştur
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

// CSRF token'ı kaydet
export function storeCSRFToken(sessionId: string, token: string): void {
  const expires = Date.now() + (60 * 60 * 1000) // 1 saat
  csrfTokens.set(sessionId, { token, expires })
  
  // Eski token'ları temizle
  cleanupExpiredTokens()
}

// CSRF token'ı doğrula
export function isValidCSRFToken(token: string): boolean {
  // Token formatını kontrol et
  if (!token || typeof token !== 'string' || token.length !== 64) {
    return false
  }

  // Token'ın geçerli olup olmadığını kontrol et
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.token === token && data.expires > Date.now()) {
      return true
    }
  }

  return false
}

// Eski token'ları temizle
function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires <= now) {
      csrfTokens.delete(sessionId)
    }
  }
}

// CSRF token'ı response'a ekle
export function addCSRFTokenToResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 // 1 saat
  })
  
  return response
}

// CSRF token'ı form'a ekle (client-side için)
export function getCSRFTokenScript(): string {
  return `
    <script>
      // CSRF token'ı al ve form'lara ekle
      function addCSRFTokenToForms() {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrf-token='))
          ?.split('=')[1];
        
        if (token) {
          // Tüm form'lara hidden input ekle
          const forms = document.querySelectorAll('form');
          forms.forEach(form => {
            if (!form.querySelector('input[name="csrf-token"]')) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'csrf-token';
              input.value = token;
              form.appendChild(input);
            }
          });
          
          // AJAX isteklerine header ekle
          const originalFetch = window.fetch;
          window.fetch = function(url, options = {}) {
            options.headers = {
              ...options.headers,
              'X-CSRF-Token': token
            };
            return originalFetch(url, options);
          };
        }
      }
      
      // Sayfa yüklendiğinde çalıştır
      document.addEventListener('DOMContentLoaded', addCSRFTokenToForms);
    </script>
  `
}

// CSRF token'ı API response'unda döndür
export function createCSRFResponse(token: string): NextResponse {
  const response = NextResponse.json({ csrfToken: token })
  return addCSRFTokenToResponse(response, token)
}

