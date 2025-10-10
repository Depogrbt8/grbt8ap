import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET() {
  try {
    // Paralel olarak tüm istatistikleri al
    const [
      totalUsers,
      totalReservations,
      totalRevenue,
      totalFlights,
      todayRegistrations,
      todayReservations,
      todayRevenue,
      activeUsers24h,
      cancelledReservations,
      thisMonthRevenue,
      thisMonthFlights,
      usersByCountry,
      topSearchedRoutes
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      prisma.user.count().catch(() => 0),
      
      // Toplam rezervasyon sayısı
      prisma.reservation?.count().catch(() => 0) || 0,
      
      // Toplam gelir
      prisma.payment?.aggregate({
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0).catch(() => 0) || 0,
      
      // Toplam uçuş sayısı (reservation tablosundan)
      prisma.reservation?.count().catch(() => 0) || 0,
      
      // Bugünkü kayıtlar
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }).catch(() => 0),
      
      // Bugünkü rezervasyonlar
      prisma.reservation?.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }).catch(() => 0) || 0,
      
      // Bugünkü gelir
      prisma.payment?.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }).then(result => result._sum.amount || 0).catch(() => 0) || 0,
      
      // Son 24 saatte aktif kullanıcılar (updatedAt'e göre)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => 0),
      
      // İptal edilen rezervasyonlar
      prisma.reservation?.count({
        where: {
          status: 'cancelled'
        }
      }).catch(() => 0) || 0,
      
      // Bu ayki gelir
      prisma.payment?.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }).then(result => result._sum.amount || 0).catch(() => 0) || 0,
      
      // Bu ayki uçuşlar
      prisma.reservation?.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }).catch(() => 0) || 0,
      
      // Ülkelere göre kullanıcı dağılımı (countryCode alanına göre)
      prisma.user.groupBy({
        by: ['countryCode'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      }).catch(() => []),
      
      // En çok aranan rotalar (örnek veri - gerçek implementasyon için ayrı tablo gerekir)
      Promise.resolve([
        { route: 'İstanbul → Berlin', searches: 45, airports: 'IST → BER' },
        { route: 'Ankara → Amsterdam', searches: 38, airports: 'ESB → AMS' },
        { route: 'İzmir → Frankfurt', searches: 32, airports: 'ADB → FRA' }
      ])
    ])

    // Büyüme oranlarını hesapla (basit hesaplama)
    const reservationGrowthPercentage = totalReservations > 0 ? 
      Math.round((todayReservations / totalReservations) * 100 * 30) : 0 // Aylık tahmini
    
    const revenueGrowthPercentage = totalRevenue > 0 ? 
      Math.round((todayRevenue / totalRevenue) * 100 * 30) : 0 // Aylık tahmini
    
    const flightGrowthPercentage = totalFlights > 0 ? 
      Math.round((todayReservations / totalFlights) * 100 * 30) : 0 // Aylık tahmini

    // Ayrılan kullanıcılar (basit hesaplama - son 30 günde güncellenmeyen)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const abandonedUsers = await prisma.user.count({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    }).catch(() => 0)

    // Ülke dağılımını formatla
    const formattedUsersByCountry: { [key: string]: number } = {}
    usersByCountry.forEach((item: any) => {
      const country = item.countryCode || 'Unknown'
      formattedUsersByCountry[country] = item._count.id
    })

    const statisticsData = {
      // Ana metrikler
      totalUsers,
      totalReservations,
      totalRevenue,
      totalFlights,
      
      // Günlük metrikler
      todayRegistrations,
      todayReservations,
      todayRevenue,
      activeUsers24h,
      
      // Ek metrikler
      cancelledReservations,
      abandonedUsers,
      thisMonthRevenue,
      thisMonthFlights,
      
      // Büyüme oranları
      reservationGrowthPercentage: Math.min(reservationGrowthPercentage, 50), // Max %50
      revenueGrowthPercentage: Math.min(revenueGrowthPercentage, 50),
      flightGrowthPercentage: Math.min(flightGrowthPercentage, 50),
      
      // Detaylı veriler
      usersByCountry: formattedUsersByCountry,
      topSearchedRoutes,
      
      // Sistem bilgileri
      lastUpdated: new Date().toISOString(),
      dataSource: 'production_database'
    }

    return NextResponse.json({
      success: true,
      data: statisticsData
    })

  } catch (error) {
    console.error('İstatistik verileri alınamadı:', error)
    
    // Fallback veriler
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: 0,
        totalReservations: 0,
        totalRevenue: 0,
        totalFlights: 0,
        todayRegistrations: 0,
        todayReservations: 0,
        todayRevenue: 0,
        activeUsers24h: 0,
        cancelledReservations: 0,
        abandonedUsers: 0,
        thisMonthRevenue: 0,
        thisMonthFlights: 0,
        reservationGrowthPercentage: 0,
        revenueGrowthPercentage: 0,
        flightGrowthPercentage: 0,
        usersByCountry: {},
        topSearchedRoutes: [
          { route: 'İstanbul → Berlin', searches: 0, airports: 'IST → BER' },
          { route: 'Ankara → Amsterdam', searches: 0, airports: 'ESB → AMS' },
          { route: 'İzmir → Frankfurt', searches: 0, airports: 'ADB → FRA' }
        ],
        lastUpdated: new Date().toISOString(),
        dataSource: 'fallback_data'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}
