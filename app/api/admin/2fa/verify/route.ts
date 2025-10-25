import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { authenticator } from 'otplib'

// 2FA Token doğrulama endpoint'i
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, token } = body

    if (!adminId || !token) {
      return NextResponse.json({
        success: false,
        error: 'Admin ID ve token gerekli'
      }, { status: 400 })
    }

    // Admin'i database'den al
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    // 2FA etkin mi kontrol et
    if (!admin.twoFactorEnabled || !admin.twoFactorSecret) {
      return NextResponse.json({
        success: false,
        error: '2FA etkinleştirilmemiş'
      }, { status: 400 })
    }

    // 2FA token'ı doğrula
    console.log('🔐 [2FA DEBUG] Verifying token:', token)
    console.log('🔐 [2FA DEBUG] Secret:', admin.twoFactorSecret?.substring(0, 10) + '...')
    
    const isValid = authenticator.verify({
      token,
      secret: admin.twoFactorSecret
    })

    console.log('🔐 [2FA DEBUG] Verification result:', isValid)

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: '2FA kodu doğru'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz 2FA kodu'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('2FA verify hatası:', error)
    return NextResponse.json({
      success: false,
      error: '2FA doğrulama hatası: ' + error.message
    }, { status: 500 })
  }
}


