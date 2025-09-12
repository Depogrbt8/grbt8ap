import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Demo güvenlik verileri - gerçek uygulamada veritabanından çekilecek
    const securityData = {
      overallScore: 95,
      failedLogins: 3,
      blockedIPs: 1,
      lastCheck: new Date().toISOString(),
      threats: {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0
      },
      firewallStatus: {
        active: true,
        rules: 12,
        blockedRequests: 45
      },
      sslStatus: {
        valid: true,
        daysUntilExpiry: 30
      },
      rateLimitingStatus: {
        active: true,
        blockedRequests: 12
      },
      message: 'Tüm güvenlik sistemleri aktif ve çalışıyor',
      
      // Saldırı Analizi
      attackAnalysis: {
        last24h: 12,
        topCountries: [
          { country: 'Çin', count: 45, flag: '🇨🇳' },
          { country: 'Rusya', count: 32, flag: '🇷🇺' },
          { country: 'ABD', count: 28, flag: '🇺🇸' },
          { country: 'Almanya', count: 15, flag: '🇩🇪' }
        ],
        attackTypes: {
          ddos: 8,
          bruteForce: 15,
          xss: 3,
          sqlInjection: 2
        },
        peakHours: ['02:00', '14:00', '22:00']
      },
      
      // Şüpheli Aktivite
      suspiciousActivity: {
        botTraffic: 156,
        vpnUsers: 23,
        torUsers: 7,
        failedLogins: 89,
        unusualHours: 12
      },
      
      // Gerçek Zamanlı Tehditler
      realTimeThreats: {
        activeAttacks: 3,
        blockedRequests: 234,
        firewallAlerts: 8,
        malwareDetected: 0,
        lastThreat: '2 dakika önce'
      },
      
      // Coğrafi Analiz
      geoAnalysis: {
        totalCountries: 45,
        riskiestRegions: ['Asya', 'Doğu Avrupa'],
        safestRegions: ['Kuzey Avrupa', 'Okyanusya'],
        proxyUsage: 12.5
      }
    }

    return NextResponse.json({
      success: true,
      data: securityData
    })
  } catch (error: any) {
    console.error('Güvenlik durumu alınamadı:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
