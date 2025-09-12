import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        isForeigner: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        status: true,
        role: true,
        canDelete: true,
        _count: {
          select: {
            passengers: true,
            priceAlerts: true,
            searchFavorites: true,
            reservations: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Kullanıcı verilerini formatla
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      customerNo: `#${user.id.slice(-6).toUpperCase()}`,
      email: user.email,
      phone: user.phone ? `${user.countryCode || ''} ${user.phone}` : 'Belirtilmemiş',
      status: user.status === 'active' ? 'Aktif' : 'Pasif',
      city: 'Belirtilmemiş', // Şu anda şema'da yok
      address: 'Belirtilmemiş', // Şu anda şema'da yok
      joinDate: user.createdAt.toLocaleDateString('tr-TR'),
      lastLogin: user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('tr-TR') : 'Hiç giriş yapmamış',
      role: user.role === 'admin' ? 'Admin' : 'Kullanıcı',
      isForeigner: user.isForeigner ? 'Evet' : 'Hayır',
      emailVerified: user.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış',
      passengerCount: user._count.passengers,
      alertCount: user._count.priceAlerts,
      favoriteCount: user._count.searchFavorites,
      reservationCount: user._count.reservations,
      paymentCount: user._count.payments,
      // Doğum tarihi bilgileri
      birthDay: user.birthDay,
      birthMonth: user.birthMonth,
      birthYear: user.birthYear,
      gender: user.gender,
      identityNumber: user.identityNumber
    }))

    // Log kaydet
    await createLog({
      level: 'INFO',
      message: 'Kullanıcı listesi getirildi',
      source: 'api/users',
      metadata: JSON.stringify({ count: formattedUsers.length })
    })

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length
    })

  } catch (error) {
    console.error('Kullanıcı listesi getirme hatası:', error)
    
    // Hata logu kaydet
    await createLog({
      level: 'ERROR',
      message: 'Kullanıcı listesi getirme hatası',
      source: 'api/users',
      metadata: JSON.stringify({ error: error instanceof Error ? error.message : 'Bilinmeyen hata' })
    })

    return NextResponse.json(
      { 
        success: false, 
        error: 'Kullanıcı listesi getirilemedi' 
      },
      { status: 500 }
    )
  }
}
