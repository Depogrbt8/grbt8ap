import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// Template'leri getir
export async function GET() {
  try {
    // Veritabanından gerçek template'leri çek
    const dbTemplates = await prisma.emailTemplate.findMany({
      orderBy: {
        usageCount: 'desc'
      }
    })

    // Eğer veritabanında template yoksa, varsayılan template'leri oluştur
    if (dbTemplates.length === 0) {
      console.log('Veritabanında template bulunamadı, varsayılan template\'ler oluşturuluyor...')
      
      const defaultTemplates = [
      {
        id: '1',
        name: 'Hoş Geldiniz Email\'i',
        subject: '{{siteName}} Hesabınıza Hoş Geldiniz!',
        content: '<h1>Hoş Geldiniz!</h1><p>Merhaba {{userName}},</p><p>{{siteName}} ailesine hoş geldiniz!</p>',
        type: 'welcome',
        language: 'tr',
        status: 'active',
        usageCount: 1247,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-15'
      },
      {
        id: '2',
        name: 'Rezervasyon Onayı',
        subject: 'Rezervasyon Onayı - {{pnrCode}}',
        content: '<h1>Rezervasyon Onaylandı!</h1><p>{{pnrCode}} numaralı rezervasyonunuz onaylanmıştır.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 892,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-14'
      },
      {
        id: '3',
        name: 'Fiyat Düşüşü Bildirimi',
        subject: '🎉 Fiyat Düşüşü! {{route}} - %{{discount}} Tasarruf',
        content: '<h1>🎉 Harika Haber!</h1><p>{{route}} güzergahında fiyat düşüşü var!</p>',
        type: 'marketing',
        language: 'tr',
        status: 'active',
        usageCount: 456,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-13'
      },
      {
        id: '4',
        name: 'Email Doğrulama',
        subject: 'Email Adresinizi Doğrulayın',
        content: '<h1>Email Doğrulama</h1><p>Email adresinizi doğrulamak için linke tıklayın.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 2341,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-12'
      },
      {
        id: '5',
        name: 'Şifre Sıfırlama',
        subject: 'Şifre Sıfırlama Talebi',
        content: '<h1>Şifre Sıfırlama</h1><p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 567,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-11'
      },
      {
        id: '6',
        name: 'Ödeme Onayı',
        subject: 'Ödemeniz Onaylandı - {{pnr}}',
        content: '<h1>Ödeme Başarılı!</h1><p>{{pnr}} numaralı rezervasyonunuz için ödemeniz alınmıştır.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 1234,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-10'
      },
      {
        id: '7',
        name: 'Ödeme Hatası',
        subject: 'Ödeme İşlemi Başarısız - {{pnr}}',
        content: '<h1>Ödeme Hatası</h1><p>{{pnr}} numaralı rezervasyonunuz için ödeme başarısız.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 89,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-09'
      },
      {
        id: '8',
        name: 'Check-in Hatırlatması',
        subject: 'Check-in Hatırlatması - {{pnr}}',
        content: '<h1>Check-in Zamanı!</h1><p>{{pnr}} numaralı rezervasyonunuz için check-in yapabilirsiniz.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 2345,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-08'
      },
      {
        id: '9',
        name: 'Uçuş Güncellemesi',
        subject: 'Uçuş Güncellemesi - {{pnr}}',
        content: '<h1>Uçuş Bilgisi Güncellendi</h1><p>{{pnr}} numaralı rezervasyonunuzda değişiklik yapılmıştır.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 456,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-07'
      },
      {
        id: '10',
        name: 'Uçuş İptali',
        subject: 'Uçuş İptali - {{pnr}}',
        content: '<h1>Uçuş İptal Edildi</h1><p>{{pnr}} numaralı rezervasyonunuz iptal edilmiştir.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 123,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-06'
      },
      {
        id: '11',
        name: 'Rezervasyon İptali',
        subject: 'Rezervasyon İptali - {{pnr}}',
        content: '<h1>Rezervasyon İptal Edildi</h1><p>{{pnr}} numaralı rezervasyonunuz iptal edilmiştir.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 234,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-05'
      },
      {
        id: '12',
        name: 'Kampanya Emaili',
        subject: 'Özel İndirim: {{discount}}% İndirim!',
        content: '<h1>🎉 Özel Kampanya!</h1><p>{{discount}}% indirim fırsatını kaçırmayın!</p>',
        type: 'marketing',
        language: 'tr',
        status: 'active',
        usageCount: 567,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-04'
      },
      {
        id: '13',
        name: 'Hesap Silme Onayı',
        subject: 'Hesabınız Silindi',
        content: '<h1>Hesap Silindi</h1><p>Hesabınız başarıyla silinmiştir.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 45,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-03'
      },
      {
        id: '14',
        name: 'Newsletter Aboneliği',
        subject: 'Newsletter\'a Hoş Geldiniz!',
        content: '<h1>Newsletter\'a Hoş Geldiniz!</h1><p>Newsletter\'ına başarıyla abone oldunuz!</p>',
        type: 'marketing',
        language: 'tr',
        status: 'active',
        usageCount: 1234,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-02'
      },
      {
        id: '15',
        name: 'Sistem Bakım Bildirimi',
        subject: 'Sistem Bakım Bildirimi',
        content: '<h1>Sistem Bakım Bildirimi</h1><p>Sistemde planlı bakım çalışması yapılacaktır.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 12,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-01'
      },
      {
        id: '16',
        name: 'Bagaj Bilgilendirmesi',
        subject: 'Bagaj Bilgileriniz - {{pnr}}',
        content: '<h1>Bagaj Bilgileriniz</h1><p>{{pnr}} numaralı rezervasyonunuz için bagaj bilgileriniz.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 789,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-14'
      },
      {
        id: '17',
        name: 'Vize Bilgilendirmesi',
        subject: 'Vize Bilgileri - {{destination}}',
        content: '<h1>Vize Bilgilendirmesi</h1><p>{{destination}} seyahatiniz için vize bilgileri.</p>',
        type: 'system',
        language: 'tr',
        status: 'active',
        usageCount: 456,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-13'
      },
      {
        id: '18',
        name: 'Seyahat Sigortası',
        subject: 'Seyahat Sigortası Önerisi - {{destination}}',
        content: '<h1>Seyahat Sigortası Önerisi</h1><p>{{destination}} seyahatiniz için sigorta öneriyoruz.</p>',
        type: 'marketing',
        language: 'tr',
        status: 'active',
        usageCount: 234,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-12'
      },
      {
        id: '19',
        name: 'Otel Rezervasyonu',
        subject: 'Otel Rezervasyon Onayı - {{hotelName}}',
        content: '<h1>Otel Rezervasyon Onayı</h1><p>{{hotelName}} otelinde rezervasyonunuz onaylanmıştır.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 567,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-11'
      },
      {
        id: '20',
        name: 'Araç Kiralama',
        subject: 'Araç Kiralama Onayı - {{carModel}}',
        content: '<h1>Araç Kiralama Onayı</h1><p>{{carModel}} aracı için kiralama rezervasyonunuz onaylanmıştır.</p>',
        type: 'reservation',
        language: 'tr',
        status: 'active',
        usageCount: 345,
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-10'
      }
      ]

      // Varsayılan template'leri veritabanına ekle
      for (const template of defaultTemplates) {
        await prisma.emailTemplate.create({
          data: {
            name: template.name,
            subject: template.subject,
            content: template.content,
            type: template.type,
            language: template.language,
            status: template.status,
            usageCount: template.usageCount
          }
        })
      }

      // Yeni oluşturulan template'leri çek
      const newTemplates = await prisma.emailTemplate.findMany({
        orderBy: {
          usageCount: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: newTemplates
      })
    }

    // Veritabanından çekilen template'leri döndür
    return NextResponse.json({
      success: true,
      data: dbTemplates
    })

  } catch (error: any) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Yeni template oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, subject, content, type, language, variables } = body

    // Validation
    if (!name || !subject || !content) {
      return NextResponse.json({
        success: false,
        error: 'Name, subject ve content zorunludur'
      }, { status: 400 })
    }

    // Veritabanına kaydet
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        type: type || 'system',
        language: language || 'tr',
        variables: variables || null,
        status: 'active',
        usageCount: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Template başarıyla oluşturuldu',
      data: template
    })

  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
