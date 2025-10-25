import { NextRequest, NextResponse } from 'next/server'
import { verifyTwoFactorToken } from '@/lib/authSecurity'

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

    // 2FA token'ı doğrula
    const isValid = verifyTwoFactorToken(adminId, token)

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


