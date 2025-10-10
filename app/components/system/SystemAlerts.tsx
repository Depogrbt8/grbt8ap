'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface AlertItem {
  component: string
  metric: string
  value: string | number
  threshold: string | number
  severity: 'warning' | 'critical'
  message: string
}

interface SystemAlertProps {
  className?: string
}

export default function SystemAlerts({ className = '' }: SystemAlertProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkSystemRisks = async () => {
    setLoading(true)
    const risks: AlertItem[] = []

    try {
      // 1. Güvenlik durumu kontrolü
      const securityRes = await fetch('/api/system/security/status')
      if (securityRes.ok) {
        const security = await securityRes.json()
        const data = security.data

        if (data?.realTimeThreats?.activeAttacks > 10) {
          risks.push({
            component: 'Güvenlik',
            metric: 'Aktif Saldırı',
            value: data.realTimeThreats.activeAttacks,
            threshold: 10,
            severity: 'critical',
            message: `${data.realTimeThreats.activeAttacks} aktif saldırı tespit edildi`
          })
        }

        if (data?.rateLimitingStatus?.blockedRequests > 100) {
          risks.push({
            component: 'Güvenlik',
            metric: 'Rate Limit',
            value: data.rateLimitingStatus.blockedRequests,
            threshold: 100,
            severity: 'warning',
            message: `${data.rateLimitingStatus.blockedRequests} istek engellenmiş`
          })
        }

        if (data?.overallScore < 70) {
          risks.push({
            component: 'Güvenlik',
            metric: 'Güvenlik Skoru',
            value: data.overallScore,
            threshold: 70,
            severity: data.overallScore < 50 ? 'critical' : 'warning',
            message: `Güvenlik skoru düşük: ${data.overallScore}/100`
          })
        }
      }

      // 2. Admin Panel durumu kontrolü
      const [adminMetricsRes, adminHealthRes] = await Promise.all([
        fetch('/api/system/real-metrics'),
        fetch('/api/system/health-score')
      ])

      if (adminMetricsRes.ok && adminHealthRes.ok) {
        const metrics = await adminMetricsRes.json()
        const health = await adminHealthRes.json()

        if (metrics.success && health.success) {
          const m = metrics.data
          const h = health.data

          if (m.cpu.usage > 80) {
            risks.push({
              component: 'Admin Panel',
              metric: 'CPU Kullanımı',
              value: `${Math.round(m.cpu.usage)}%`,
              threshold: '80%',
              severity: m.cpu.usage > 90 ? 'critical' : 'warning',
              message: `CPU kullanımı yüksek: %${Math.round(m.cpu.usage)}`
            })
          }

          if (m.memory.usage > 90) {
            risks.push({
              component: 'Admin Panel',
              metric: 'Bellek Kullanımı',
              value: `${Math.round(m.memory.usage)}%`,
              threshold: '90%',
              severity: m.memory.usage > 95 ? 'critical' : 'warning',
              message: `Bellek kullanımı yüksek: %${Math.round(m.memory.usage)}`
            })
          }

          if (m.disk.usage > 85) {
            risks.push({
              component: 'Admin Panel',
              metric: 'Disk Kullanımı',
              value: `${Math.round(m.disk.usage)}%`,
              threshold: '85%',
              severity: m.disk.usage > 95 ? 'critical' : 'warning',
              message: `Disk kullanımı yüksek: %${Math.round(m.disk.usage)}`
            })
          }

          if (h.data.overall.score < 60) {
            risks.push({
              component: 'Admin Panel',
              metric: 'Sistem Sağlığı',
              value: h.data.overall.score,
              threshold: 60,
              severity: h.data.overall.score < 40 ? 'critical' : 'warning',
              message: `Admin panel sağlığı düşük: ${h.data.overall.score}/100`
            })
          }
        }
      }

      // 3. Ana Site durumu kontrolü
      const [mainStatusRes, mainHealthRes] = await Promise.all([
        fetch('https://anasite.grbt8.store/api/system/status').catch(() => null),
        fetch('https://anasite.grbt8.store/api/system/health-score').catch(() => null)
      ])

      if (mainStatusRes?.ok && mainHealthRes?.ok) {
        const mainStatus = await mainStatusRes.json()
        const mainHealth = await mainHealthRes.json()

        if (mainStatus.success && mainHealth.success) {
          const status = mainStatus.data
          const health = mainHealth.data

          if (health.metrics.cpuUsage > 80) {
            risks.push({
              component: 'Ana Site',
              metric: 'CPU Kullanımı',
              value: `${Math.round(health.metrics.cpuUsage)}%`,
              threshold: '80%',
              severity: health.metrics.cpuUsage > 90 ? 'critical' : 'warning',
              message: `Ana site CPU kullanımı yüksek: %${Math.round(health.metrics.cpuUsage)}`
            })
          }

          if (health.metrics.memoryUsage > 90) {
            risks.push({
              component: 'Ana Site',
              metric: 'Bellek Kullanımı',
              value: `${Math.round(health.metrics.memoryUsage)}%`,
              threshold: '90%',
              severity: health.metrics.memoryUsage > 95 ? 'critical' : 'warning',
              message: `Ana site bellek kullanımı yüksek: %${Math.round(health.metrics.memoryUsage)}`
            })
          }

          if (health.metrics.loadAverage > 2.5) {
            risks.push({
              component: 'Ana Site',
              metric: 'Sistem Yükü',
              value: health.metrics.loadAverage.toFixed(2),
              threshold: 2.5,
              severity: health.metrics.loadAverage > 4 ? 'critical' : 'warning',
              message: `Ana site sistem yükü yüksek: ${health.metrics.loadAverage.toFixed(2)}`
            })
          }

          if (health.score < 60) {
            risks.push({
              component: 'Ana Site',
              metric: 'Site Sağlığı',
              value: health.score,
              threshold: 60,
              severity: health.score < 40 ? 'critical' : 'warning',
              message: `Ana site sağlığı düşük: ${health.score}/100`
            })
          }

          if (status.database.status !== 'connected') {
            risks.push({
              component: 'Ana Site',
              metric: 'Veritabanı',
              value: status.database.status,
              threshold: 'connected',
              severity: 'critical',
              message: 'Ana site veritabanı bağlantısı kesilmiş'
            })
          }
        }
      } else if (!mainStatusRes?.ok) {
        risks.push({
          component: 'Ana Site',
          metric: 'Bağlantı',
          value: 'Erişilemiyor',
          threshold: 'Erişilebilir',
          severity: 'critical',
          message: 'Ana site erişilemiyor veya yanıt vermiyor'
        })
      }

      // 4. Backup sistemi kontrolü
      const backupSourcesRes = await fetch('/api/database-backup/sources')
      if (backupSourcesRes.ok) {
        const backup = await backupSourcesRes.json()
        if (backup.success && backup.data) {
          const githubSource = backup.data.find((s: any) => s.key === 'github-hourly')
          if (githubSource && !githubSource.active) {
            risks.push({
              component: 'Yedekleme',
              metric: 'GitHub Backup',
              value: 'Pasif',
              threshold: 'Aktif',
              severity: 'warning',
              message: 'GitHub backup sistemi pasif durumda'
            })
          }
        }
      }

      setAlerts(risks)
    } catch (error) {
      console.error('Risk analizi hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemRisks()
    
    // Her 60 saniyede bir kontrol et
    const interval = setInterval(checkSystemRisks, 60000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading && alerts.length === 0) {
    return null
  }

  // Debug: Her zaman göster (geçici)
  // if (alerts.length === 0) {
  //   return null
  // }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warningCount = alerts.filter(a => a.severity === 'warning').length

  return (
    <>
      {/* Uyarı Badge */}
      <div className={`${className}`}>
        {alerts.length > 0 ? (
          <button
            onClick={() => setShowPopup(true)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              criticalCount > 0
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Uyarı: {alerts.length}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Sistem Normal</span>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow border w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-1">
                <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
                <h3 className="text-sm font-semibold text-gray-900">
                  Sistem Uyarıları ({alerts.length})
                </h3>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border-l-4 ${
                      alert.severity === 'critical'
                        ? 'border-red-500 bg-red-50'
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {alert.component}
                        </span>
                        <span className="text-xs text-gray-600">
                          → {alert.metric}
                        </span>
                      </div>
                      <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity === 'critical' ? 'Kritik' : 'Uyarı'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      {alert.message}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Değer: {alert.value} | Eşik: {alert.threshold}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {criticalCount > 0 && `${criticalCount} kritik`}
                  {criticalCount > 0 && warningCount > 0 && ', '}
                  {warningCount > 0 && `${warningCount} uyarı`}
                </span>
                <button
                  onClick={checkSystemRisks}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-xs"
                >
                  {loading ? 'Kontrol ediliyor...' : 'Yenile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
