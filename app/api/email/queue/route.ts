import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Email kuyruğu verileri
    const emailQueue = [
      {
        id: 'queue_001',
        emailId: 'email_006',
        recipientEmail: 'ahmet@example.com',
        recipientName: 'Ahmet Yıldız',
        subject: 'Newsletter\'a Hoş Geldiniz!',
        templateId: '14',
        templateName: 'Newsletter Aboneliği',
        priority: 'normal',
        scheduledAt: '2024-01-15T12:00:00Z',
        createdAt: '2024-01-15T11:45:00Z',
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        userId: 'user_111',
        campaignId: 'campaign_003',
        variables: {
          userName: 'Ahmet Yıldız',
          siteName: 'GurbetBiz'
        }
      },
      {
        id: 'queue_002',
        emailId: 'email_007',
        recipientEmail: 'zeynep@example.com',
        recipientName: 'Zeynep Arslan',
        subject: 'Bagaj Bilgileriniz - DEF456',
        templateId: '16',
        templateName: 'Bagaj Bilgilendirmesi',
        priority: 'high',
        scheduledAt: '2024-01-15T11:30:00Z',
        createdAt: '2024-01-15T11:25:00Z',
        status: 'processing',
        retryCount: 0,
        maxRetries: 3,
        userId: 'user_222',
        campaignId: null,
        variables: {
          userName: 'Zeynep Arslan',
          pnr: 'DEF456',
          handBaggage: '8',
          cabinBaggage: '23'
        }
      },
      {
        id: 'queue_003',
        emailId: 'email_008',
        recipientEmail: 'emre@example.com',
        recipientName: 'Emre Çelik',
        subject: 'Seyahat Sigortası Önerisi - Roma',
        templateId: '18',
        templateName: 'Seyahat Sigortası',
        priority: 'low',
        scheduledAt: '2024-01-15T13:00:00Z',
        createdAt: '2024-01-15T11:50:00Z',
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        userId: 'user_333',
        campaignId: 'campaign_004',
        variables: {
          userName: 'Emre Çelik',
          destination: 'Roma',
          standardPrice: '25',
          premiumPrice: '45',
          vipPrice: '75'
        }
      },
      {
        id: 'queue_004',
        emailId: 'email_009',
        recipientEmail: 'seda@example.com',
        recipientName: 'Seda Öztürk',
        subject: 'Ödeme İşlemi Başarısız - GHI789',
        templateId: '7',
        templateName: 'Ödeme Hatası',
        priority: 'high',
        scheduledAt: '2024-01-15T11:20:00Z',
        createdAt: '2024-01-15T11:15:00Z',
        status: 'failed',
        retryCount: 2,
        maxRetries: 3,
        userId: 'user_444',
        campaignId: null,
        variables: {
          userName: 'Seda Öztürk',
          pnr: 'GHI789',
          errorReason: 'Kart limiti aşıldı'
        }
      },
      {
        id: 'queue_005',
        emailId: 'email_010',
        recipientEmail: 'can@example.com',
        recipientName: 'Can Şahin',
        subject: 'Otel Rezervasyon Onayı - Grand Hotel',
        templateId: '19',
        templateName: 'Otel Rezervasyonu',
        priority: 'normal',
        scheduledAt: '2024-01-15T12:30:00Z',
        createdAt: '2024-01-15T12:00:00Z',
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        userId: 'user_555',
        campaignId: null,
        variables: {
          userName: 'Can Şahin',
          hotelName: 'Grand Hotel',
          checkInDate: '2024-01-20',
          checkOutDate: '2024-01-25',
          nights: '5'
        }
      }
    ]

    // Kuyruk istatistikleri
    const queueStats = {
      total: emailQueue.length,
      pending: emailQueue.filter(item => item.status === 'pending').length,
      processing: emailQueue.filter(item => item.status === 'processing').length,
      failed: emailQueue.filter(item => item.status === 'failed').length,
      completed: emailQueue.filter(item => item.status === 'completed').length,
      highPriority: emailQueue.filter(item => item.priority === 'high').length,
      normalPriority: emailQueue.filter(item => item.priority === 'normal').length,
      lowPriority: emailQueue.filter(item => item.priority === 'low').length,
      retryNeeded: emailQueue.filter(item => item.status === 'failed' && item.retryCount < item.maxRetries).length
    }

    return NextResponse.json({
      success: true,
      data: {
        queue: emailQueue,
        stats: queueStats
      }
    })

  } catch (error: any) {
    console.error('Email kuyruk hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email kuyruğu alınamadı'
    }, { status: 500 })
  }
}

// Kuyruk işlemleri
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, queueId, emailId } = body

    switch (action) {
      case 'retry':
        // Başarısız email'i tekrar dene
        return NextResponse.json({
          success: true,
          message: 'Email tekrar kuyruğa alındı'
        })

      case 'cancel':
        // Email'i kuyruktan çıkar
        return NextResponse.json({
          success: true,
          message: 'Email kuyruktan çıkarıldı'
        })

      case 'priority':
        // Öncelik değiştir
        return NextResponse.json({
          success: true,
          message: 'Email önceliği güncellendi'
        })

      case 'schedule':
        // Zamanlama değiştir
        return NextResponse.json({
          success: true,
          message: 'Email zamanlaması güncellendi'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Geçersiz işlem'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Email kuyruk işlem hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'İşlem gerçekleştirilemedi'
    }, { status: 500 })
  }
}