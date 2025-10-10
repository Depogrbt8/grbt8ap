import { NextRequest, NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, name, payload } = body

    if (!type || !email) {
      return NextResponse.json({ success: false, error: 'type ve email zorunlu' }, { status: 400 })
    }

    let result: any
    switch (type) {
      case 'welcome':
        result = await resendService.sendWelcomeEmail(email, name || 'Kullanıcı')
        break
      case 'reservation_confirmation':
        result = await resendService.sendReservationConfirmation(email, name || 'Misafir', payload || {})
        break
      default:
        return NextResponse.json({ success: false, error: 'Desteklenmeyen tür' }, { status: 400 })
    }

    if (!result?.success) {
      return NextResponse.json({ success: false, error: result?.error || 'Gönderim başarısız' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { messageId: result.messageId } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Hata' }, { status: 500 })
  }
}


