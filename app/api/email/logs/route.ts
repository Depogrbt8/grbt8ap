import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100) // Max 100, default 25
    const status = searchParams.get('status') || 'all'
    const templateName = searchParams.get('templateName') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Database'den email logları çek
    const whereConditions: any = {}
    
    if (status !== 'all') {
      whereConditions.status = status
    }
    
    if (templateName !== 'all') {
      whereConditions.templateName = templateName
    }
    
    if (dateFrom) {
      whereConditions.sentAt = {
        ...whereConditions.sentAt,
        gte: new Date(dateFrom)
      }
    }
    
    if (dateTo) {
      whereConditions.sentAt = {
        ...whereConditions.sentAt,
        lte: new Date(dateTo)
      }
    }

    // Toplam sayıyı al
    const totalCount = await prisma.emailLog.count({
      where: whereConditions
    })

    // Sayfalanmış logları al
    const emailLogs = await prisma.emailLog.findMany({
      where: whereConditions,
      orderBy: {
        sentAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Database loglarını frontend formatına çevir
    const formattedLogs = emailLogs.map(log => ({
      id: log.id,
      emailId: log.emailId,
      recipientEmail: log.recipientEmail,
      recipientName: log.recipientName || (log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Bilinmiyor'),
      subject: log.subject,
      templateId: log.templateId,
      templateName: log.templateName,
      status: log.status,
      sentAt: log.sentAt.toISOString(),
      deliveredAt: log.deliveredAt?.toISOString() || null,
      openedAt: log.openedAt?.toISOString() || null,
      clickedAt: log.clickedAt?.toISOString() || null,
      bounceReason: log.bounceReason,
      errorMessage: log.errorMessage,
      campaignId: log.campaignId,
      userId: log.userId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      openCount: log.openCount,
      clickCount: log.clickCount,
      bounceCount: log.bounceCount,
      spamScore: log.spamScore,
      deliveryTime: log.deliveryTime,
      retryCount: log.retryCount
    }))

    // İstatistikler
    const stats = {
      total: totalCount,
      sent: await prisma.emailLog.count({ where: { ...whereConditions, status: 'sent' } }),
      delivered: await prisma.emailLog.count({ where: { ...whereConditions, status: 'delivered' } }),
      bounced: await prisma.emailLog.count({ where: { ...whereConditions, status: 'bounced' } }),
      failed: await prisma.emailLog.count({ where: { ...whereConditions, status: 'failed' } }),
      opened: await prisma.emailLog.count({ where: { ...whereConditions, openedAt: { not: null } } }),
      clicked: await prisma.emailLog.count({ where: { ...whereConditions, clickedAt: { not: null } } })
    }

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
        stats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error: any) {
    console.error('Email log hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email logları alınamadı'
    }, { status: 500 })
  }
}