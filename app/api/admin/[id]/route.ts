import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true
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
      data: {
        ...admin,
        name: `${admin.firstName} ${admin.lastName}`,
        createdAt: admin.createdAt.toLocaleDateString('tr-TR'),
        lastLoginAt: admin.lastLoginAt 
          ? new Date(admin.lastLoginAt).toLocaleDateString('tr-TR')
          : null
      }
    })

  } catch (error) {
    console.error('Admin detayı alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin detayı alınamadı'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, role, status, permissions } = body

    // Mevcut admin kontrolü
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    // Email kontrolü (kendi email'i hariç)
    if (email !== existingAdmin.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        }, { status: 400 })
      }
    }

    // Güncelleme verisi hazırla
    const updateData: any = {
      firstName,
      lastName,
      email,
      role,
      status,
      permissions
    }

    // Şifre varsa hash'le
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Admin güncelle
    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...admin,
        name: `${admin.firstName} ${admin.lastName}`,
        createdAt: admin.createdAt.toLocaleDateString('tr-TR'),
        lastLoginAt: admin.lastLoginAt 
          ? new Date(admin.lastLoginAt).toLocaleDateString('tr-TR')
          : null
      },
      message: 'Admin başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Admin güncellenemedi:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin güncellenemedi'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    // Mevcut admin kontrolü
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin bulunamadı'
      }, { status: 404 })
    }

    // Admin sil
    await prisma.admin.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla silindi'
    })

  } catch (error) {
    console.error('Admin silinemedi:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin silinemedi'
    }, { status: 500 })
  }
}
