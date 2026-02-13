import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authMiddleware'

/**
 * GET: Araç rezervasyonlarını ana siteden çek (admin proxy)
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app'

    const response = await fetch(
      `${mainSiteUrl}/api/cars/bookings?${searchParams.toString()}`,
      {
        headers: {
          'x-admin-panel-token': process.env.ADMIN_PANEL_SECRET || '',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Ana site araç rezervasyonları yanıt vermedi:', response.status, text)
      return NextResponse.json(
        { success: false, error: 'Araç rezervasyonları yüklenemedi', data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } },
        { status: 200 }
      )
    }

    const data = await response.json()

    if (data.success && data.data && !Array.isArray(data.data) && Array.isArray(data.data.bookings)) {
      return NextResponse.json({
        success: true,
        data: data.data.bookings,
        pagination: data.data.pagination,
      })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Admin panel araç rezervasyonları proxy hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Araç rezervasyonları yüklenirken hata oluştu',
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      },
      { status: 200 }
    )
  }
}
