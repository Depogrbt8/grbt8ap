import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi veya Vercel cron
  const isVercelCron = request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  
  if (!isVercelCron) {
    const adminCheck = await requireAdmin(request)
    if (adminCheck) return adminCheck
  }
  try {
    console.log('🕐 Cron job başlatıldı:', new Date().toISOString())

    const results = []

    // 1. Email log temizleme (90 günden eski)
    try {
      const cleanupResponse = await fetch(`${process.env.VERCEL_URL || 'https://www.grbt8.store'}/api/system/cleanup-logs`, {
        method: 'POST'
      })
      
      const cleanupData = await cleanupResponse.json()
      results.push({
        task: 'email-log-cleanup',
        success: cleanupData.success,
        message: cleanupData.message,
        data: cleanupData.data
      })
      
      console.log('✅ Email log temizleme:', cleanupData.message)
    } catch (error) {
      console.error('❌ Email log temizleme hatası:', error)
      results.push({
        task: 'email-log-cleanup',
        success: false,
        error: 'Log temizleme başarısız'
      })
    }

    // 2. Diğer temizleme işlemleri buraya eklenebilir
    // - Eski kampanya verilerini temizle
    // - Geçici dosyaları sil
    // - Cache temizle vs.

    return NextResponse.json({
      success: true,
      message: 'Cron job tamamlandı',
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('❌ Cron job hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Cron job başarısız',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}