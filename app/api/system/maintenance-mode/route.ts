import { NextRequest, NextResponse } from 'next/server'
import { createLog } from '@/app/lib/logger'
import { requireAdmin } from '@/lib/authMiddleware'
import { connectionManager, withTimeout, classifyError } from '@/lib/connectionManager'

// Basit in-memory bakım modu durumu (gerçek uygulamada veritabanı kullanılır)
let maintenanceMode = false
let maintenanceData = {
  reason: '',
  startTime: null as Date | null,
  duration: ''
}

export async function POST(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    console.log('🔧 Bakım modu işlemi başlatıldı')
    
    // Connection manager ile güvenli işlem
    const result = await connectionManager.safeDatabaseOperation(async () => {
      // Bakım modunu aktifleştir
      maintenanceMode = true
      maintenanceData = {
        reason: 'Sistem bakımı',
        startTime: new Date(),
        duration: '30 dakika'
      }
      
      console.log('✅ Bakım modu aktifleştirildi:', maintenanceData)
      
      // Log kaydet - timeout ile korumalı
      await withTimeout(
        createLog({
          level: 'WARNING',
          message: 'Bakım modu aktifleştirildi',
          source: 'maintenance',
          metadata: maintenanceData
        }),
        5000, // 5 saniye timeout
        'maintenance_log'
      )
      
      return {
        maintenanceMode: true,
        estimatedDuration: '30 dakika',
        maintenanceStart: maintenanceData.startTime
      }
    }, 'maintenance_mode_activation')
    
    return NextResponse.json({
      success: true,
      message: 'Bakım modu başarıyla etkinleştirildi',
      timestamp: new Date().toISOString(),
      ...result
    })

  } catch (error) {
    console.error('❌ Bakım modu hatası:', error)
    
    // Error classification
    const errorInfo = classifyError(error)
    console.log(`🔍 Hata türü: ${errorInfo.type}, Retryable: ${errorInfo.retryable}`)
    
    // Güvenli hata logu
    try {
      await withTimeout(
        createLog({
          level: 'ERROR',
          message: `Bakım modu aktifleştirme hatası: ${errorInfo.message}`,
          source: 'maintenance',
          metadata: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: errorInfo.type,
            retryable: errorInfo.retryable
          }
        }),
        3000, // 3 saniye timeout
        'error_log'
      )
    } catch (logError) {
      console.error('⚠️ Log yazma hatası:', logError)
    }
    
    return NextResponse.json({
      success: false,
      error: `Bakım modu işlemi başarısız: ${errorInfo.message}`,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    // Connection stats ekle
    const connectionStats = await connectionManager.getConnectionStats()
    
    return NextResponse.json({
      success: true,
      maintenanceMode: maintenanceMode,
      maintenanceReason: maintenanceData.reason,
      maintenanceStart: maintenanceData.startTime,
      estimatedDuration: maintenanceData.duration,
      connectionStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Bakım modu durumu hatası:', error)
    
    const errorInfo = classifyError(error)
    
    return NextResponse.json({
      success: false,
      error: `Bakım modu durumu alınamadı: ${errorInfo.message}`,
      errorType: errorInfo.type,
      maintenanceMode: false,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
