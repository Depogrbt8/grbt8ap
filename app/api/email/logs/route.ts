import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all'
    const templateId = searchParams.get('templateId') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Simüle edilmiş email log verileri
    const emailLogs = [
      {
        id: '1',
        emailId: 'email_001',
        recipientEmail: 'ali@example.com',
        recipientName: 'Ali İnce',
        subject: 'Hoş Geldiniz Email\'i',
        templateId: '1',
        templateName: 'Hoş Geldiniz Email\'i',
        status: 'sent',
        sentAt: '2024-01-15T10:30:00Z',
        deliveredAt: '2024-01-15T10:30:05Z',
        openedAt: '2024-01-15T11:15:00Z',
        clickedAt: '2024-01-15T11:20:00Z',
        bounceReason: null,
        errorMessage: null,
        campaignId: null,
        userId: 'user_123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        openCount: 1,
        clickCount: 1,
        bounceCount: 0,
        spamScore: 0.1,
        deliveryTime: 5,
        retryCount: 0
      },
      {
        id: '2',
        emailId: 'email_002',
        recipientEmail: 'mehmet@example.com',
        recipientName: 'Mehmet Yılmaz',
        subject: 'Rezervasyon Onayı - ABC123',
        templateId: '2',
        templateName: 'Rezervasyon Onayı',
        status: 'delivered',
        sentAt: '2024-01-15T09:15:00Z',
        deliveredAt: '2024-01-15T09:15:03Z',
        openedAt: '2024-01-15T09:45:00Z',
        clickedAt: null,
        bounceReason: null,
        errorMessage: null,
        campaignId: null,
        userId: 'user_456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        openCount: 1,
        clickCount: 0,
        bounceCount: 0,
        spamScore: 0.2,
        deliveryTime: 3,
        retryCount: 0
      },
      {
        id: '3',
        emailId: 'email_003',
        recipientEmail: 'ayse@example.com',
        recipientName: 'Ayşe Demir',
        subject: '🎉 Fiyat Düşüşü! İstanbul-Paris - %15 Tasarruf',
        templateId: '3',
        templateName: 'Fiyat Düşüşü Bildirimi',
        status: 'bounced',
        sentAt: '2024-01-15T08:00:00Z',
        deliveredAt: null,
        openedAt: null,
        clickedAt: null,
        bounceReason: 'mailbox_full',
        errorMessage: 'Mailbox is full',
        campaignId: 'campaign_001',
        userId: 'user_789',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        openCount: 0,
        clickCount: 0,
        bounceCount: 1,
        spamScore: 0.0,
        deliveryTime: null,
        retryCount: 2
      },
      {
        id: '4',
        emailId: 'email_004',
        recipientEmail: 'fatma@example.com',
        recipientName: 'Fatma Kaya',
        subject: 'Check-in Hatırlatması - XYZ789',
        templateId: '8',
        templateName: 'Check-in Hatırlatması',
        status: 'failed',
        sentAt: '2024-01-15T07:30:00Z',
        deliveredAt: null,
        openedAt: null,
        clickedAt: null,
        bounceReason: null,
        errorMessage: 'SMTP connection timeout',
        campaignId: null,
        userId: 'user_321',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Android 11)',
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        spamScore: 0.0,
        deliveryTime: null,
        retryCount: 3
      },
      {
        id: '5',
        emailId: 'email_005',
        recipientEmail: 'mustafa@example.com',
        recipientName: 'Mustafa Özkan',
        subject: 'Özel İndirim: %20 İndirim!',
        templateId: '12',
        templateName: 'Kampanya Emaili',
        status: 'sent',
        sentAt: '2024-01-15T06:45:00Z',
        deliveredAt: '2024-01-15T06:45:02Z',
        openedAt: '2024-01-15T07:30:00Z',
        clickedAt: '2024-01-15T07:35:00Z',
        bounceReason: null,
        errorMessage: null,
        campaignId: 'campaign_002',
        userId: 'user_654',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        openCount: 2,
        clickCount: 3,
        bounceCount: 0,
        spamScore: 0.3,
        deliveryTime: 2,
        retryCount: 0
      }
    ]

    // Filtreleme
    let filteredLogs = emailLogs

    if (status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status)
    }

    if (templateId !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.templateId === templateId)
    }

    // Sayfalama
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    // İstatistikler
    const stats = {
      total: filteredLogs.length,
      sent: filteredLogs.filter(log => log.status === 'sent').length,
      delivered: filteredLogs.filter(log => log.status === 'delivered').length,
      bounced: filteredLogs.filter(log => log.status === 'bounced').length,
      failed: filteredLogs.filter(log => log.status === 'failed').length,
      opened: filteredLogs.filter(log => log.openedAt).length,
      clicked: filteredLogs.filter(log => log.clickedAt).length
    }

    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        stats,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit)
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