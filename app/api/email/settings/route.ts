import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simüle edilmiş email ayarları
    const settings = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@gurbetbiz.com',
      smtpPassword: '••••••••',
      fromEmail: 'noreply@gurbetbiz.com',
      fromName: 'GurbetBiz',
      dailyLimit: 1000,
      rateLimit: 100,
      isActive: true,
      lastTested: '2024-01-15T10:30:00Z'
    }

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error: any) {
    console.error('Email ayarları hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Ayarlar alınamadı'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName, dailyLimit, rateLimit } = body

    // Validation
    if (!smtpHost || !smtpPort || !smtpUser || !fromEmail) {
      return NextResponse.json({
        success: false,
        error: 'Gerekli alanlar eksik'
      }, { status: 400 })
    }

    // Ayarları kaydetme simülasyonu
    const savedSettings = {
      smtpHost,
      smtpPort: parseInt(smtpPort),
      smtpUser,
      smtpPassword: smtpPassword || '••••••••',
      fromEmail,
      fromName: fromName || 'GurbetBiz',
      dailyLimit: parseInt(dailyLimit) || 1000,
      rateLimit: parseInt(rateLimit) || 100,
      isActive: true,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Email ayarları başarıyla kaydedildi',
      data: savedSettings
    })

  } catch (error: any) {
    console.error('Email ayarları kaydetme hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Ayarlar kaydedilemedi'
    }, { status: 500 })
  }
}