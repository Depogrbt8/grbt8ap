import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temel template'leri oluştur
export async function POST() {
  try {
    const templates = [
      {
        name: 'Hoş Geldiniz Emaili',
        subject: 'GRBT8\'e Hoş Geldiniz!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Hoş Geldiniz!</h2>
            <p>Merhaba {{firstName}},</p>
            <p>GRBT8 ailesine katıldığınız için teşekkür ederiz. Artık en uygun fiyatlarla uçak biletinizi bulabilirsiniz.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Hesap Bilgileriniz:</h3>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Kayıt Tarihi:</strong> {{registrationDate}}</p>
            </div>
            <p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
            <p>İyi yolculuklar!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'email', 'registrationDate'])
      },
      {
        name: 'Email Doğrulama',
        subject: 'Email Adresinizi Doğrulayın',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Email Doğrulama</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Hesabınızı aktifleştirmek için email adresinizi doğrulamanız gerekmektedir.</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3>Doğrulama Kodu:</h3>
              <p style="font-size: 24px; font-weight: bold; color: #059669; text-align: center; letter-spacing: 4px;">{{verificationCode}}</p>
            </div>
            <p style="text-align: center;">
              <a href="{{verificationUrl}}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Email Adresimi Doğrula</a>
            </p>
            <p><strong>Bu kodu 10 dakika içinde kullanmanız gerekmektedir.</strong></p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'verificationCode', 'verificationUrl'])
      },
      {
        name: 'Şifre Sıfırlama',
        subject: 'Şifre Sıfırlama Talebi',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Şifre Sıfırlama</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>Şifre Sıfırlama Kodu:</h3>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; letter-spacing: 4px;">{{resetCode}}</p>
            </div>
            <p style="text-align: center;">
              <a href="{{resetUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Şifremi Sıfırla</a>
            </p>
            <p><strong>Bu kodu 15 dakika içinde kullanmanız gerekmektedir.</strong></p>
            <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'resetCode', 'resetUrl'])
      },
      {
        name: 'Rezervasyon Onayı',
        subject: 'Rezervasyonunuz Onaylandı - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Rezervasyon Onayı</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Rezervasyonunuz başarıyla oluşturulmuştur.</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3>Rezervasyon Detayları:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Tarih:</strong> {{departureDate}}</p>
              <p><strong>Saat:</strong> {{departureTime}}</p>
              <p><strong>Havayolu:</strong> {{airline}}</p>
              <p><strong>Tutar:</strong> {{amount}} {{currency}}</p>
            </div>
            <p>Rezervasyonunuzu kontrol etmek için <a href="{{bookingUrl}}" style="color: #2563eb;">buraya tıklayın</a>.</p>
            <p>İyi yolculuklar!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'origin', 'destination', 'departureDate', 'departureTime', 'airline', 'amount', 'currency', 'bookingUrl'])
      },
      {
        name: 'Fiyat Alarmı',
        subject: 'Fiyat Alarmı: {{origin}} → {{destination}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Fiyat Alarmı!</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Aradığınız rota için daha uygun fiyat bulundu!</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>Fiyat Detayları:</h3>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Tarih:</strong> {{departureDate}}</p>
              <p><strong>Eski Fiyat:</strong> <span style="text-decoration: line-through;">{{oldPrice}} {{currency}}</span></p>
              <p><strong>Yeni Fiyat:</strong> <span style="color: #dc2626; font-weight: bold;">{{newPrice}} {{currency}}</span></p>
              <p><strong>Tasarruf:</strong> <span style="color: #059669;">{{savings}} {{currency}}</span></p>
            </div>
            <p style="text-align: center;">
              <a href="{{bookingUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Hemen Rezervasyon Yap</a>
            </p>
            <p>Bu fırsatı kaçırmayın!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'marketing',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'origin', 'destination', 'departureDate', 'oldPrice', 'newPrice', 'savings', 'currency', 'bookingUrl'])
      },
      {
        name: 'Rezervasyon İptali',
        subject: 'Rezervasyon İptali - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Rezervasyon İptali</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Rezervasyonunuz iptal edilmiştir.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>İptal Edilen Rezervasyon:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Tarih:</strong> {{departureDate}}</p>
              <p><strong>İptal Tarihi:</strong> {{cancellationDate}}</p>
              <p><strong>İade Tutarı:</strong> {{refundAmount}} {{currency}}</p>
            </div>
            <p>İade işleminiz 3-5 iş günü içinde hesabınıza yansıyacaktır.</p>
            <p>Başka bir rezervasyon yapmak için <a href="{{searchUrl}}" style="color: #2563eb;">buraya tıklayın</a>.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'origin', 'destination', 'departureDate', 'cancellationDate', 'refundAmount', 'currency', 'searchUrl'])
      },
      {
        name: 'Kampanya Emaili',
        subject: 'Özel İndirim: {{discount}}% İndirim!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Özel Kampanya!</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Sadece sizin için özel bir kampanya hazırladık!</p>
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <h3>Kampanya Detayları:</h3>
              <p><strong>İndirim:</strong> <span style="color: #7c3aed; font-weight: bold;">{{discount}}%</span></p>
              <p><strong>Geçerlilik:</strong> {{validUntil}}</p>
              <p><strong>Kod:</strong> <span style="background-color: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px;">{{promoCode}}</span></p>
            </div>
            <p style="text-align: center;">
              <a href="{{campaignUrl}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Kampanyayı Görüntüle</a>
            </p>
            <p>Bu fırsatı kaçırmayın!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'marketing',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'discount', 'validUntil', 'promoCode', 'campaignUrl'])
      },
      {
        name: 'Ödeme Onayı',
        subject: 'Ödemeniz Onaylandı - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Ödeme Onayı</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Ödemeniz başarıyla alınmıştır.</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3>Ödeme Detayları:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Ödeme Tutarı:</strong> {{amount}} {{currency}}</p>
              <p><strong>Ödeme Yöntemi:</strong> {{paymentMethod}}</p>
              <p><strong>İşlem Tarihi:</strong> {{paymentDate}}</p>
              <p><strong>İşlem No:</strong> {{transactionId}}</p>
            </div>
            <p>Rezervasyonunuz aktif durumdadır.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'amount', 'currency', 'paymentMethod', 'paymentDate', 'transactionId'])
      },
      {
        name: 'Ödeme Hatası',
        subject: 'Ödeme İşlemi Başarısız - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Ödeme Hatası</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Rezervasyonunuz için ödeme işlemi başarısız olmuştur.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>Rezervasyon Detayları:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Tutar:</strong> {{amount}} {{currency}}</p>
              <p><strong>Hata:</strong> {{errorMessage}}</p>
            </div>
            <p style="text-align: center;">
              <a href="{{retryPaymentUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ödemeyi Tekrar Dene</a>
            </p>
            <p>Rezervasyonunuz 24 saat içinde iptal edilecektir.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'amount', 'currency', 'errorMessage', 'retryPaymentUrl'])
      },
      {
        name: 'Check-in Hatırlatması',
        subject: 'Check-in Hatırlatması - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Check-in Hatırlatması</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Uçuşunuz için check-in işlemini gerçekleştirmeyi unutmayın!</p>
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3>Uçuş Detayları:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Uçuş Tarihi:</strong> {{departureDate}}</p>
              <p><strong>Kalkış Saati:</strong> {{departureTime}}</p>
              <p><strong>Havayolu:</strong> {{airline}}</p>
            </div>
            <p><strong>Check-in:</strong> {{checkinStart}} - {{checkinEnd}}</p>
            <p style="text-align: center;">
              <a href="{{checkinUrl}}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Check-in Yap</a>
            </p>
            <p>İyi yolculuklar!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'notification',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'origin', 'destination', 'departureDate', 'departureTime', 'airline', 'checkinStart', 'checkinEnd', 'checkinUrl'])
      },
      {
        name: 'Uçuş Güncellemesi',
        subject: 'Uçuş Güncellemesi - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Uçuş Güncellemesi</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Rezervasyonunuzda değişiklik yapılmıştır.</p>
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3>Güncellenmiş Bilgiler:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Eski Kalkış:</strong> <span style="text-decoration: line-through;">{{oldDepartureTime}}</span></p>
              <p><strong>Yeni Kalkış:</strong> <span style="color: #3b82f6; font-weight: bold;">{{newDepartureTime}}</span></p>
              <p><strong>Kapı:</strong> {{gate}}</p>
            </div>
            <p>Lütfen güncellenmiş saatlere göre havaalanına geliniz.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'notification',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'origin', 'destination', 'oldDepartureTime', 'newDepartureTime', 'gate'])
      },
      {
        name: 'Uçuş İptali',
        subject: 'Uçuş İptali - {{pnr}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Uçuş İptali</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Maalesef uçuşunuz iptal edilmiştir.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>İptal Edilen Uçuş:</h3>
              <p><strong>PNR:</strong> {{pnr}}</p>
              <p><strong>Rota:</strong> {{origin}} → {{destination}}</p>
              <p><strong>Tarih:</strong> {{departureDate}}</p>
              <p><strong>İptal Nedeni:</strong> {{cancellationReason}}</p>
            </div>
            <p><strong>Seçenekleriniz:</strong></p>
            <ul>
              <li>Alternatif uçuş seçimi</li>
              <li>Tam iade</li>
              <li>Kredi olarak saklama</li>
            </ul>
            <p style="text-align: center;">
              <a href="{{rebookingUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Yeniden Rezervasyon</a>
            </p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'notification',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'pnr', 'origin', 'destination', 'departureDate', 'cancellationReason', 'rebookingUrl'])
      },
      {
        name: 'Hesap Silme Onayı',
        subject: 'Hesabınız Silindi',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6b7280;">Hesap Silindi</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Hesabınız başarıyla silinmiştir.</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
              <h3>Silme Detayları:</h3>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Silme Tarihi:</strong> {{deletionDate}}</p>
              <p><strong>Verileriniz:</strong> GDPR uyumlu olarak silinmiştir</p>
            </div>
            <p>Tekrar görüşmek üzere!</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'transactional',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'email', 'deletionDate'])
      },
      {
        name: 'Newsletter Aboneliği',
        subject: 'Newsletter\'a Hoş Geldiniz!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Newsletter Aboneliği</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Newsletter aboneliğiniz için teşekkür ederiz!</p>
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <h3>Abonelik Detayları:</h3>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Abonelik Tarihi:</strong> {{subscriptionDate}}</p>
              <p><strong>Tercihler:</strong> {{preferences}}</p>
            </div>
            <p>Size özel kampanyalar ve fırsatlar hakkında bilgilendirileceksiniz.</p>
            <p>Abonelikten çıkmak için <a href="{{unsubscribeUrl}}" style="color: #7c3aed;">buraya tıklayın</a>.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'marketing',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'email', 'subscriptionDate', 'preferences', 'unsubscribeUrl'])
      },
      {
        name: 'Sistem Bakım Bildirimi',
        subject: 'Sistem Bakım Bildirimi',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Sistem Bakım Bildirimi</h2>
            <p>Merhaba {{firstName}},</p>
            <p>Sistemimizde planlı bakım çalışması yapılacaktır.</p>
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3>Bakım Detayları:</h3>
              <p><strong>Başlangıç:</strong> {{maintenanceStart}}</p>
              <p><strong>Bitiş:</strong> {{maintenanceEnd}}</p>
              <p><strong>Süre:</strong> {{duration}}</p>
              <p><strong>Neden:</strong> {{reason}}</p>
            </div>
            <p>Bu süre zarfında sistemimiz geçici olarak kullanılamayacaktır.</p>
            <p>Anlayışınız için teşekkür ederiz.</p>
            <p>GRBT8 Ekibi</p>
          </div>
        `,
        type: 'notification',
        language: 'tr',
        variables: JSON.stringify(['firstName', 'maintenanceStart', 'maintenanceEnd', 'duration', 'reason'])
      }
    ]

    // Mevcut template'leri sil
    await prisma.emailTemplate.deleteMany({})

    // Yeni template'leri oluştur
    const createdTemplates = await Promise.all(
      templates.map(template => 
        prisma.emailTemplate.create({
          data: template
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Temel template\'ler başarıyla oluşturuldu',
      data: createdTemplates
    })

  } catch (error: any) {
    console.error('Error creating basic templates:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
