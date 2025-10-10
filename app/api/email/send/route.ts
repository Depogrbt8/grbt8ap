import { NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'
import { prisma } from '@/app/lib/prisma'
import { createRateLimit } from '@/lib/rateLimit'

const rateLimit = createRateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 50 })

export async function POST(request: Request) {
  // Rate limit
  const rl = await rateLimit(request as any)
  if ((rl as any)?.status === 429) {
    try {
      await prisma.systemLog.create({
        data: {
          level: 'warn',
          message: 'Rate limit blocked',
          source: 'rate_limit_block',
          metadata: JSON.stringify({ path: '/api/email/send', ip: (request.headers as any).get?.('x-forwarded-for') || 'unknown' })
        }
      })
    } catch {}
    return rl as NextResponse
  }

  try {
    const body = await request.json()
    const { 
      recipientType, 
      recipientEmail, 
      recipientEmails,
      to,
      subject, 
      content, 
      cc, 
      bcc, 
      templateId, 
      priority, 
      scheduledAt 
    } = body

    // Validation
    if (!subject || !content) {
      return NextResponse.json({
        success: false,
        error: 'Konu ve içerik zorunludur'
      }, { status: 400 })
    }

    // Alıcı email'leri belirle
    let recipients: string[] = []
    if (recipientType === 'bulk' && recipientEmails) {
      try {
        recipients = JSON.parse(recipientEmails)
      } catch {
        recipients = []
      }
    } else if (recipientType === 'single' && (to || recipientEmail)) {
      recipients = [to || recipientEmail]
    }

    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'En az bir alıcı belirtilmelidir'
      }, { status: 400 })
    }

    // Resend API key kontrolü
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
      // API key yoksa simülasyon modu
      console.log('🔄 RESEND_API_KEY bulunamadı, simülasyon modunda çalışıyor')
      
      const result = {
        success: true,
        message: recipientType === 'bulk' 
          ? `${recipients.length} kişiye email başarıyla kuyruğa alındı (simülasyon)`
          : 'Email başarıyla kuyruğa alındı (simülasyon)',
        data: {
          emailId: Date.now().toString(),
          status: 'simulated',
          estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          recipientCount: recipients.length,
          recipients: recipients
        }
      }
      return NextResponse.json(result)
    }

    // Gerçek email gönderimi
    const emailResults = []
    let successCount = 0
    let errorCount = 0

    for (const recipient of recipients) {
      try {
        // HTML formatında email içeriği oluştur
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 5px; letter-spacing: -1px; }
            .logo .biz { color: #000000; }
            .content { padding: 40px 30px; background: #ffffff; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 12px; background: #f8fafc; }
            .unsubscribe { color: #4ade80; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">gurbet<span class="biz">biz</span></div>
            </div>
            <div class="content">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>© 2024 Gurbetbiz. Tüm hakları saklıdır.</p>
              <p>Bu email otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </body>
        </html>
        `

        const result = await resendService.sendEmail({
          to: recipient,
          subject,
          html: htmlContent,
          text: content, // Plain text versiyonu da ekle
          from: 'Gurbetbiz <noreply@grbt8.store>',
          replyTo: 'destek@grbt8.store', // Reply-To adresi ekle
          cc: cc ? [cc] : undefined,
          bcc: bcc ? [bcc] : undefined
        })

        // Email log kaydet
        try {
          await prisma.emailLog.create({
            data: {
              emailId: result.messageId,
              recipientEmail: recipient,
              recipientName: recipient.split('@')[0], // Basit name extraction
              cc,
              bcc,
              subject,
              content: content.substring(0, 1000), // İlk 1000 karakter
              templateName: 'Manuel Email',
              status: result.success ? 'sent' : 'failed',
              errorMessage: result.error,
              ipAddress: (request.headers as any).get?.('x-forwarded-for') || 'unknown',
              userAgent: (request.headers as any).get?.('user-agent') || 'unknown'
            }
          })
        } catch (logError) {
          console.error('Email log kaydedilemedi:', logError)
          // Log hatası email gönderimini etkilemez
        }

        emailResults.push({
          recipient,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        })

        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error: any) {
        emailResults.push({
          recipient,
          success: false,
          error: error.message
        })
        errorCount++
      }
    }

    const result = {
      success: successCount > 0,
      message: recipientType === 'bulk' 
        ? `${successCount}/${recipients.length} email başarıyla gönderildi`
        : successCount > 0 ? 'Email başarıyla gönderildi' : 'Email gönderilemedi',
      data: {
        emailId: Date.now().toString(),
        status: successCount > 0 ? 'sent' : 'failed',
        recipientCount: recipients.length,
        successCount,
        errorCount,
        results: emailResults
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Email gönderme hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email gönderilirken hata oluştu'
    }, { status: 500 })
  }
}