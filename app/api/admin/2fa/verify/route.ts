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

    // 2FA secret var mı kontrol et (setup yapıldıysa)
    if (!admin.twoFactorSecret) {
      return NextResponse.json({
        success: false,
        error: '2FA setup yapılmamış'
      }, { status: 400 })
    }

    // Eğer 2FA henüz etkin değilse, setup aşamasındayız demektir
    const isSetupMode = !admin.twoFactorEnabled

    // 2FA token'ı doğrula
    console.log('🔐 [2FA DEBUG] Verifying token:', token)
    console.log('🔐 [2FA DEBUG] Secret:', admin.twoFactorSecret?.substring(0, 10) + '...')
    console.log('🔐 [2FA DEBUG] Current time:', new Date())
    
    const isValid = authenticator.verify({
      token,
      secret: admin.twoFactorSecret
    })

    console.log('🔐 [2FA DEBUG] Verification result:', isValid)
    
    // Eğer başarısız olduysa, doğru token'ı da logla
    if (!isValid) {
      const correctToken = authenticator.generate(admin.twoFactorSecret)
      console.log('🔐 [2FA DEBUG] Expected token:', correctToken)
    }

    if (isValid) {
      // Eğer setup modundaysa, 2FA'yı aktif et
      if (isSetupMode) {
        await prisma.admin.update({
          where: { id: adminId },
          data: {
            twoFactorEnabled: true,
            twoFactorSetupAt: new Date()
          }
        })
        
        console.log('✅ [2FA DEBUG] 2FA başarıyla aktif edildi')
      }
      
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


