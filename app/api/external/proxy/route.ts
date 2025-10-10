import { NextRequest, NextResponse } from 'next/server'

interface ExternalApiConfig {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  headers?: Record<string, string>
  timeout?: number
  enabled: boolean
}

// Dış API konfigürasyonları
const externalApis: ExternalApiConfig[] = [
  {
    id: 'biletdukkani',
    name: 'BiletDukkani API',
    baseUrl: 'https://api.biletdukkani.com',
    apiKey: process.env.BILETDUKKANI_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
    enabled: true
  },
  {
    id: 'thy',
    name: 'THY API',
    baseUrl: 'https://api.thy.com',
    apiKey: process.env.THY_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 15000,
    enabled: true
  },
  {
    id: 'pegasus',
    name: 'Pegasus API',
    baseUrl: 'https://api.pegasus.com.tr',
    apiKey: process.env.PEGASUS_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 12000,
    enabled: false
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiId = searchParams.get('api')
    const endpoint = searchParams.get('endpoint')
    const method = searchParams.get('method') || 'GET'

    if (!apiId || !endpoint) {
      return NextResponse.json({
        success: false,
        error: 'API ID ve endpoint gerekli'
      }, { status: 400 })
    }

    const apiConfig = externalApis.find(api => api.id === apiId)
    if (!apiConfig) {
      return NextResponse.json({
        success: false,
        error: 'API konfigürasyonu bulunamadı'
      }, { status: 404 })
    }

    if (!apiConfig.enabled) {
      return NextResponse.json({
        success: false,
        error: 'API devre dışı'
      }, { status: 503 })
    }

    // Dış API'ye istek gönder
    const url = `${apiConfig.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      ...apiConfig.headers
    }

    if (apiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

    try {
      const response = await fetch(url, {
        method: method as any,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `API hatası: ${response.status} ${response.statusText}`,
          apiId,
          endpoint
        }, { status: response.status })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        data,
        apiId,
        endpoint,
        timestamp: new Date().toISOString()
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'API zaman aşımı',
          apiId,
          endpoint
        }, { status: 408 })
      }

      return NextResponse.json({
        success: false,
        error: error.message,
        apiId,
        endpoint
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Dış API proxy hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiId = searchParams.get('api')
    const endpoint = searchParams.get('endpoint')

    if (!apiId || !endpoint) {
      return NextResponse.json({
        success: false,
        error: 'API ID ve endpoint gerekli'
      }, { status: 400 })
    }

    const apiConfig = externalApis.find(api => api.id === apiId)
    if (!apiConfig) {
      return NextResponse.json({
        success: false,
        error: 'API konfigürasyonu bulunamadı'
      }, { status: 404 })
    }

    if (!apiConfig.enabled) {
      return NextResponse.json({
        success: false,
        error: 'API devre dışı'
      }, { status: 503 })
    }

    const body = await request.json()
    const url = `${apiConfig.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      ...apiConfig.headers
    }

    if (apiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `API hatası: ${response.status} ${response.statusText}`,
          apiId,
          endpoint
        }, { status: response.status })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        data,
        apiId,
        endpoint,
        timestamp: new Date().toISOString()
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'API zaman aşımı',
          apiId,
          endpoint
        }, { status: 408 })
      }

      return NextResponse.json({
        success: false,
        error: error.message,
        apiId,
        endpoint
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Dış API proxy hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}
