import { NextRequest, NextResponse } from 'next/server'

interface ExternalApi {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  timeout: number
  enabled: boolean
  lastTest?: string
  status?: 'online' | 'offline' | 'error'
  responseTime?: number
}

// Dış API'ler (gerçek uygulamada veritabanından gelecek)
let externalApis: ExternalApi[] = [
  {
    id: 'biletdukkani',
    name: 'BiletDukkani API',
    baseUrl: 'https://api.biletdukkani.com',
    apiKey: process.env.BILETDUKKANI_API_KEY,
    timeout: 10000,
    enabled: true
  },
  {
    id: 'thy',
    name: 'THY API',
    baseUrl: 'https://api.thy.com',
    apiKey: process.env.THY_API_KEY,
    timeout: 15000,
    enabled: true
  },
  {
    id: 'pegasus',
    name: 'Pegasus API',
    baseUrl: 'https://api.pegasus.com.tr',
    apiKey: process.env.PEGASUS_API_KEY,
    timeout: 12000,
    enabled: false
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'list') {
      return NextResponse.json({
        success: true,
        data: externalApis
      })
    }

    if (action === 'test') {
      const apiId = searchParams.get('id')
      if (!apiId) {
        return NextResponse.json({
          success: false,
          error: 'API ID gerekli'
        }, { status: 400 })
      }

      const api = externalApis.find(a => a.id === apiId)
      if (!api) {
        return NextResponse.json({
          success: false,
          error: 'API bulunamadı'
        }, { status: 404 })
      }

      // API test et
      const startTime = Date.now()
      try {
        const response = await fetch(`${api.baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(api.apiKey && { 'Authorization': `Bearer ${api.apiKey}` })
          },
          signal: AbortSignal.timeout(api.timeout)
        })

        const responseTime = Date.now() - startTime

        if (response.ok) {
          // API durumunu güncelle
          const apiIndex = externalApis.findIndex(a => a.id === apiId)
          if (apiIndex !== -1) {
            externalApis[apiIndex] = {
              ...externalApis[apiIndex],
              status: 'online',
              lastTest: new Date().toISOString(),
              responseTime
            }
          }

          return NextResponse.json({
            success: true,
            status: 'online',
            responseTime,
            message: 'API çevrimiçi'
          })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error: any) {
        const responseTime = Date.now() - startTime
        
        // API durumunu güncelle
        const apiIndex = externalApis.findIndex(a => a.id === apiId)
        if (apiIndex !== -1) {
          externalApis[apiIndex] = {
            ...externalApis[apiIndex],
            status: 'error',
            lastTest: new Date().toISOString(),
            responseTime
          }
        }

        return NextResponse.json({
          success: false,
          status: 'error',
          responseTime,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz işlem'
    }, { status: 400 })

  } catch (error) {
    console.error('Dış API yönetimi hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'add') {
      const body = await request.json()
      const { name, baseUrl, apiKey, timeout } = body

      if (!name || !baseUrl) {
        return NextResponse.json({
          success: false,
          error: 'API adı ve URL gerekli'
        }, { status: 400 })
      }

      const newApi: ExternalApi = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        baseUrl,
        apiKey,
        timeout: timeout || 10000,
        enabled: true
      }

      externalApis.push(newApi)

      return NextResponse.json({
        success: true,
        data: newApi,
        message: 'API başarıyla eklendi'
      })
    }

    if (action === 'toggle') {
      const apiId = searchParams.get('id')
      if (!apiId) {
        return NextResponse.json({
          success: false,
          error: 'API ID gerekli'
        }, { status: 400 })
      }

      const apiIndex = externalApis.findIndex(a => a.id === apiId)
      if (apiIndex === -1) {
        return NextResponse.json({
          success: false,
          error: 'API bulunamadı'
        }, { status: 404 })
      }

      externalApis[apiIndex].enabled = !externalApis[apiIndex].enabled

      return NextResponse.json({
        success: true,
        data: externalApis[apiIndex],
        message: `API ${externalApis[apiIndex].enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz işlem'
    }, { status: 400 })

  } catch (error) {
    console.error('Dış API yönetimi hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}
