import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
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

