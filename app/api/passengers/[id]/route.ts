import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createLog } from '@/app/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passengerId = params.id

    // Yolcuyu getir
    const passenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
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
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!passenger) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Yolcu bulunamadı' 
        },
        { status: 404 }
      )
    }

    // Yolcu verilerini formatla
    const formattedPassenger = {
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
      userId: passenger.userId,
      createdAt: passenger.createdAt.toLocaleDateString('tr-TR'),
      updatedAt: passenger.updatedAt.toLocaleDateString('tr-TR')
    }

    return NextResponse.json({
      success: true,
      data: formattedPassenger
    })

  } catch (error) {
    console.error('Yolcu getirme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yolcu getirilemedi' 
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
    const passengerId = params.id
    const body = await request.json()

    // Yolcunun var olup olmadığını kontrol et
    const existingPassenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
      select: { id: true, userId: true, firstName: true, lastName: true }
    })

    if (!existingPassenger) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Yolcu bulunamadı' 
        },
        { status: 404 }
      )
    }

    // Yolcuyu güncelle
    const updatedPassenger = await prisma.passenger.update({
      where: { id: passengerId },
      data: {
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        phone: body.phone,
        countryCode: body.countryCode,
        identityNumber: body.identityNumber || null,
        birthDay: body.birthDay || null,
        birthMonth: body.birthMonth || null,
        birthYear: body.birthYear || null,
        gender: body.gender || null,
        isForeigner: body.isForeigner || false,
        updatedAt: new Date()
      }
    })

    // Log kaydet
    await createLog({
      level: 'INFO',
      message: `Yolcu bilgileri güncellendi: ${updatedPassenger.firstName} ${updatedPassenger.lastName}`,
      source: 'api/passengers',
      metadata: {
        passengerId: passengerId,
        userId: existingPassenger.userId,
        changes: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          identityNumber: body.identityNumber
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPassenger,
      message: 'Yolcu başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Yolcu güncelleme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yolcu güncellenemedi: ' + (error instanceof Error ? error.message : 'Unknown error')
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
    const passengerId = params.id

    // Yolcunun var olup olmadığını kontrol et
    const existingPassenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
      select: { 
        id: true, 
        userId: true, 
        firstName: true, 
        lastName: true,
        createdAt: true
      }
    })

    if (!existingPassenger) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Yolcu bulunamadı' 
        },
        { status: 404 }
      )
    }

    // İlk yolcu (hesap sahibi) kontrolü
    const firstPassenger = await prisma.passenger.findFirst({
      where: { userId: existingPassenger.userId },
      orderBy: { createdAt: 'asc' }
    })

    if (firstPassenger && firstPassenger.id === passengerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Hesap sahibi yolcu silinemez' 
        },
        { status: 400 }
      )
    }

    // Yolcuyu sil
    await prisma.passenger.delete({
      where: { id: passengerId }
    })

    // Log kaydet
    await createLog({
      level: 'INFO',
      message: `Yolcu silindi: ${existingPassenger.firstName} ${existingPassenger.lastName}`,
      source: 'api/passengers',
      metadata: {
        passengerId: passengerId,
        userId: existingPassenger.userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Yolcu başarıyla silindi'
    })

  } catch (error) {
    console.error('Yolcu silme hatası:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Yolcu silinemedi: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}
