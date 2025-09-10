import { NextRequest, NextResponse } from 'next/server'
import config from './config'

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = config.cors.allowedOrigins

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers })
  }

  return headers
}

export function withCors(handler: Function) {
  return async (request: NextRequest) => {
    const headers = corsMiddleware(request)
    
    try {
      const response = await handler(request)
      
      // Add CORS headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500, headers }
      )
    }
  }
}




