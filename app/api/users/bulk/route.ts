import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin, getAuthUser } from '@/lib/authMiddleware'

export async function PUT(request: NextRequest) {
  try {
    // 🔒 Admin yetkisi kontrolü (Double check)
    const adminCheck = await requireAdmin(request)
    if (adminCheck) return adminCheck

    // 🔒 Güvenlik logu
    const user = await getAuthUser(request)
    await prisma.systemLog.create({
      data: {
        level: 'warn',
        message: `Bulk user update attempt - Admin: ${user?.email}`,
        source: 'bulk_api',
        userId: user?.id,
        metadata: JSON.stringify({ 
          ip: request.ip || request.headers.get('x-forwarded-for'),
          userAgent: request.headers.get('user-agent')
        })
      }
    })

    const body = await request.json()
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçersiz parametreler' 
        },
        { status: 400 }
      )
    }

    let updateData = {}
    let message = ''

    switch (action) {
      case 'activate':
        updateData = { status: 'active' }
        message = 'Kullanıcılar aktif yapıldı'
        break
        
      case 'deactivate':
        updateData = { status: 'inactive' }
        message = 'Kullanıcılar pasif yapıldı'
        break
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Geçersiz işlem' 
          },
          { status: 400 }
        )
    }

    // Kullanıcıları güncelle
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} ${message}`,
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Toplu güncelleme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Toplu güncelleme başarısız' 
      },
      { status: 500 }
    )
  }
}

