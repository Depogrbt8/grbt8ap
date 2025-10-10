import { NextRequest, NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, reservationData } = body

    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email ve isim zorunludur'
      }, { status: 400 })
    }

    // Rezervasyon onay emaili gönder
    const result = await resendService.sendReservationConfirmation(email, name, reservationData || {})

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Rezervasyon onay emaili ${email} adresine gönderildi`,
        data: {
          messageId: result.messageId,
          recipient: email,
          template: 'reservation',
          reservationNumber: reservationData?.reservationNumber || 'RES-' + Date.now()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Rezervasyon email hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email gönderilirken hata oluştu'
    }, { status: 500 })
  }
}
