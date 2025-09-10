import { NextRequest, NextResponse } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'

interface XSSConfig {
  allowedTags: string[]
  allowedAttributes: { [key: string]: string[] }
  allowedSchemes: string[]
  stripHtml: boolean
  maxLength: number
}

const defaultConfig: XSSConfig = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes: {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  stripHtml: false,
  maxLength: 10000
}

// HTML sanitization
export function sanitizeHTML(input: string, config: Partial<XSSConfig> = {}): string {
  const finalConfig = { ...defaultConfig, ...config }
  
  if (finalConfig.stripHtml) {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: finalConfig.allowedTags,
    ALLOWED_ATTR: Object.values(finalConfig.allowedAttributes).flat(),
    ALLOWED_URI_REGEXP: new RegExp(`^(${finalConfig.allowedSchemes.join('|')}):`, 'i')
  })
}

// Text sanitization (HTML etiketlerini kaldır)
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
    .replace(/&[^;]+;/g, '') // HTML entity'lerini kaldır
    .replace(/[<>]/g, '') // Kalan < > karakterlerini kaldır
    .trim()
}

// Input validation ve sanitization
export function sanitizeInput(input: any, type: 'string' | 'email' | 'url' | 'number' | 'html' = 'string'): any {
  if (input === null || input === undefined) {
    return null
  }

  if (typeof input === 'string') {
    // Maksimum uzunluk kontrolü
    if (input.length > defaultConfig.maxLength) {
      throw new Error(`Input too long. Maximum ${defaultConfig.maxLength} characters allowed.`)
    }

    switch (type) {
      case 'email':
        return sanitizeEmail(input)
      case 'url':
        return sanitizeURL(input)
      case 'html':
        return sanitizeHTML(input)
      case 'string':
      default:
        return sanitizeText(input)
    }
  }

  if (typeof input === 'number') {
    return isNaN(input) ? null : input
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item, type))
  }

  if (typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeText(key)] = sanitizeInput(value, type)
    }
    return sanitized
  }

  return input
}

// Email sanitization
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeText(email.toLowerCase())
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format')
  }
  
  return sanitized
}

// URL sanitization
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeText(url)
  
  try {
    const urlObj = new URL(sanitized)
    
    // Sadece güvenli protokollere izin ver
    if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
      throw new Error('Unsafe protocol')
    }
    
    return urlObj.toString()
  } catch (error) {
    throw new Error('Invalid URL format')
  }
}

// SQL Injection koruması için input escape
export function escapeSQL(input: string): string {
  return input
    .replace(/'/g, "''") // Single quote'ları escape et
    .replace(/;/g, '') // Semicolon'ları kaldır
    .replace(/--/g, '') // SQL comment'leri kaldır
    .replace(/\/\*/g, '') // Block comment başlangıcını kaldır
    .replace(/\*\//g, '') // Block comment sonunu kaldır
}

// XSS middleware
export function createXSSProtection(config: Partial<XSSConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function xssMiddleware(req: NextRequest) {
    try {
      // Request body'yi al
      const body = await req.text()
      
      if (body) {
        // JSON parse et
        const data = JSON.parse(body)
        
        // Tüm input'ları sanitize et
        const sanitizedData = sanitizeInput(data)
        
        // Sanitized data'yı request'e geri ekle
        const newRequest = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitizedData)
        })
        
        return NextResponse.next()
      }
      
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }
  }
}

// Content Security Policy header'ı oluştur
export function createCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

// Security headers ekle
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', createCSPHeader())
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions-Policy
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  return response
}

// File upload güvenliği
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Dosya boyutu kontrolü (5MB limit)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large. Maximum 5MB allowed.' }
  }
  
  // Dosya tipi kontrolü
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed.' }
  }
  
  // Dosya adı kontrolü
  const sanitizedName = sanitizeText(file.name)
  if (sanitizedName !== file.name) {
    return { isValid: false, error: 'Invalid file name.' }
  }
  
  return { isValid: true }
}

// HTML template'lerde güvenli output
export function safeHTML(template: string, data: Record<string, any>): string {
  let result = template
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`
    const sanitizedValue = typeof value === 'string' ? sanitizeHTML(value) : String(value)
    result = result.replace(new RegExp(placeholder, 'g'), sanitizedValue)
  }
  
  return result
}

