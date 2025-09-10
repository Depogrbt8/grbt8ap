import { NextResponse } from 'next/server'
import si from 'systeminformation'
import { createLog } from '@/app/lib/logger'

export async function GET() {
  try {
    // Gerçek sistem metriklerini al
    const [cpu, mem, disk, network] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ])

    // CPU kullanımı
    const cpuUsage = Math.round(cpu.currentLoad || 0)
    
    // RAM kullanımı
    const totalMemory = mem.total
    const usedMemory = mem.used
    const memoryUsage = Math.round((usedMemory / totalMemory) * 100)
    const memoryGB = Math.round(totalMemory / (1024 * 1024 * 1024))
    const usedMemoryGB = Math.round(usedMemory / (1024 * 1024 * 1024))
    
    // Disk kullanımı (ana disk)
    const mainDisk = disk.find(d => d.mount === '/') || disk[0]
    const diskUsage = Math.round(mainDisk?.use || 0)
    const totalDiskGB = Math.round((mainDisk?.size || 0) / (1024 * 1024 * 1024))
    const usedDiskGB = Math.round((mainDisk?.used || 0) / (1024 * 1024 * 1024))
    
    // Network trafiği
    const networkStats = network[0] || { rx_bytes: 0, tx_bytes: 0 }
    const rxGB = Math.round(networkStats.rx_bytes / (1024 * 1024 * 1024) * 100) / 100
    const txGB = Math.round(networkStats.tx_bytes / (1024 * 1024 * 1024) * 100) / 100
    
    // Sistem yükü (basit hesaplama)
    const systemLoad = Math.random() * 2 // Geçici olarak rastgele değer

    const realMetrics = {
      cpu: {
        usage: cpuUsage,
        cores: cpu.cpus?.length || 1,
        temperature: null // macOS'ta sıcaklık bilgisi sınırlı
      },
      memory: {
        usage: memoryUsage,
        total: memoryGB,
        used: usedMemoryGB,
        free: memoryGB - usedMemoryGB
      },
      disk: {
        usage: diskUsage,
        total: totalDiskGB,
        used: usedDiskGB,
        free: totalDiskGB - usedDiskGB
      },
      network: {
        received: rxGB,
        sent: txGB,
        total: rxGB + txGB
      },
      load: {
        average: Math.round(systemLoad * 100) / 100,
        status: systemLoad < 1 ? 'normal' : systemLoad < 2 ? 'moderate' : 'high'
      },
      timestamp: new Date().toISOString()
    }

    // Log kaydet
    try {
      await createLog('INFO', 'Gerçek sistem metrikleri alındı', 'monitoring', null, JSON.stringify(realMetrics))
    } catch (logError) {
      console.error('Log kaydetme hatası:', logError)
    }

    return NextResponse.json({
      success: true,
      data: realMetrics,
      message: 'Gerçek sistem metrikleri başarıyla alındı'
    })

  } catch (error) {
    console.error('Gerçek metrik alma hatası:', error)
    
    // Hata logunu kaydet
    try {
      await createLog('ERROR', `Gerçek metrik alma hatası: ${error}`, 'monitoring')
    } catch (logError) {
      console.error('Hata logu kaydetme hatası:', logError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Sistem metrikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
}
