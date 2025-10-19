import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, getAuthUser } from '@/lib/authMiddleware'

// GET - Kullanıcının fatura bilgilerini getir
export async function GET(request: NextRequest) {
  // GÜVENLIK: Kullanıcı authentication gerekli
  const authCheck = await requireAuth(request)
  if (authCheck) return authCheck
  
  // Kullanıcı sadece kendi verilerine erişebilir
  const user = await getAuthUser(request)
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')

    if (!requestedUserId) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gereklidir' },
        { status: 400 }
      )
    }
    
    // Kullanıcı sadece kendi verilerine erişebilir (admin hariç)
    if (user?.id !== requestedUserId && user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Bu bilgilere erişim yetkiniz yok' },
        { status: 403 }
      )
    }

    const billingInfos = await prisma.billingInfo.findMany({
      where: { 
        userId: requestedUserId,
        isActive: true 
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: billingInfos
    })

  } catch (error) {
    console.error('Fatura bilgileri getirme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni fatura bilgisi ekle
export async function POST(request: NextRequest) {
  // GÜVENLIK: Kullanıcı authentication gerekli
  const authCheck = await requireAuth(request)
  if (authCheck) return authCheck
  
  const user = await getAuthUser(request)
  try {
    const body = await request.json()
    const {
      userId,
      type,
      title,
      firstName,
      lastName,
      companyName,
      taxNumber,
      address,
      city,
      country = 'Türkiye',
      isDefault = false
    } = body

    // Gerekli alanları kontrol et
    if (!userId || !type || !title || !address || !city) {
      return NextResponse.json(
        { success: false, message: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }
    
    // Kullanıcı sadece kendi verilerini ekleyebilir (admin hariç)
    if (user?.id !== userId && user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    // Eğer varsayılan olarak işaretleniyorsa, diğerlerini false yap
    if (isDefault) {
      await prisma.billingInfo.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }

    const billingInfo = await prisma.billingInfo.create({
      data: {
        userId,
        type,
        title,
        firstName,
        lastName,
        companyName,
        taxNumber,
        address,
        city,
        country,
        isDefault
      }
    })

    return NextResponse.json({
      success: true,
      data: billingInfo
    })

  } catch (error) {
    console.error('Fatura bilgisi ekleme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgisi eklenemedi' },
      { status: 500 }
    )
  }
}
