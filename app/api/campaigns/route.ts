import { NextRequest, NextResponse } from 'next/server'

// CORS middleware
function corsMiddleware(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return corsMiddleware(response)
}

// GET - Kampanya listesi (devre dışı)
export async function GET() {
  const response = NextResponse.json(
    { success: false, error: 'Campaigns API is disabled' },
    { status: 410 }
  )
  return corsMiddleware(response)
}

// POST - Yeni kampanya oluştur (devre dışı)
export async function POST(_request: NextRequest) {
  const response = NextResponse.json(
    { success: false, error: 'Campaigns API is disabled' },
    { status: 410 }
  )
  return corsMiddleware(response)
}

// PUT - Kampanya güncelle (devre dışı)
export async function PUT(_request: NextRequest) {
  const response = NextResponse.json(
    { success: false, error: 'Campaigns API is disabled' },
    { status: 410 }
  )
  return corsMiddleware(response)
}
