import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'http://localhost:4000'
    const response = await fetch(`${mainSiteUrl}/api/security/analysis`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Ana site güvenlik analizi hatası:', errorData)
      return NextResponse.json({ 
        success: false, 
        error: errorData.error || 'Ana site güvenlik verileri alınamadı' 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Admin paneli güvenlik analizi proxy hatası:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

