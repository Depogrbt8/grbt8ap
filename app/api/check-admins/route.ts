import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Ahmet admin'ini kontrol et
    const ahmetAdmin = await prisma.admin.findUnique({
      where: { email: 'ahmet@grbt8.store' }
    })

    // Admin@grbt8.store'u da kontrol et
    const adminUser = await prisma.admin.findUnique({
      where: { email: 'admin@grbt8.store' }
    })

    return NextResponse.json({
      success: true,
      data: {
        ahmetAdmin: ahmetAdmin ? {
          id: ahmetAdmin.id,
          email: ahmetAdmin.email,
          firstName: ahmetAdmin.firstName,
          lastName: ahmetAdmin.lastName,
          role: ahmetAdmin.role,
          status: ahmetAdmin.status,
          createdAt: ahmetAdmin.createdAt
        } : null,
        adminUser: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          status: adminUser.status,
          createdAt: adminUser.createdAt
        } : null
      }
    })

  } catch (error) {
    console.error('Admin kontrol hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin kontrol edilemedi: ' + error.message
    }, { status: 500 })
  }
}
