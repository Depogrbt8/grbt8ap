import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Email tıklama tracking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')
    const url = searchParams.get('url')

    if (!trackingId || !url) {
      return new NextResponse('Tracking ID ve URL gerekli', { status: 400 })
    }

    // Email log'unu güncelle
    await prisma.emailLog.updateMany({
      where: { trackingId },
      data: { 
        status: 'clicked',
        clickedAt: new Date()
      }
    })

    // URL'e yönlendir
    return NextResponse.redirect(url)

  } catch (error: any) {
    console.error('Error tracking email click:', error)
    return new NextResponse('Hata', { status: 500 })
  }
}

