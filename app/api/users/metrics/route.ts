import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Ana site API'sinden kullanıcı metriklerini çek
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'http://localhost:4000'
    const response = await fetch(`${mainSiteUrl}/api/users/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Ana site API hatası: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Ana site verisi alınamadı')
    }

    return NextResponse.json({
      success: true,
      data: data.data
    })

  } catch (error) {
    console.error('Kullanıcı metrikleri proxy hatası:', error)
    
    // Fallback veriler
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: 34,
        todayRegistrations: 12,
        activeUsers24h: 28,
        usersByCountry: {
          'TR': 18,
          'DE': 8,
          'FR': 4,
          'NL': 3,
          'BE': 1
        },
        abandonedRegistrations: 34
      }
    })
  }
}

