import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { createLog } from '../../lib/logger'

// GET - SEO ayarlarını getir
export async function GET() {
  try {
    // SEO ayarlarını veritabanından getir
    let seoSettings = await prisma.seoSettings.findFirst()
    
    // Eğer ayar yoksa varsayılan ayarları oluştur
    if (!seoSettings) {
      seoSettings = await prisma.seoSettings.create({
        data: {
          siteTitle: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
          siteDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri. Güvenli ödeme, 7/24 destek.',
          keywords: 'uçak bileti, yurt dışı seyahat, otel rezervasyonu, araç kiralama, gurbet, seyahat platformu, ucuz uçak bileti, havayolu bileti',
          canonicalUrl: 'https://gurbet.biz',
          ogTitle: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
          ogDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
          ogImage: '/images/og-image.jpg',
          twitterCard: 'summary_large_image',
          facebookUrl: 'https://www.facebook.com/gurbetbiz',
          twitterUrl: 'https://www.twitter.com/gurbetbiz',
          instagramUrl: 'https://www.instagram.com/gurbetbiz',
          robotsIndex: true,
          robotsFollow: true,
          googleVerification: 'google-site-verification-code-here',
          yandexVerification: 'yandex-verification-code-here',
          organizationName: 'Gurbet.biz',
          organizationDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
          organizationLogo: 'https://gurbet.biz/images/logo.png',
          organizationUrl: 'https://gurbet.biz',
          organizationPhone: '+90-XXX-XXX-XXXX',
          organizationFounded: '2024'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: seoSettings
    })

  } catch (error) {
    console.error('SEO ayarları getirme hatası:', error)
    
    await createLog({
      level: 'ERROR',
      message: 'SEO ayarları getirilemedi',
      source: 'api',
      metadata: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { success: false, error: 'SEO ayarları getirilemedi' },
      { status: 500 }
    )
  }
}

// PUT - SEO ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mevcut ayarları bul veya oluştur
    let seoSettings = await prisma.seoSettings.findFirst()
    
    if (seoSettings) {
      // Güncelle
      seoSettings = await prisma.seoSettings.update({
        where: { id: seoSettings.id },
        data: {
          siteTitle: body.siteTitle,
          siteDescription: body.siteDescription,
          keywords: body.keywords,
          canonicalUrl: body.canonicalUrl,
          ogTitle: body.ogTitle,
          ogDescription: body.ogDescription,
          ogImage: body.ogImage,
          twitterCard: body.twitterCard,
          facebookUrl: body.facebookUrl,
          twitterUrl: body.twitterUrl,
          instagramUrl: body.instagramUrl,
          robotsIndex: body.robotsIndex,
          robotsFollow: body.robotsFollow,
          googleVerification: body.googleVerification,
          yandexVerification: body.yandexVerification,
          organizationName: body.organizationName,
          organizationDescription: body.organizationDescription,
          organizationLogo: body.organizationLogo,
          organizationUrl: body.organizationUrl,
          organizationPhone: body.organizationPhone,
          organizationFounded: body.organizationFounded,
          updatedAt: new Date()
        }
      })
    } else {
      // Oluştur
      seoSettings = await prisma.seoSettings.create({
        data: {
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    await createLog({
      level: 'INFO',
      message: 'SEO ayarları güncellendi',
      source: 'api',
      metadata: `Site başlığı: ${body.siteTitle}`
    })

    return NextResponse.json({
      success: true,
      data: seoSettings,
      message: 'SEO ayarları başarıyla güncellendi'
    })

  } catch (error) {
    console.error('SEO ayarları güncelleme hatası:', error)
    
    await createLog({
      level: 'ERROR',
      message: 'SEO ayarları güncellenemedi',
      source: 'api',
      metadata: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { success: false, error: 'SEO ayarları güncellenemedi' },
      { status: 500 }
    )
  }
}
