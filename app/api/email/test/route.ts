import { NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { testEmail, testType = 'welcome' } = body

    // Validation
    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Test email adresi gereklidir'
      }, { status: 400 })
    }

    // RESEND_API_KEY kontrolü
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY bulunamadı. Lütfen Vercel environment variables\'a ekleyin.',
        details: {
          currentKey: process.env.RESEND_API_KEY ? 'Mevcut (gizli)' : 'Yok',
          setupRequired: true,
          documentation: 'RESEND_API_KEY_SETUP.md dosyasını kontrol edin'
        }
      }, { status: 500 })
    }

    let result
    const testName = 'Test Kullanıcı'

    switch (testType) {
      case 'welcome':
        result = await resendService.sendWelcomeEmail(testEmail, testName)
        break
      
      case 'reservation':
        result = await resendService.sendReservationConfirmation(testEmail, testName, {
          reservationNumber: 'TEST-' + Date.now(),
          flightDetails: 'Test Uçuş Detayları'
        })
        break
      
      case 'notification':
        result = await resendService.sendSystemNotification(
          testEmail, 
          'Test Bildirimi', 
          'Bu bir test bildirimidir. Email sisteminiz başarıyla çalışıyor! 🎉',
          'info'
        )
        break
      
      default:
        result = await resendService.sendEmail({
          to: testEmail,
          subject: '🧪 Gurbetbiz Email Sistemi Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">gurbet<span style="color: #000;">biz</span></h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">🧪 Email Sistemi Test</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #22c55e; margin-top: 0;">✅ Test Başarılı!</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                  Merhaba <strong>${testName}</strong>,
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                  Bu email, Gurbetbiz email sisteminizin doğru çalıştığını doğrulamak için gönderilmiştir.
                </p>
                
                <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #15803d; margin-top: 0;">📊 Test Detayları</h3>
                  <ul style="color: #374151; margin: 0; padding-left: 20px;">
                    <li><strong>Test Türü:</strong> ${testType}</li>
                    <li><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</li>
                    <li><strong>API Key:</strong> ✅ Aktif</li>
                    <li><strong>Resend Servisi:</strong> ✅ Bağlı</li>
                  </ul>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                  Email sisteminiz artık tam olarak çalışıyor ve gerçek email gönderimi yapabiliyor.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://admin.grbt8.store/email" 
                     style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                    📧 Email Dashboard
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
                  © 2024 Gurbetbiz. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          `,
          text: `Gurbetbiz Email Sistemi Test\n\nMerhaba ${testName},\n\nBu email, email sisteminizin doğru çalıştığını doğrulamak için gönderilmiştir.\n\nTest Detayları:\n- Test Türü: ${testType}\n- Gönderim Zamanı: ${new Date().toLocaleString('tr-TR')}\n- API Key: Aktif\n- Resend Servisi: Bağlı\n\nEmail sisteminiz artık tam olarak çalışıyor!\n\nİyi günler,\nGurbetbiz Ekibi`
        })
    }

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Test email başarıyla gönderildi! 🎉'
        : 'Test email gönderilemedi',
      data: {
        testEmail,
        testType,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
        apiKeyStatus: 'active'
      },
      error: result.error
    })

  } catch (error: any) {
    console.error('Email test hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Test email gönderilirken hata oluştu: ' + error.message,
      details: {
        apiKeyStatus: process.env.RESEND_API_KEY ? 'configured' : 'missing',
        setupRequired: !process.env.RESEND_API_KEY
      }
    }, { status: 500 })
  }
}

export async function GET() {
  // API Key durumunu kontrol et
  const hasApiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here'
  
  return NextResponse.json({
    success: true,
    data: {
      apiKeyConfigured: hasApiKey,
      apiKeyStatus: hasApiKey ? 'active' : 'missing',
      setupRequired: !hasApiKey,
      documentation: 'RESEND_API_KEY_SETUP.md dosyasını kontrol edin',
      testEndpoint: '/api/email/test',
      supportedTestTypes: ['welcome', 'reservation', 'notification', 'custom']
    }
  })
}
