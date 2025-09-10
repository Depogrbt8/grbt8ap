import { NextResponse } from 'next/server'
import { createLog } from '@/app/lib/logger'

export async function GET() {
  try {
    // Gerçek sistem metriklerini al
    const metricsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3004'}/api/system/real-metrics`)
    const metricsData = await metricsResponse.json()
    
    if (!metricsData.success) {
      throw new Error('Sistem metrikleri alınamadı')
    }

    const metrics = metricsData.data

    // Sağlık skorlarını hesapla
    const cpuScore = calculateCPUScore(metrics.cpu.usage)
    const memoryScore = calculateMemoryScore(metrics.memory.usage)
    const diskScore = calculateDiskScore(metrics.disk.usage)
    const loadScore = calculateLoadScore(metrics.load.average)

    // Genel sağlık skoru (ağırlıklı ortalama)
    const overallScore = Math.round(
      (cpuScore * 0.3 + memoryScore * 0.3 + diskScore * 0.25 + loadScore * 0.15)
    )

    // Sağlık durumu belirleme
    const healthStatus = getHealthStatus(overallScore)
    const healthColor = getHealthColor(overallScore)

    // Detaylı sağlık raporu
    const healthReport = {
      overall: {
        score: overallScore,
        status: healthStatus,
        color: healthColor,
        message: getHealthMessage(overallScore)
      },
      components: {
        cpu: {
          score: cpuScore,
          status: getHealthStatus(cpuScore),
          color: getHealthColor(cpuScore),
          usage: metrics.cpu.usage,
          message: getCPUHealthMessage(metrics.cpu.usage)
        },
        memory: {
          score: memoryScore,
          status: getHealthStatus(memoryScore),
          color: getHealthColor(memoryScore),
          usage: metrics.memory.usage,
          message: getMemoryHealthMessage(metrics.memory.usage)
        },
        disk: {
          score: diskScore,
          status: getHealthStatus(diskScore),
          color: getHealthColor(diskScore),
          usage: metrics.disk.usage,
          message: getDiskHealthMessage(metrics.disk.usage)
        },
        load: {
          score: loadScore,
          status: getHealthStatus(loadScore),
          color: getHealthColor(loadScore),
          average: metrics.load.average,
          message: getLoadHealthMessage(metrics.load.average)
        }
      },
      recommendations: getRecommendations({
        cpu: metrics.cpu.usage,
        memory: metrics.memory.usage,
        disk: metrics.disk.usage,
        load: metrics.load.average
      }),
      timestamp: new Date().toISOString()
    }

    // Log kaydet
    try {
      await createLog('INFO', `Sistem sağlığı skoru hesaplandı: ${overallScore}/100`, 'monitoring', null, JSON.stringify(healthReport))
    } catch (logError) {
      console.error('Log kaydetme hatası:', logError)
    }

    return NextResponse.json({
      success: true,
      data: healthReport,
      message: 'Sistem sağlığı skoru başarıyla hesaplandı'
    })

  } catch (error) {
    console.error('Sağlık skoru hesaplama hatası:', error)
    
    // Hata logunu kaydet
    try {
      await createLog('ERROR', `Sağlık skoru hesaplama hatası: ${error}`, 'monitoring')
    } catch (logError) {
      console.error('Hata logu kaydetme hatası:', logError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Sistem sağlığı skoru hesaplanamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
}

// CPU skoru hesaplama
function calculateCPUScore(usage: number): number {
  if (usage < 50) return 100
  if (usage < 70) return 100 - (usage - 50) * 2.5
  if (usage < 85) return 100 - (usage - 70) * 3.33
  return Math.max(0, 100 - (usage - 85) * 4)
}

// Memory skoru hesaplama
function calculateMemoryScore(usage: number): number {
  if (usage < 60) return 100
  if (usage < 80) return 100 - (usage - 60) * 2.5
  if (usage < 90) return 100 - (usage - 80) * 3.33
  return Math.max(0, 100 - (usage - 90) * 4)
}

// Disk skoru hesaplama
function calculateDiskScore(usage: number): number {
  if (usage < 70) return 100
  if (usage < 85) return 100 - (usage - 70) * 2
  if (usage < 95) return 100 - (usage - 85) * 3.33
  return Math.max(0, 100 - (usage - 95) * 4)
}

// Load skoru hesaplama
function calculateLoadScore(load: number): number {
  if (load < 1) return 100
  if (load < 2) return 100 - (load - 1) * 50
  if (load < 3) return 100 - (load - 2) * 33.33
  return Math.max(0, 100 - (load - 3) * 25)
}

// Sağlık durumu belirleme
function getHealthStatus(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  if (score >= 20) return 'poor'
  return 'critical'
}

// Sağlık rengi belirleme
function getHealthColor(score: number): string {
  if (score >= 80) return 'green'
  if (score >= 60) return 'yellow'
  if (score >= 40) return 'orange'
  if (score >= 20) return 'red'
  return 'red'
}

// Genel sağlık mesajı
function getHealthMessage(score: number): string {
  if (score >= 80) return 'Sistem mükemmel durumda'
  if (score >= 60) return 'Sistem iyi durumda'
  if (score >= 40) return 'Sistem orta durumda'
  if (score >= 20) return 'Sistem kötü durumda'
  return 'Sistem kritik durumda'
}

// CPU sağlık mesajı
function getCPUHealthMessage(usage: number): string {
  if (usage < 50) return 'CPU kullanımı normal'
  if (usage < 70) return 'CPU kullanımı artıyor'
  if (usage < 85) return 'CPU kullanımı yüksek'
  return 'CPU kullanımı kritik seviyede'
}

// Memory sağlık mesajı
function getMemoryHealthMessage(usage: number): string {
  if (usage < 60) return 'Bellek kullanımı normal'
  if (usage < 80) return 'Bellek kullanımı artıyor'
  if (usage < 90) return 'Bellek kullanımı yüksek'
  return 'Bellek kullanımı kritik seviyede'
}

// Disk sağlık mesajı
function getDiskHealthMessage(usage: number): string {
  if (usage < 70) return 'Disk kullanımı normal'
  if (usage < 85) return 'Disk kullanımı artıyor'
  if (usage < 95) return 'Disk kullanımı yüksek'
  return 'Disk kullanımı kritik seviyede'
}

// Load sağlık mesajı
function getLoadHealthMessage(load: number): string {
  if (load < 1) return 'Sistem yükü normal'
  if (load < 2) return 'Sistem yükü artıyor'
  if (load < 3) return 'Sistem yükü yüksek'
  return 'Sistem yükü kritik seviyede'
}

// Öneriler
function getRecommendations(metrics: { cpu: number; memory: number; disk: number; load: number }): string[] {
  const recommendations: string[] = []

  if (metrics.cpu > 70) {
    recommendations.push('CPU kullanımını azaltmak için gereksiz işlemleri kapatın')
  }
  if (metrics.memory > 80) {
    recommendations.push('Bellek kullanımını azaltmak için uygulamaları yeniden başlatın')
  }
  if (metrics.disk > 85) {
    recommendations.push('Disk alanını temizlemek için gereksiz dosyaları silin')
  }
  if (metrics.load > 2) {
    recommendations.push('Sistem yükünü azaltmak için servisleri optimize edin')
  }

  if (recommendations.length === 0) {
    recommendations.push('Sistem sağlığı iyi durumda, herhangi bir iyileştirme gerekmiyor')
  }

  return recommendations
}
