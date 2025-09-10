import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (production'da Redis kullanılmalı)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Zaman penceresi (ms)
  maxRequests: number // Maksimum istek sayısı
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 100, // 100 istek
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: NextRequest) => {
    // IP adresini al, proxy varsa X-Forwarded-For header'ını kontrol et
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return ip
  }
}

export function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function rateLimitMiddleware(req: NextRequest) {
    const key = finalConfig.keyGenerator!(req)
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    // Eski kayıtları temizle
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    // Mevcut kaydı al veya oluştur
    let record = rateLimitStore.get(key)
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + finalConfig.windowMs }
      rateLimitStore.set(key, record)
    }

    // İstek sayısını artır
    record.count++

    // Rate limit kontrolü
    if (record.count > finalConfig.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      )
    }

    // Başarılı yanıt için header'ları ekle
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (finalConfig.maxRequests - record.count).toString())
    response.headers.set('X-RateLimit-Reset', record.resetTime.toString())

    return response
  }
}

// Önceden tanımlanmış rate limit konfigürasyonları
export const rateLimitConfigs = {
  // Genel API rate limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 100
  },
  
  // Login sayfası için sıkı rate limit
  login: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 5 // 5 başarısız deneme
  },
  
  // Ödeme sayfası için çok sıkı rate limit
  payment: {
    windowMs: 5 * 60 * 1000, // 5 dakika
    maxRequests: 3 // 3 deneme
  },
  
  // Admin paneli için orta seviye rate limit
  admin: {
    windowMs: 10 * 60 * 1000, // 10 dakika
    maxRequests: 50
  },
  
  // Kayıt sayfası için sıkı rate limit
  register: {
    windowMs: 60 * 60 * 1000, // 1 saat
    maxRequests: 3 // 3 kayıt denemesi
  }
}

// Yardımcı fonksiyon: Rate limit durumunu kontrol et
export function checkRateLimit(key: string, config: RateLimitConfig): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < now) {
    return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs }
  }
  
  return {
    allowed: record.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime
  }
}

