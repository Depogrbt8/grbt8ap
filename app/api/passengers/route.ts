import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parametresi gerekli'
      }, { status: 400 })
    }

    // Kullanıcının yolcularını getir
    const passengers = await prisma.passenger.findMany({
      where: { userId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        countryCode: true,
        identityNumber: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        isForeigner: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Yolcu verilerini formatla
    const formattedPassengers = passengers.map((passenger, index) => ({
      id: passenger.id,
      name: `${passenger.firstName} ${passenger.lastName}`,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      phone: passenger.phone,
      countryCode: passenger.countryCode,
      fullPhone: passenger.phone ? `${passenger.countryCode || ''} ${passenger.phone}` : 'Belirtilmemiş',
      identityNumber: passenger.identityNumber || '-',
      birthDate: passenger.birthDay && passenger.birthMonth && passenger.birthYear 
        ? `${passenger.birthDay}/${passenger.birthMonth}/${passenger.birthYear}` 
        : 'Belirtilmemiş',
      birthDay: passenger.birthDay,
      birthMonth: passenger.birthMonth,
      birthYear: passenger.birthYear,
      gender: passenger.gender,
      isForeigner: passenger.isForeigner,
      isAccountOwner: index === 0, // İlk yolcu hesap sahibi
      createdAt: passenger.createdAt.toLocaleDateString('tr-TR'),
      updatedAt: passenger.updatedAt.toLocaleDateString('tr-TR')
    }))

    return NextResponse.json({
      success: true,
      data: formattedPassengers,
      count: formattedPassengers.length,
      userId: userId
    })

  } catch (error) {
    console.error('Yolcu listesi getirme hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Yolcu listesi getirilemedi: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
