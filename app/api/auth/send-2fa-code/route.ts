import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
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

    // Admin'i bul
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    // Admin bulunamazsa veya 2FA etkin değilse
    if (!admin || !admin.twoFactorEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı veya 2FA etkin değil'
      }, { status: 404 })
    }

    // 6 haneli kod oluştur
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 dakika

    // Kodu database'e kaydet (geçici olarak)
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorSecret: code, // Geçici kod
        twoFactorSetupAt: expiresAt as any // Expiry
      }
    })

    // Email gönder
    await sendEmail({
      to: email,
      subject: '🔐 Admin Panel 2FA Kodu',
      html: `
        <h2>2FA Kodu</h2>
        <p>Giriş için 2FA kodunuz:</p>
        <h1 style="font-size: 36px; color: #0066cc;">${code}</h1>
        <p>Bu kod 10 dakika içinde geçerlidir.</p>
        <p>Eğer bu işlemi siz yapmadıysanız, lütfen admin ile iletişime geçin.</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: '2FA kodu email\'e gönderildi'
    })

  } catch (error) {
    console.error('2FA kod gönderme hatası:', error)
    return NextResponse.json({
      success: false,
      error: '2FA kodu gönderilemedi: ' + error.message
    }, { status: 500 })
  }
}

