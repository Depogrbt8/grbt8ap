import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Email açılma tracking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')

    if (!trackingId) {
      return new NextResponse('Tracking ID gerekli', { status: 400 })
    }

    // Email log'unu güncelle
    await prisma.emailLog.updateMany({
      where: { trackingId },
      data: { 
        status: 'opened',
        openedAt: new Date()
      }
    })

    // 1x1 pixel görüntü döndür
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    console.error('Error tracking email open:', error)
    return new NextResponse('Hata', { status: 500 })
  }
}

