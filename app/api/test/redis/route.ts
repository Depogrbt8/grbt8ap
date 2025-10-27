import { NextRequest, NextResponse } from 'next/server'

// Redis test endpoint - NO AUTH (for testing only)
export async function GET() {
  try {
    const { Redis } = require('@upstash/redis')
    
    const testKey = 'grbt8ap:test'
    const testValue = Date.now().toString()
    
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        success: false,
        status: 'No Redis credentials',
        message: 'Redis environment variables not found'
      })
    }
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
    })
    
    // Test write
    await redis.set(testKey, testValue)
    
    // Test read
    const readValue = await redis.get(testKey)
    
    // Test rate limit key
    const rateLimitKeys = await redis.keys('grbt8ap:ratelimit:*')
    
    // Cleanup
    await redis.del(testKey)
    
    return NextResponse.json({
      success: true,
      status: 'Redis working',
      test: {
        write: testValue,
        read: readValue,
        match: testValue === readValue
      },
      rateLimitKeys: rateLimitKeys.length,
      environment: {
        url_exists: !!process.env.UPSTASH_REDIS_REST_URL,
        token_exists: !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'Redis error',
      error: error.message,
      stack: error.stack,
      environment: {
        url: process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET',
        token: process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'NOT SET'
      }
    }, { status: 500 })
  }
}

