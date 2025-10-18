import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: string
  permissions: any
}

export async function verifyAdminPassword(email: string, password: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin || admin.status !== 'active') {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    
    if (!isValidPassword) {
      return null
    }

    // Son giriş zamanını güncelle
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      permissions: admin.permissions as any
    }
  } catch (error) {
    console.error('Admin doğrulama hatası:', error)
    return null
  }
}

export function hasPermission(admin: AdminUser, permission: string): boolean {
  if (!admin.permissions) return false
  
  // Super Admin her zaman tüm yetkilere sahip
  if (admin.role === 'Super Admin') return true
  
  // JSON permissions objesinden yetki kontrolü
  return admin.permissions[permission] === true
}

export function hasAnyPermission(admin: AdminUser, permissions: string[]): boolean {
  if (!admin.permissions) return false
  
  // Super Admin her zaman tüm yetkilere sahip
  if (admin.role === 'Super Admin') return true
  
  return permissions.some(permission => admin.permissions[permission] === true)
}

export function hasAllPermissions(admin: AdminUser, permissions: string[]): boolean {
  if (!admin.permissions) return false
  
  // Super Admin her zaman tüm yetkilere sahip
  if (admin.role === 'Super Admin') return true
  
  return permissions.every(permission => admin.permissions[permission] === true)
}

export function isRoleAllowed(admin: AdminUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(admin.role)
}

// Admin middleware helper
export async function getAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Bu basit bir implementasyon - gerçek projede JWT token kullanılmalı
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    // Basit token kontrolü (gerçek projede JWT decode edilmeli)
    const token = authHeader.substring(7)
    // Bu örnekte token'ı admin ID olarak kabul ediyoruz
    const admin = await prisma.admin.findUnique({
      where: { id: token }
    })

    if (!admin || admin.status !== 'active') {
      return null
    }

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      permissions: admin.permissions as any
    }
  } catch (error) {
    console.error('Admin token doğrulama hatası:', error)
    return null
  }
}
