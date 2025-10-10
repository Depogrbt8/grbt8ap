import { NextResponse } from 'next/server'
import { createLog, getLogs } from '@/app/lib/logger'

export async function POST() {
  try {
    // Mevcut log sayısını kontrol et
    const existingLogs = await getLogs(1)
    
    if (existingLogs.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Loglar zaten mevcut'
      })
    }
    
    // Başlangıç logları oluştur
    const initialLogs = [
      {
        level: 'INFO' as const,
        message: 'Sistem başlatıldı',
        source: 'system' as const,
        metadata: { version: '1.0.0' }
      },
      {
        level: 'INFO' as const,
        message: 'Veritabanı bağlantısı başarılı',
        source: 'database' as const
      },
      {
        level: 'INFO' as const,
        message: 'Admin paneli yüklendi',
        source: 'system' as const
      },
      {
        level: 'WARNING' as const,
        message: 'Yüksek CPU kullanımı tespit edildi',
        source: 'monitoring' as const,
        metadata: { cpuUsage: '85%' }
      },
      {
        level: 'INFO' as const,
        message: 'Cache sistemi aktif',
        source: 'cache' as const
      },
      {
        level: 'INFO' as const,
        message: 'Güvenlik duvarı aktif',
        source: 'security' as const
      },
      {
        level: 'INFO' as const,
        message: 'SSL sertifikası geçerli',
        source: 'security' as const
      },
      {
        level: 'INFO' as const,
        message: 'Yedekleme sistemi hazır',
        source: 'backup' as const
      }
    ]
    
    // Logları kaydet
    for (const logData of initialLogs) {
      await createLog(logData)
    }
    
    return NextResponse.json({
      success: true,
      message: `${initialLogs.length} başlangıç logu oluşturuldu`
    })
    
  } catch (error) {
    console.error('Başlangıç logları oluşturma hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Başlangıç logları oluşturulamadı'
    }, { status: 500 })
  }
}
