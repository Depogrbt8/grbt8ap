import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  // GÜVENLIK: Production'da devre dışı bırak
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      error: 'Bu endpoint production ortamında devre dışıdır' 
    }, { status: 403 })
  }
  
  // Admin sayısını kontrol et - Eğer admin varsa çalışmasın
  const adminCount = await prisma.admin.count()
  if (adminCount > 0) {
    return NextResponse.json({ 
      success: false, 
      error: 'Sistemde zaten admin kullanıcı bulunmaktadır' 
    }, { status: 403 })
  }
  try {
    // İlk admin kullanıcısını oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.admin.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@grbt8.store',
        password: hashedPassword,
        role: 'Super Admin',
        status: 'active',
        permissions: {
          system: true,
          admin: true,
          settings: true,
          security: true,
          users: true,
          'user-roles': true,
          flights: true,
          reservations: true,
          'email-templates': true,
          'email-settings': true,
          'api-management': true,
          'external-apis': true,
          reports: true,
          statistics: true,
          dashboard: true
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'İlk admin kullanıcısı oluşturuldu!',
      data: {
        email: admin.email,
        password: 'admin123',
        note: 'Bu şifreyi değiştirmeyi unutmayın!'
      }
    })

  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Admin oluşturulamadı: ' + error.message 
    }, { status: 500 })
  }
}
