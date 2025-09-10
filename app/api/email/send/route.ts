import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    // Email gönderme işlemi simülasyonu
    const emailData = {
      id: Date.now().toString(),
      recipientType,
      recipients,
      subject,
      content,
      cc: cc || null,
      bcc: bcc || null,
      templateId: templateId || null,
      priority: priority || 'normal',
      scheduledAt: scheduledAt || new Date().toISOString(),
      status: 'queued',
      createdAt: new Date().toISOString()
    }

    // Simüle edilmiş gönderim sonucu
    const result = {
      success: true,
      message: recipientType === 'bulk' 
        ? `${recipients.length} kişiye email başarıyla kuyruğa alındı`
        : 'Email başarıyla kuyruğa alındı',
      data: {
        emailId: emailData.id,
        status: 'queued',
        estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 dakika sonra
        recipientCount: recipients.length,
        recipients: recipients
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