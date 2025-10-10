import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Database'den gerçek kuyruk verilerini çek
    const whereConditions: any = {}
    
    if (status !== 'all') {
      whereConditions.status = status
    }
    
    if (priority !== 'all') {
      whereConditions.priority = priority
    }

    const emailQueue = await prisma.emailQueue.findMany({
      where: whereConditions,
      orderBy: [
        { priority: 'desc' }, // high, normal, low
        { scheduledAt: 'asc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      include: {
        template: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    // Kuyruk istatistikleri - gerçek verilerden hesapla
    const allQueueItems = await prisma.emailQueue.findMany()
    const queueStats = {
      total: allQueueItems.length,
      pending: allQueueItems.filter(item => item.status === 'pending').length,
      processing: allQueueItems.filter(item => item.status === 'processing').length,
      failed: allQueueItems.filter(item => item.status === 'failed').length,
      completed: allQueueItems.filter(item => item.status === 'completed').length,
      highPriority: allQueueItems.filter(item => item.priority === 'high').length,
      normalPriority: allQueueItems.filter(item => item.priority === 'normal').length,
      lowPriority: allQueueItems.filter(item => item.priority === 'low').length,
      retryNeeded: allQueueItems.filter(item => item.status === 'failed' && item.retryCount < 3).length
    }

    // Mock data yerine gerçek data formatla
    const formattedQueue = emailQueue.map(item => ({
      id: item.id,
      recipientEmail: item.recipient,
      subject: item.subject,
      templateId: item.templateId,
      templateName: item.template?.name || 'Bilinmeyen Template',
      priority: item.priority,
      status: item.status,
      scheduledAt: item.scheduledAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      sentAt: item.sentAt?.toISOString(),
      retryCount: item.retryCount,
      maxRetries: 3,
      errorMessage: item.errorMessage
    }))

    return NextResponse.json({
      success: true,
      data: {
        queue: formattedQueue,
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

// Kuyruk işlemleri - Gerçek database operasyonları
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, queueId, emailId, priority, scheduledAt, recipient, subject, content, templateId } = body

    switch (action) {
      case 'add':
        // Yeni email kuyruğa ekle
        const newQueueItem = await prisma.emailQueue.create({
          data: {
            recipient,
            subject,
            content,
            templateId,
            priority: priority || 'normal',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            status: 'pending'
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Email kuyruğa eklendi',
          data: newQueueItem
        })

      case 'retry':
        // Başarısız email'i tekrar dene
        if (!queueId) {
          return NextResponse.json({
            success: false,
            error: 'Queue ID gereklidir'
          }, { status: 400 })
        }

        await prisma.emailQueue.update({
          where: { id: queueId },
          data: {
            status: 'pending',
            retryCount: { increment: 1 },
            errorMessage: null,
            scheduledAt: new Date() // Hemen gönder
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Email tekrar kuyruğa alındı'
        })

      case 'cancel':
        // Email'i kuyruktan çıkar
        if (!queueId) {
          return NextResponse.json({
            success: false,
            error: 'Queue ID gereklidir'
          }, { status: 400 })
        }

        await prisma.emailQueue.update({
          where: { id: queueId },
          data: {
            status: 'cancelled'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Email kuyruktan çıkarıldı'
        })

      case 'priority':
        // Öncelik değiştir
        if (!queueId || !priority) {
          return NextResponse.json({
            success: false,
            error: 'Queue ID ve priority gereklidir'
          }, { status: 400 })
        }

        await prisma.emailQueue.update({
          where: { id: queueId },
          data: { priority }
        })

        return NextResponse.json({
          success: true,
          message: 'Email önceliği güncellendi'
        })

      case 'schedule':
        // Zamanlama değiştir
        if (!queueId || !scheduledAt) {
          return NextResponse.json({
            success: false,
            error: 'Queue ID ve scheduledAt gereklidir'
          }, { status: 400 })
        }

        await prisma.emailQueue.update({
          where: { id: queueId },
          data: {
            scheduledAt: new Date(scheduledAt)
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Email zamanlaması güncellendi'
        })

      case 'process':
        // Kuyruktaki emailları işle (cron job için)
        const pendingEmails = await prisma.emailQueue.findMany({
          where: {
            status: 'pending',
            scheduledAt: {
              lte: new Date()
            }
          },
          orderBy: [
            { priority: 'desc' },
            { scheduledAt: 'asc' }
          ],
          take: 10 // Aynı anda max 10 email işle
        })

        let processedCount = 0
        for (const email of pendingEmails) {
          try {
            // Email'i processing olarak işaretle
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: { status: 'processing' }
            })

            // Burada gerçek email gönderimi yapılacak
            // Resend API çağrısı vs.
            
            // Başarılı olursa completed olarak işaretle
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: { 
                status: 'completed',
                sentAt: new Date()
              }
            })

            processedCount++
          } catch (emailError) {
            // Başarısız olursa failed olarak işaretle
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: { 
                status: 'failed',
                errorMessage: String(emailError)
              }
            })
          }
        }

        return NextResponse.json({
          success: true,
          message: `${processedCount} email işlendi`,
          processed: processedCount
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
      error: 'İşlem gerçekleştirilemedi: ' + error.message
    }, { status: 500 })
  }
}