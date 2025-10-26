import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { generateRandomCode } from '@/lib/authSecurity'
import { sendEmail } from '@/app/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email gerekli'
      }, { status: 400 })
    }

    console.log('🧪 TEST: Email gönderme testi başlıyor:', email)

    // Admin'i bul
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    console.log('✅ Admin bulundu:', admin.email)

    // 6 haneli kod oluştur
    const twoFactorCode = generateRandomCode(6)
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    console.log('🔐 Kod oluşturuldu:', twoFactorCode)

    // Database'e kaydet
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorSecret: twoFactorCode,
        twoFactorSetupAt: expiry
      }
    })

    console.log('💾 Database güncellendi')

    // Email gönder
    console.log('📧 Email gönderiliyor...')
    const emailResult = await sendEmail({
      to: admin.email,
      subject: 'TEST - GRBT8 Admin Panel - 2FA Doğrulama Kodunuz',
      html: `
        <p>Merhaba ${admin.firstName},</p>
        <p>TEST: Admin paneline giriş yapmak için 2FA doğrulama kodunuz:</p>
        <h2 style="color: #007bff; font-size: 32px; text-align: center; margin: 20px 0;">${twoFactorCode}</h2>
        <p>Bu kod 10 dakika boyunca geçerlidir.</p>
      `
    })

    console.log('📧 Email sonucu:', emailResult)

    if (!emailResult.success) {
      console.error('❌ Email gönderme hatası:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: 'Email gönderilemedi: ' + emailResult.error,
        debug: {
          emailResult,
          twoFactorCode
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'TEST Email başarıyla gönderildi',
      code: twoFactorCode,
      emailResult
    })

  } catch (error: any) {
    console.error('💥 TEST Hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Test hatası: ' + error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

