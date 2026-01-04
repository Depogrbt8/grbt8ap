import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'
import { sanitizeText, sanitizeEmail } from '@/lib/xssProtection'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ Admin yetkisi kontrolü aktif
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      return adminCheck
    }

    const userId = params.id

    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        address: true,
        city: true,
        isForeigner: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            passengers: true,
            priceAlerts: true,
            searchFavorites: true,
            reservations: true,
            payments: true
          }
        },
        reservations: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            pnr: true,
            airline: true,
            flightNumber: true,
            origin: true,
            destination: true,
            departureTime: true,
            arrivalTime: true,
            createdAt: true,
          }
        },
        priceAlerts: {
          select: {
            id: true,
            origin: true,
            destination: true,
            departureDate: true,
            targetPrice: true,
            createdAt: true
          }
        },
        searchFavorites: {
          select: {
            id: true,
            origin: true,
            destination: true,
            departureDate: true,
            createdAt: true
          }
        }
      }
    })

    // hotelFavorites'i ayrı bir query ile çek (migration sonrası aktif olacak)
    let hotelFavorites: any[] = []
    try {
      // Prisma client'ın hotelFavorite modelini destekleyip desteklemediğini kontrol et
      if (prisma.hotelFavorite && typeof prisma.hotelFavorite.findMany === 'function') {
        const hotelFavs = await prisma.hotelFavorite.findMany({
          where: { userId: userId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            hotelId: true,
            hotelName: true,
            hotelLocation: true,
            hotelImage: true,
            createdAt: true
          }
        })
        hotelFavorites = hotelFavs
      }
    } catch (error: any) {
      // HotelFavorite tablosu henüz oluşturulmamışsa boş array döndür
      console.log('HotelFavorite tablosu henüz oluşturulmamış veya migration gerekli:', error?.message || 'Unknown error')
      hotelFavorites = []
    }

    if (!user || user.status === 'deleted') {
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
      status: user.status === 'active' ? 'Aktif' : user.status === 'deleted' ? 'Silindi' : 'Pasif',
      joinDate: user.createdAt.toLocaleDateString('tr-TR'),
      lastLogin: 'Hiç giriş yapmamış',
      role: 'Kullanıcı',
      emailVerified: 'Doğrulanmamış',
      passengerCount: user._count.passengers,
      alertCount: user._count.priceAlerts,
      favoriteCount: user._count.searchFavorites,
      reservationCount: user._count.reservations,
      paymentCount: user._count.payments,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDay: user.birthDay || '',
      birthMonth: user.birthMonth || '',
      birthYear: user.birthYear || '',
      gender: user.gender || '',
      identityNumber: user.identityNumber || '',
      countryCode: user.countryCode || '+90',
      city: user.city || '',
      address: user.address || '',
      isForeigner: user.isForeigner || false,
      comments: user.comments || ''
    }

    return NextResponse.json({
      success: true,
      data: formattedUser,
      reservations: user.reservations || [],
      priceAlerts: user.priceAlerts || [],
      searchFavorites: user.searchFavorites || [],
      hotelFavorites: hotelFavorites
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
    console.log('🔍 [UPDATE DEBUG] PUT /api/users/[id] çağrıldı')
    console.log('🆔 [UPDATE DEBUG] User ID:', params.id)
    
    // ✅ Admin yetkisi kontrolü aktif
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      console.log('❌ [UPDATE DEBUG] Admin yetkisi yok')
      return adminCheck
    }

    const userId = params.id
    const body = await request.json()
    console.log('📝 [UPDATE DEBUG] Request body:', JSON.stringify(body, null, 2))

    // 🛡️ Input Validation - XSS koruması
    try {
      // Email validation
      if (body.email) {
        body.email = sanitizeEmail(body.email)
      }
      
      // Text sanitization
      if (body.firstName) body.firstName = sanitizeText(body.firstName)
      if (body.lastName) body.lastName = sanitizeText(body.lastName)
      if (body.phone) body.phone = sanitizeText(body.phone)
      if (body.countryCode) body.countryCode = sanitizeText(body.countryCode)
      if (body.identityNumber) body.identityNumber = sanitizeText(body.identityNumber)
      if (body.gender) body.gender = sanitizeText(body.gender)
      if (body.city) body.city = sanitizeText(body.city)
      if (body.address) body.address = sanitizeText(body.address)
      if (body.comments) body.comments = sanitizeText(body.comments)
      
      console.log('✅ [SECURITY] Input sanitization tamamlandı')
    } catch (validationError: any) {
      console.log('❌ [SECURITY] Input validation hatası:', validationError.message)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçersiz veri formatı',
          details: validationError.message
        },
        { status: 400 }
      )
    }

    // Transaction ile kullanıcı ve ilk yolcu bilgilerini güncelle
    console.log('🔄 [UPDATE DEBUG] Transaction başlatılıyor...')
    const result = await prisma.$transaction(async (tx) => {
      console.log('👤 [UPDATE DEBUG] Kullanıcı güncelleniyor...')
      
      // Eğer sadece comments güncelleniyorsa, diğer alanları atlama
      const updateData: any = { updatedAt: new Date() }
      
      // Sadece gönderilen alanları güncelle
      if (body.firstName !== undefined) updateData.firstName = body.firstName || ''
      if (body.lastName !== undefined) updateData.lastName = body.lastName || ''
      if (body.email !== undefined) updateData.email = body.email
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.countryCode !== undefined) updateData.countryCode = body.countryCode
      if (body.birthDay !== undefined) updateData.birthDay = body.birthDay || null
      if (body.birthMonth !== undefined) updateData.birthMonth = body.birthMonth || null
      if (body.birthYear !== undefined) updateData.birthYear = body.birthYear || null
      if (body.gender !== undefined) updateData.gender = body.gender || null
      if (body.identityNumber !== undefined) updateData.identityNumber = body.identityNumber || null
      if (body.city !== undefined) updateData.city = body.city || null
      if (body.address !== undefined) updateData.address = body.address || null
      if (body.isForeigner !== undefined) updateData.isForeigner = body.isForeigner
      if (body.comments !== undefined) updateData.comments = body.comments || null
      
      // Kullanıcıyı güncelle
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData
      })
      console.log('✅ [UPDATE DEBUG] Kullanıcı güncellendi:', updatedUser.email)

      return updatedUser
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Kullanıcı ve ilk yolcu bilgileri başarıyla güncellendi'
    })

  } catch (error) {
    console.log('💥 [UPDATE DEBUG] Hata oluştu:', error.message)
    console.log('💥 [UPDATE DEBUG] Stack:', error.stack)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kullanıcı güncellenemedi',
        details: error.message
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
    // ✅ Admin yetkisi kontrolü aktif
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      return adminCheck
    }

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

    console.log('Kullanıcı bulundu, soft delete uygulanıyor:', user.email)

    // Soft delete: durumu 'deleted' yap, kritik alanları anonimize et
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'deleted',
        canDelete: false,
        email: `deleted_${user.id}@example.invalid`,
        firstName: 'Silinen',
        lastName: 'Kullanıcı',
        phone: null,
        countryCode: null,
        identityNumber: null,
        address: null,
        city: null,
        updatedAt: new Date()
      }
    })

    // İsteğe bağlı: kullanıcıya bağlı cache/indeks verileri silinebilir

    console.log('Kullanıcı soft delete ile işaretlendi:', userId)

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı silindi olarak işaretlendi'
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
