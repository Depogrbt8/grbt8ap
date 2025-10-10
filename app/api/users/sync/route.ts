import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { sourceDbPath } = await request.json();
    
    if (!sourceDbPath) {
      return NextResponse.json({ error: 'Source database path is required' }, { status: 400 });
    }

    // Ana sitedeki veritabanından kullanıcıları çek
    const sourcePrisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${sourceDbPath}`
        }
      }
    });

    // Ana sitedeki tüm kullanıcıları getir
    const sourceUsers = await sourcePrisma.user.findMany({
      include: {
        passengers: true,
        reservations: true,
        payments: true,
        priceAlerts: true,
        searchFavorites: true,
        surveyResponses: true
      }
    });

    console.log(`Found ${sourceUsers.length} users in source database`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const sourceUser of sourceUsers) {
      try {
        // Admin panelinde bu kullanıcı var mı kontrol et
        const existingUser = await prisma.user.findUnique({
          where: { email: sourceUser.email }
        });

        if (existingUser) {
          // Kullanıcı varsa güncelle
          await prisma.user.update({
            where: { email: sourceUser.email },
            data: {
              firstName: sourceUser.firstName,
              lastName: sourceUser.lastName,
              password: sourceUser.password,
              countryCode: sourceUser.countryCode,
              phone: sourceUser.phone,
              birthDay: sourceUser.birthDay,
              birthMonth: sourceUser.birthMonth,
              birthYear: sourceUser.birthYear,
              gender: sourceUser.gender,
              identityNumber: sourceUser.identityNumber,
              isForeigner: sourceUser.isForeigner,
              emailVerified: sourceUser.emailVerified,
              image: sourceUser.image,
              lastLoginAt: sourceUser.lastLoginAt,
              status: sourceUser.status,
              role: sourceUser.role,
              canDelete: sourceUser.canDelete,
              updatedAt: new Date()
            }
          });
          skippedCount++;
        } else {
          // Kullanıcı yoksa oluştur
          await prisma.user.create({
            data: {
              id: sourceUser.id,
              firstName: sourceUser.firstName,
              lastName: sourceUser.lastName,
              email: sourceUser.email,
              password: sourceUser.password,
              countryCode: sourceUser.countryCode,
              phone: sourceUser.phone,
              birthDay: sourceUser.birthDay,
              birthMonth: sourceUser.birthMonth,
              birthYear: sourceUser.birthYear,
              gender: sourceUser.gender,
              identityNumber: sourceUser.identityNumber,
              isForeigner: sourceUser.isForeigner,
              emailVerified: sourceUser.emailVerified,
              image: sourceUser.image,
              createdAt: sourceUser.createdAt,
              lastLoginAt: sourceUser.lastLoginAt,
              status: sourceUser.status,
              role: sourceUser.role,
              canDelete: sourceUser.canDelete
            }
          });
          syncedCount++;
        }

        // Yolcuları senkronize et
        for (const passenger of sourceUser.passengers) {
          const existingPassenger = await prisma.passenger.findFirst({
            where: {
              userId: sourceUser.id,
              identityNumber: passenger.identityNumber
            }
          });

          if (!existingPassenger) {
            await prisma.passenger.create({
              data: {
                id: passenger.id,
                userId: sourceUser.id,
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                identityNumber: passenger.identityNumber,
                isForeigner: passenger.isForeigner,
                birthDay: passenger.birthDay,
                birthMonth: passenger.birthMonth,
                birthYear: passenger.birthYear,
                gender: passenger.gender,
                countryCode: passenger.countryCode,
                phone: passenger.phone,
                hasMilCard: passenger.hasMilCard,
                hasPassport: passenger.hasPassport,
                passportNumber: passenger.passportNumber,
                passportExpiry: passenger.passportExpiry,
                milCardNumber: passenger.milCardNumber,
                createdAt: passenger.createdAt,
                status: passenger.status,
                isAccountOwner: passenger.isAccountOwner
              }
            });
          }
        }

        // Rezervasyonları senkronize et
        for (const reservation of sourceUser.reservations) {
          const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservation.id }
          });

          if (!existingReservation) {
            await prisma.reservation.create({
              data: {
                id: reservation.id,
                userId: sourceUser.id,
                type: reservation.type,
                status: reservation.status,
                amount: reservation.amount,
                currency: reservation.currency,
                biletDukkaniOrderId: reservation.biletDukkaniOrderId,
                biletDukkaniRouteId: reservation.biletDukkaniRouteId,
                pnr: reservation.pnr,
                validUntil: reservation.validUntil,
                passengers: reservation.passengers,
                flightNumber: reservation.flightNumber,
                origin: reservation.origin,
                destination: reservation.destination,
                departureTime: reservation.departureTime,
                arrivalTime: reservation.arrivalTime,
                airline: reservation.airline,
                createdAt: reservation.createdAt,
                updatedAt: reservation.updatedAt
              }
            });
          }
        }

        // Ödemeleri senkronize et
        for (const payment of sourceUser.payments) {
          const existingPayment = await prisma.payment.findUnique({
            where: { id: payment.id }
          });

          if (!existingPayment) {
            await prisma.payment.create({
              data: {
                id: payment.id,
                reservationId: payment.reservationId,
                userId: sourceUser.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                provider: payment.provider,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
              }
            });
          }
        }

        // Fiyat alarmlarını senkronize et
        for (const priceAlert of sourceUser.priceAlerts) {
          const existingPriceAlert = await prisma.priceAlert.findUnique({
            where: { id: priceAlert.id }
          });

          if (!existingPriceAlert) {
            await prisma.priceAlert.create({
              data: {
                id: priceAlert.id,
                userId: sourceUser.id,
                origin: priceAlert.origin,
                destination: priceAlert.destination,
                departureDate: priceAlert.departureDate,
                targetPrice: priceAlert.targetPrice,
                lastNotifiedPrice: priceAlert.lastNotifiedPrice,
                createdAt: priceAlert.createdAt
              }
            });
          }
        }

        // Favori aramaları senkronize et
        for (const searchFavorite of sourceUser.searchFavorites) {
          const existingSearchFavorite = await prisma.searchFavorite.findUnique({
            where: { id: searchFavorite.id }
          });

          if (!existingSearchFavorite) {
            await prisma.searchFavorite.create({
              data: {
                id: searchFavorite.id,
                userId: sourceUser.id,
                origin: searchFavorite.origin,
                destination: searchFavorite.destination,
                departureDate: searchFavorite.departureDate,
                createdAt: searchFavorite.createdAt
              }
            });
          }
        }

        // Anket yanıtlarını senkronize et
        for (const surveyResponse of sourceUser.surveyResponses) {
          const existingSurveyResponse = await prisma.surveyResponse.findUnique({
            where: { id: surveyResponse.id }
          });

          if (!existingSurveyResponse) {
            await prisma.surveyResponse.create({
              data: {
                id: surveyResponse.id,
                userId: sourceUser.id,
                answers: surveyResponse.answers,
                completedAt: surveyResponse.completedAt,
                userAgent: surveyResponse.userAgent,
                ipAddress: surveyResponse.ipAddress,
                createdAt: surveyResponse.createdAt,
                updatedAt: surveyResponse.updatedAt
              }
            });
          }
        }

      } catch (error) {
        console.error(`Error syncing user ${sourceUser.email}:`, error);
        continue;
      }
    }

    await sourcePrisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Kullanıcılar başarıyla senkronize edildi',
      stats: {
        totalUsers: sourceUsers.length,
        syncedCount,
        skippedCount,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı senkronizasyonu sırasında hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
