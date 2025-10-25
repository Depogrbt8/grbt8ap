import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({
        success: false,
        error: 'Email ve kod gerekli'
      }, { status: 400 })
    }

    // Admin'i bul
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin || !admin.twoFactorEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı veya 2FA etkin değil'
      }, { status: 404 })
    }

    // Kod kontrolü
    if (admin.twoFactorSecret !== code) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz 2FA kodu'
      }, { status: 400 })
    }

    // Süre kontrolü (10 dakika)
    if (admin.twoFactorSetupAt) {
      const expiry = new Date(admin.twoFactorSetupAt)
      const now = new Date()
      
      if (now > expiry) {
        return NextResponse.json({
          success: false,
          error: '2FA kodu süresi dolmuş'
        }, { status: 400 })
      }
    }

    // Kod doğru, secret'i temizle
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorSecret: null,
        twoFactorSetupAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA kodu doğru'
    })

  } catch (error) {
    console.error('2FA kod doğrulama hatası:', error)
    return NextResponse.json({
      success: false,
      error: '2FA kod doğrulanamadı: ' + error.message
    }, { status: 500 })
  }
}

