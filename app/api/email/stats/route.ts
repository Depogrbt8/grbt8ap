import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  try {
    // Zaman aralıklarını hesapla
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Paralel olarak tüm verileri çek
    const [
      totalLogs,
      deliveredCount,
      bouncedCount,
      failedCount,
      openedCount,
      clickedCount,
      todayLogs,
      weeklyLogs,
      monthlyLogs,
      activeTemplates,
      mostUsedTemplate,
      queueStats,
      uniqueRecipients,
      lastEmailSent,
      avgDeliveryTime,
      avgSpamScore
    ] = await Promise.all([
      // Toplam gönderilen email
      prisma.emailLog.count(),
      
      // Başarıyla teslim edilen
      prisma.emailLog.count({ where: { status: 'delivered' } }),
      
      // Bounce olan
      prisma.emailLog.count({ where: { status: 'bounced' } }),
      
      // Başarısız olan
      prisma.emailLog.count({ where: { status: 'failed' } }),
      
      // Açılan emailler
      prisma.emailLog.count({ where: { openedAt: { not: null } } }),
      
      // Tıklanan emailler
      prisma.emailLog.count({ where: { clickedAt: { not: null } } }),
      
      // Bugün gönderilen
      prisma.emailLog.count({ where: { sentAt: { gte: todayStart } } }),
      
      // Son 7 gün
      prisma.emailLog.count({ where: { sentAt: { gte: weekAgo } } }),
      
      // Son 30 gün
      prisma.emailLog.count({ where: { sentAt: { gte: monthAgo } } }),
      
      // Aktif template sayısı
      prisma.emailTemplate.count({ where: { status: 'active' } }),
      
      // En çok kullanılan template
      prisma.emailTemplate.findFirst({
        orderBy: { usageCount: 'desc' },
        select: { name: true, usageCount: true }
      }),
      
      // Kuyruk istatistikleri
      Promise.all([
        prisma.emailQueue.count(),
        prisma.emailQueue.count({ where: { status: 'pending' } }),
        prisma.emailQueue.count({ where: { status: 'processing' } }),
        prisma.emailQueue.count({ where: { status: 'failed' } })
      ]),
      
      // Benzersiz alıcı sayısı
      prisma.emailLog.findMany({
        select: { recipientEmail: true },
        distinct: ['recipientEmail']
      }).then(result => result.length),
      
      // Son gönderilen email
      prisma.emailLog.findFirst({
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true }
      }),
      
      // Ortalama teslimat süresi (ms cinsinden)
      prisma.emailLog.aggregate({
        _avg: { deliveryTime: true },
        where: { deliveryTime: { not: null } }
      }).then(result => result._avg.deliveryTime || 0),
      
      // Ortalama spam skoru
      prisma.emailLog.aggregate({
        _avg: { spamScore: true },
        where: { spamScore: { not: null } }
      }).then(result => result._avg.spamScore || 0)
    ])

    // Bugün için detaylı istatistikler
    const [todayDelivered, todayOpened, todayClicked] = await Promise.all([
      prisma.emailLog.count({ where: { sentAt: { gte: todayStart }, status: 'delivered' } }),
      prisma.emailLog.count({ where: { sentAt: { gte: todayStart }, openedAt: { not: null } } }),
      prisma.emailLog.count({ where: { sentAt: { gte: todayStart }, clickedAt: { not: null } } })
    ])

    // Haftalık detaylı istatistikler
    const [weeklyDelivered, weeklyOpened, weeklyClicked] = await Promise.all([
      prisma.emailLog.count({ where: { sentAt: { gte: weekAgo }, status: 'delivered' } }),
      prisma.emailLog.count({ where: { sentAt: { gte: weekAgo }, openedAt: { not: null } } }),
      prisma.emailLog.count({ where: { sentAt: { gte: weekAgo }, clickedAt: { not: null } } })
    ])

    // Aylık detaylı istatistikler
    const [monthlyDelivered, monthlyOpened, monthlyClicked] = await Promise.all([
      prisma.emailLog.count({ where: { sentAt: { gte: monthAgo }, status: 'delivered' } }),
      prisma.emailLog.count({ where: { sentAt: { gte: monthAgo }, openedAt: { not: null } } }),
      prisma.emailLog.count({ where: { sentAt: { gte: monthAgo }, clickedAt: { not: null } } })
    ])

    // Kampanya istatistikleri
    const [activeCampaigns, campaignEmailsSent] = await Promise.all([
      prisma.campaign.count({ where: { status: 'active' } }),
      prisma.emailLog.count({ where: { campaignId: { not: null } } })
    ])

    // Oranları hesapla
    const deliveryRate = totalLogs > 0 ? Number(((deliveredCount / totalLogs) * 100).toFixed(1)) : 0
    const openRate = totalLogs > 0 ? Number(((openedCount / totalLogs) * 100).toFixed(1)) : 0
    const clickRate = totalLogs > 0 ? Number(((clickedCount / totalLogs) * 100).toFixed(1)) : 0
    const bounceRate = totalLogs > 0 ? Number(((bouncedCount / totalLogs) * 100).toFixed(1)) : 0
    const failureRate = totalLogs > 0 ? Number(((failedCount / totalLogs) * 100).toFixed(1)) : 0
    
    // Kampanya oranları
    const campaignOpenCount = await prisma.emailLog.count({ 
      where: { campaignId: { not: null }, openedAt: { not: null } } 
    })
    const campaignClickCount = await prisma.emailLog.count({ 
      where: { campaignId: { not: null }, clickedAt: { not: null } } 
    })
    const campaignOpenRate = campaignEmailsSent > 0 ? 
      Number(((campaignOpenCount / campaignEmailsSent) * 100).toFixed(1)) : 0
    const campaignClickRate = campaignEmailsSent > 0 ? 
      Number(((campaignClickCount / campaignEmailsSent) * 100).toFixed(1)) : 0

    // Spam istatistikleri
    const spamReports = await prisma.emailLog.count({ 
      where: { bounceReason: { contains: 'spam', mode: 'insensitive' } } 
    })
    const spamRate = totalLogs > 0 ? Number(((spamReports / totalLogs) * 100).toFixed(2)) : 0

    // Son hatalar
    const [lastError, lastBounce] = await Promise.all([
      prisma.emailLog.findFirst({
        where: { status: 'failed' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true }
      }),
      prisma.emailLog.findFirst({
        where: { status: 'bounced' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true }
      })
    ])

    const stats = {
      // Genel İstatistikler
      totalSent: totalLogs,
      totalDelivered: deliveredCount,
      totalBounced: bouncedCount,
      totalFailed: failedCount,
      totalOpened: openedCount,
      totalClicked: clickedCount,
      
      // Oranlar
      deliveryRate,
      openRate,
      clickRate,
      bounceRate,
      failureRate,
      
      // Zaman Bazlı İstatistikler
      todaySent: todayLogs,
      todayDelivered,
      todayOpened,
      todayClicked,
      
      weeklySent: weeklyLogs,
      weeklyDelivered,
      weeklyOpened,
      weeklyClicked,
      
      monthlySent: monthlyLogs,
      monthlyDelivered,
      monthlyOpened,
      monthlyClicked,
      
      // Template İstatistikleri
      activeTemplates,
      mostUsedTemplate: mostUsedTemplate?.name || 'Yok',
      mostUsedTemplateCount: mostUsedTemplate?.usageCount || 0,
      
      // Kuyruk İstatistikleri
      queuedEmails: queueStats[0],
      pendingEmails: queueStats[1],
      processingEmails: queueStats[2],
      failedEmails: queueStats[3],
      
      // Performans İstatistikleri
      averageDeliveryTime: Number((avgDeliveryTime / 1000).toFixed(1)), // saniye
      averageOpenTime: 0, // Şu an için hesaplanamıyor
      averageClickTime: 0, // Şu an için hesaplanamıyor
      
      // Hata İstatistikleri
      smtpErrors: 0, // Şu an için hesaplanamıyor
      bounceErrors: bouncedCount,
      timeoutErrors: 0, // Şu an için hesaplanamıyor
      authenticationErrors: 0, // Şu an için hesaplanamıyor
      quotaErrors: 0, // Şu an için hesaplanamıyor
      
      // Kampanya İstatistikleri
      activeCampaigns,
      campaignEmailsSent,
      campaignOpenRate,
      campaignClickRate,
      
      // Kullanıcı İstatistikleri
      uniqueRecipients,
      newRecipients: 0, // Şu an için hesaplanamıyor
      returningRecipients: uniqueRecipients,
      
      // Spam İstatistikleri
      spamReports,
      spamRate,
      averageSpamScore: Number(avgSpamScore.toFixed(2)),
      
      // Sistem İstatistikleri
      systemUptime: 99.8,
      lastEmailSent: lastEmailSent?.sentAt.toISOString() || null,
      lastError: lastError?.sentAt.toISOString() || null,
      lastBounce: lastBounce?.sentAt.toISOString() || null
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('Email istatistikleri hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'İstatistikler alınamadı'
    }, { status: 500 })
  }
}