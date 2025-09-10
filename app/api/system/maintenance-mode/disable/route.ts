import { NextResponse } from 'next/server'
import { createLog } from '@/app/lib/logger'

// Basit in-memory bakım modu durumu (gerçek uygulamada veritabanı kullanılır)
let maintenanceMode = false
let maintenanceData = {
  reason: '',
  startTime: null as Date | null,
  duration: ''
}

export async function DELETE() {
  try {
    console.log('Bakım modu kapatma işlemi başlatıldı')
    
    // Bakım modunu kapat
    maintenanceMode = false
    maintenanceData = {
      reason: '',
      startTime: null,
      duration: ''
    }
    
    console.log('Bakım modu kapatıldı')
    
    // Log kaydet
    await createLog({
      level: 'INFO',
      message: 'Bakım modu kapatıldı',
      source: 'maintenance'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Bakım modu başarıyla kapatıldı',
      timestamp: new Date().toISOString(),
      maintenanceMode: false
    })

  } catch (error) {
    console.error('Bakım modu kapatma hatası:', error)
    
    // Hata logu
    await createLog({
      level: 'ERROR',
      message: 'Bakım modu kapatma hatası',
      source: 'maintenance',
      metadata: { error: error.message }
    })
    
    return NextResponse.json({
      success: false,
      error: 'Bakım modu kapatma işlemi başarısız',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
