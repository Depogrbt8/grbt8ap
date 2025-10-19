import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  try {
    // Ediz admin'ini kontrol et
    const edizAdmin = await prisma.admin.findUnique({
      where: { email: 'ediz@grbt8.store' }
    })

    // Admin@grbt8.store'u da kontrol et
    const adminUser = await prisma.admin.findUnique({
      where: { email: 'admin@grbt8.store' }
    })

    // Ahmet@grbt8.store'u da kontrol et
    const ahmetAdmin = await prisma.admin.findUnique({
      where: { email: 'ahmet@grbt8.store' }
    })

    return NextResponse.json({
      success: true,
      data: {
        edizAdmin: edizAdmin ? {
          id: edizAdmin.id,
          email: edizAdmin.email,
          firstName: edizAdmin.firstName,
          lastName: edizAdmin.lastName,
          role: edizAdmin.role,
          status: edizAdmin.status,
          createdAt: edizAdmin.createdAt,
          lastLoginAt: edizAdmin.lastLoginAt
        } : null,
        adminUser: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          status: adminUser.status,
          createdAt: adminUser.createdAt,
          lastLoginAt: adminUser.lastLoginAt
        } : null,
        ahmetAdmin: ahmetAdmin ? {
          id: ahmetAdmin.id,
          email: ahmetAdmin.email,
          firstName: ahmetAdmin.firstName,
          lastName: ahmetAdmin.lastName,
          role: ahmetAdmin.role,
          status: ahmetAdmin.status,
          createdAt: ahmetAdmin.createdAt,
          lastLoginAt: ahmetAdmin.lastLoginAt
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
