import { NextRequest, NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email ve isim zorunludur'
      }, { status: 400 })
    }

    // Hoşgeldin emaili gönder
    const result = await resendService.sendWelcomeEmail(email, name)

    // Email log kaydet
    try {
      await prisma.emailLog.create({
        data: {
          emailId: result.messageId,
          recipientEmail: email,
          recipientName: name,
          subject: `🎉 Hoşgeldiniz ${name} - Gurbetbiz Hesabınız Aktif!`,
          templateName: 'Hoş Geldiniz Email\'i',
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.error,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    } catch (logError) {
      console.error('Email log kaydedilemedi:', logError)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Hoşgeldin emaili ${email} adresine gönderildi`,
        data: {
          messageId: result.messageId,
          recipient: email,
          template: 'welcome'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Hoşgeldin email hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email gönderilirken hata oluştu'
    }, { status: 500 })
  }
}
