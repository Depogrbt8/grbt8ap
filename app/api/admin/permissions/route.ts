import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Admin bilgilerini ve yetkilerini getir
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
      select: {
        permissions: true
      }
    })

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      permissions: admin.permissions
    })

  } catch (error) {
    console.error('Admin yetkileri alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin yetkileri alınamadı'
    }, { status: 500 })
  }
}
