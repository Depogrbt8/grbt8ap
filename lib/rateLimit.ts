import { NextRequest, NextResponse } from 'next/server'

// Redis client (grbt8-redis'i kullan - ana site ile aynı!)
let redis: any = null

try {
  const { Redis } = require('@upstash/redis')
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('✅ Redis connected')
  } else {
    console.log('⚠️ Redis env vars not found, using in-memory fallback')
  }
} catch (error) {
  console.log('⚠️ Redis package not available, using in-memory fallback')
}

// Fallback: Redis yoksa in-memory kullan
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const KEY_PREFIX = 'grbt8ap' // Admin panel için ayrı prefix

interface RateLimitConfig {
  windowMs: number // Zaman penceresi (ms)
  maxRequests: number // Maksimum istek sayısı
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 500, // ⬅️ Artırıldı: 100 → 500 (1000 bilet/gün desteği)
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: NextRequest) => {
    // IP adresini al, proxy varsa X-Forwarded-For header'ını kontrol et
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return ip
  }
}

export async function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function rateLimitMiddleware(req: NextRequest) {
    const key = finalConfig.keyGenerator!(req)
    const redisKey = `${KEY_PREFIX}:ratelimit:${key}` // Ayırıcı prefix
    const now = Date.now()

    let currentCount = 0
    let resetTime = now + finalConfig.windowMs

    // Redis varsa kullan, yoksa in-memory
    if (redis) {
      try {
        const record = await redis.get(redisKey) as { count: number; resetTime: number } | null
        
        if (record && record.resetTime > now) {
          currentCount = record.count
          resetTime = record.resetTime
        }

        currentCount++

        if (currentCount > finalConfig.maxRequests) {
          const retryAfter = Math.ceil((resetTime - now) / 1000)
          
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
                'X-RateLimit-Reset': resetTime.toString()
              }
            }
          )
        }

        // Redis'e kaydet
        await redis.set(redisKey, {
          count: currentCount,
          resetTime: resetTime
        }, { ex: Math.ceil(finalConfig.windowMs / 1000) })

      } catch (error) {
        console.error('Redis error, falling back to in-memory:', error)
        // Redis hatası varsa in-memory'ye fallback
        let record = rateLimitStore.get(key)
        if (!record || record.resetTime < now) {
          record = { count: 0, resetTime: now + finalConfig.windowMs }
          rateLimitStore.set(key, record)
        }
        record.count++
        currentCount = record.count
        resetTime = record.resetTime

        if (record.count > finalConfig.maxRequests) {
          const retryAfter = Math.ceil((resetTime - now) / 1000)
          return NextResponse.json(
            { error: 'Too Many Requests', message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`, retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
          )
        }
      }
    } else {
      // In-memory fallback (eski kod)
      let record = rateLimitStore.get(key)
      if (!record || record.resetTime < now) {
        record = { count: 0, resetTime: now + finalConfig.windowMs }
        rateLimitStore.set(key, record)
      }
      record.count++
      currentCount = record.count
      resetTime = record.resetTime

      if (record.count > finalConfig.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000)
        return NextResponse.json(
          { error: 'Too Many Requests', message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`, retryAfter },
          { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        )
      }
    }

    // Eski kayıtları temizle (in-memory fallback için)
    rateLimitStore.forEach((v, k) => {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    })

    // Başarılı yanıt için header'ları ekle
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (finalConfig.maxRequests - currentCount).toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
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

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // API calls
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500 // ⬅️ Artırıldı: 100 → 500
  },
  
  // Admin operations
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300 // ⬅️ Artırıldı: 50 → 300
  },
  
  // Authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // Güvenlik için aynı
  },
  
  // User operations
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200 // ⬅️ Artırıldı: 20 → 200
  },
  
  // Strict (for sensitive operations)
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10 // ⬅️ Artırıldı: 3 → 10
  }
}
