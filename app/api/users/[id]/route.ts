import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            passengers: true,
            priceAlerts: true,
            searchFavorites: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kullanıcı bulunamadı' 
        },
        { status: 404 }
      )
    }

    // Kullanıcı verilerini formatla
    const formattedUser = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      customerNo: `#${user.id.slice(-6).toUpperCase()}`,
      email: user.email,
      phone: user.phone || 'Belirtilmemiş',
      status: 'Aktif',
      city: 'Belirtilmemiş',
      address: 'Belirtilmemiş',
      joinDate: user.createdAt.toLocaleDateString('tr-TR'),
      lastLogin: 'Hiç giriş yapmamış',
      role: 'Kullanıcı',
      isForeigner: 'Hayır',
      emailVerified: 'Doğrulanmamış',
      passengerCount: user._count.passengers,
      alertCount: user._count.priceAlerts,
      favoriteCount: user._count.searchFavorites,
      reservationCount: 0,
      paymentCount: 0,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDay: user.birthDay || '',
      birthMonth: user.birthMonth || '',
      birthYear: user.birthYear || '',
      gender: user.gender || '',
      identityNumber: user.identityNumber || '',
      countryCode: user.countryCode || '+90'
    }

    return NextResponse.json({
      success: true,
      data: formattedUser
    })

  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kullanıcı getirilemedi' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        email: body.email,
        phone: body.phone,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Kullanıcı başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kullanıcı güncellenemedi' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    console.log('Silinecek kullanıcı ID:', userId)

    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('Kullanıcı bulunamadı:', userId)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kullanıcı bulunamadı' 
        },
        { status: 404 }
      )
    }

    console.log('Kullanıcı bulundu, siliniyor:', user.email)

    // Transaction ile güvenli silme
    await prisma.$transaction(async (tx) => {
      // Önce bağlı kayıtları sil
      try {
        await tx.passenger.deleteMany({
          where: { userId: userId }
        })
        console.log('Yolcu kayıtları silindi')
      } catch (e) {
        console.log('Yolcu kayıtları yok veya silinemedi:', e)
      }

      try {
        await tx.priceAlert.deleteMany({
          where: { userId: userId }
        })
        console.log('Fiyat alarmları silindi')
      } catch (e) {
        console.log('Fiyat alarmları yok veya silinemedi:', e)
      }

      try {
        await tx.searchFavorite.deleteMany({
          where: { userId: userId }
        })
        console.log('Favori aramalar silindi')
      } catch (e) {
        console.log('Favori aramalar yok veya silinemedi:', e)
      }

      // Son olarak kullanıcıyı sil
      await tx.user.delete({
        where: { id: userId }
      })
    })

    console.log('Kullanıcı başarıyla silindi:', userId)

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı ve tüm bağlı kayıtları başarıyla silindi'
    })

  } catch (error) {
    console.error('Kullanıcı silme hatası detayı:', error)
    
    // Hata türüne göre özel mesajlar
    let errorMessage = 'Kullanıcı silinemedi'
    
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        errorMessage = 'Bu kullanıcının bağlı kayıtları olduğu için silinemez'
      } else if (error.message.includes('Record to delete does not exist')) {
        errorMessage = 'Kullanıcı zaten silinmiş'
      } else {
        errorMessage = `Silme hatası: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    )
  }
}
