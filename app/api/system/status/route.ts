import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$connect()
    
    // Sistem metriklerini al (gerçek veriler yerine simüle edilmiş)
    const systemMetrics = {
      cpu: Math.floor(Math.random() * 30) + 10, // %10-40 arası
      ram: {
        used: Math.floor(Math.random() * 2) + 1, // 1-3GB
        total: 8
      },
      disk: Math.floor(Math.random() * 30) + 30, // %30-60 arası
      uptime: '15 gün 6 saat',
      version: 'v1.2.3',
      lastUpdate: '2 saat önce'
    }

    // Sistem hatalarını kontrol et
    const errors = []
    
    // Veritabanı bağlantısı kontrolü
    try {
      await prisma.user.findFirst()
    } catch (error) {
      errors.push({
        type: 'critical',
        title: 'Veritabanı Bağlantısı',
        message: 'Prisma client bağlantısı başarısız',
        time: '2 saat önce'
      })
    }

    // CPU kullanımı kontrolü
    if (systemMetrics.cpu > 80) {
      errors.push({
        type: 'warning',
        title: 'Yüksek CPU Kullanımı',
        message: `CPU kullanımı %${systemMetrics.cpu}'in üzerinde`,
        time: '15 dakika önce'
      })
    }

    return NextResponse.json({
      success: true,
      metrics: systemMetrics,
      errors: errors,
      status: 'active'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Sistem durumu alınamadı',
      status: 'error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
