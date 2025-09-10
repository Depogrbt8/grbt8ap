import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'http://localhost:4000'
    const response = await fetch(`${mainSiteUrl}/api/flights/metrics`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error fetching flight metrics from main site:', errorData)
      return NextResponse.json({ success: false, error: errorData.error || 'Failed to fetch flight metrics from main site' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in admin panel flight metrics proxy:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

