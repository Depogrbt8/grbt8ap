import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'
import { enableTwoFactor, generateTwoFactorQRCode } from '@/lib/authSecurity'

// 2FA Setup endpoint'i
export async function POST(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json({
        success: false,
        error: 'Admin ID gerekli'
      }, { status: 400 })
    }

    // Admin'i bul
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    // 2FA'yı etkinleştir
    const { secret, qrCode } = enableTwoFactor(adminId)

    // Database'de 2FA'yı aktif et
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorSetupAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA başarıyla etkinleştirildi',
      data: {
        qrCode,
        secret,
        backupCodes: [] // TODO: Backup codes ekle
      }
    })

  } catch (error) {
    console.error('2FA setup hatası:', error)
    return NextResponse.json({
      success: false,
      error: '2FA etkinleştirilemedi: ' + error.message
    }, { status: 500 })
  }
}

// 2FA'yı devre dışı bırak
export async function DELETE(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json({
        success: false,
        error: 'Admin ID gerekli'
      }, { status: 400 })
    }

    // Database'de 2FA'yı devre dışı bırak
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorSetupAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA başarıyla devre dışı bırakıldı'
    })

  } catch (error) {
    console.error('2FA disable hatası:', error)
    return NextResponse.json({
      success: false,
      error: '2FA devre dışı bırakılamadı: ' + error.message
    }, { status: 500 })
  }
}


