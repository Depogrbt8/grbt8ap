import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin, getAuthUser } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  try {
    // 🔒 Admin yetkisi kontrolü
    const adminCheck = await requireAdmin(request)
    if (adminCheck) return adminCheck

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        createdBy: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: `${admin.firstName} ${admin.lastName}`,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      lastLogin: admin.lastLoginAt 
        ? new Date(admin.lastLoginAt).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Henüz giriş yapmadı',
      createdAt: admin.createdAt.toLocaleDateString('tr-TR'),
      createdBy: admin.creator ? `${admin.creator.firstName} ${admin.creator.lastName}` : 'Sistem'
    }))

    return NextResponse.json({
      success: true,
      data: formattedAdmins
    })

  } catch (error) {
    console.error('Admin listesi alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin listesi alınamadı'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 Admin yetkisi kontrolü
    const adminCheck = await requireAdmin(request)
    if (adminCheck) return adminCheck

    // 🔒 Sadece Super Admin yeni admin oluşturabilir
    const user = await getAuthUser(request)
    if (user?.role !== 'Super Admin') {
      return NextResponse.json({
        success: false,
        error: 'Sadece Super Admin yeni admin oluşturabilir'
      }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, password, role, permissions } = body

    // Email kontrolü
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Bu email adresi zaten kullanılıyor'
      }, { status: 400 })
    }

    // Şifre hash'leme
    const hashedPassword = await bcrypt.hash(password, 12)

    // Admin oluştur
    const admin = await prisma.admin.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'Admin',
        permissions: permissions || {}
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...admin,
        name: `${admin.firstName} ${admin.lastName}`,
        createdAt: admin.createdAt.toLocaleDateString('tr-TR')
      },
      message: 'Admin başarıyla oluşturuldu'
    })

  } catch (error) {
    console.error('Admin oluşturulamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin oluşturulamadı'
    }, { status: 500 })
  }
}
