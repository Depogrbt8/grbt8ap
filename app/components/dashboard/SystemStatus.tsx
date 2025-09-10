'use client'
import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Settings, BarChart3, RefreshCw, HardDrive, Clock, Play, Pause, Download } from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number | null
  }
  memory: {
    usage: number
    total: number
    used: number
    free: number
  }
  disk: {
    usage: number
    total: number
    used: number
    free: number
  }
  network: {
    received: number
    sent: number
    total: number
  }
  load: {
    average: number
    status: string
  }
  uptime: string
  version: string
  lastUpdate: string
}

interface SystemError {
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  time: string
}

interface SystemStatus {
  success: boolean
  metrics: SystemMetrics
  errors: SystemError[]
  status: string
}

interface HealthScore {
  overall: {
    score: number
    status: string
    color: string
    message: string
  }
  components: {
    cpu: {
      score: number
      status: string
      color: string
      usage: number
      message: string
    }
    memory: {
      score: number
      status: string
      color: string
      usage: number
      message: string
    }
    disk: {
      score: number
      status: string
      color: string
      usage: number
      message: string
    }
    load: {
      score: number
      status: string
      color: string
      average: number
      message: string
    }
  }
  recommendations: string[]
  timestamp: string
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  source: string
  timestamp: string
  action: string
  priority: number
}

interface AlertData {
  alerts: SystemAlert[]
  stats: {
    total: number
    critical: number
    warning: number
    info: number
  }
  timestamp: string
}

interface MaintenanceStatus {
  maintenanceMode: boolean
  maintenanceReason?: string
  maintenanceStart?: string
  estimatedDuration?: string
}

interface BackupStatus {
  config: {
    enabled: boolean
    schedule: string
    retention: number
    includeDatabase: boolean
    includeUploads: boolean
    includeLogs: boolean
  }
  lastBackup?: string
  nextBackup?: string
  backupSize: number
  status: string
}

export default function SystemStatus() {
  const [systemData, setSystemData] = useState<SystemStatus | null>(null)
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [alertData, setAlertData] = useState<AlertData | null>(null)
  const [securityStatus, setSecurityStatus] = useState<any>(null)
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false)
  const [logsModalOpen, setLogsModalOpen] = useState(false)
  const [alertsModalOpen, setAlertsModalOpen] = useState(false)
  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeUsers, setActiveUsers] = useState({
    current: 0,
    last24h: 0,
    total: 0,
    newUsers7Days: 0
  })

  // Yardımcı fonksiyonlar
  const formatUptime = (seconds: number) => {
    if (!seconds) return 'Bilinmiyor'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'green'
    if (score >= 70) return 'yellow'
    return 'red'
  }

  const getHealthMessage = (score: number) => {
    if (score >= 90) return 'Mükemmel'
    if (score >= 70) return 'İyi'
    if (score >= 50) return 'Orta'
    return 'Kötü'
  }

  const fetchSystemStatus = async () => {
    try {
      // Ana site durumunu çek
      const response = await fetch('/api/system/main-site-status')
      const data = await response.json()
      
      if (data.success) {
        // Ana site verilerini SystemStatus formatına dönüştür
        setSystemData({
          success: true,
          metrics: {
            cpu: {
              usage: data.data.cpu?.usage || 0,
              cores: data.data.cpu?.cores || 0,
              temperature: null
            },
            memory: {
              usage: data.data.memory?.usage || 0,
              total: data.data.memory?.total || 0,
              used: data.data.memory?.total - data.data.memory?.free || 0,
              free: data.data.memory?.free || 0
            },
            disk: {
              usage: data.data.disk?.usage || 0,
              total: 0,
              used: 0,
              free: 0
            },
            network: {
              received: 0,
              sent: 0,
              total: 0
            },
            load: {
              average: data.data.metrics?.loadAverage || 0,
              status: data.data.metrics?.loadAverage > 1 ? 'Yüksek' : 'Normal'
            },
            uptime: formatUptime(data.data.uptime),
            version: data.data.version,
            lastUpdate: data.data.lastUpdate
          },
          errors: [],
          status: data.data.serverStatus
        })
        
        // Sağlık skoru bilgilerini ayarla
        setHealthScore({
          overall: {
            score: data.data.healthScore,
            status: data.data.healthStatus,
            color: getHealthColor(data.data.healthScore),
            message: getHealthMessage(data.data.healthScore)
          },
          components: {
            cpu: {
              score: 100 - (data.data.cpu?.usage || 0),
              status: data.data.cpu?.usage > 80 ? 'Kritik' : data.data.cpu?.usage > 60 ? 'Uyarı' : 'İyi',
              color: data.data.cpu?.usage > 80 ? 'red' : data.data.cpu?.usage > 60 ? 'yellow' : 'green',
              usage: data.data.cpu?.usage || 0,
              message: `CPU kullanımı: %${data.data.cpu?.usage || 0}`
            },
            memory: {
              score: 100 - (data.data.memory?.usage || 0),
              status: data.data.memory?.usage > 90 ? 'Kritik' : data.data.memory?.usage > 80 ? 'Uyarı' : 'İyi',
              color: data.data.memory?.usage > 90 ? 'red' : data.data.memory?.usage > 80 ? 'yellow' : 'green',
              usage: data.data.memory?.usage || 0,
              message: `Bellek kullanımı: %${data.data.memory?.usage || 0}`
            },
            disk: {
              score: 100 - (data.data.disk?.usage || 0),
              status: data.data.disk?.usage > 95 ? 'Kritik' : data.data.disk?.usage > 85 ? 'Uyarı' : 'İyi',
              color: data.data.disk?.usage > 95 ? 'red' : data.data.disk?.usage > 85 ? 'yellow' : 'green',
              usage: data.data.disk?.usage || 0,
              message: `Disk kullanımı: %${data.data.disk?.usage || 0}`
            },
            load: {
              score: Math.max(0, 100 - (data.data.metrics?.loadAverage || 0) * 20),
              status: (data.data.metrics?.loadAverage || 0) > 2 ? 'Kritik' : (data.data.metrics?.loadAverage || 0) > 1 ? 'Uyarı' : 'İyi',
              color: (data.data.metrics?.loadAverage || 0) > 2 ? 'red' : (data.data.metrics?.loadAverage || 0) > 1 ? 'yellow' : 'green',
              average: data.data.metrics?.loadAverage || 0,
              message: `Sistem yükü: ${data.data.metrics?.loadAverage || 0}`
            }
          },
          recommendations: data.data.healthIssues || [],
          timestamp: data.data.lastUpdate
        })
        
        // Aktif kullanıcı bilgilerini ayarla
        setActiveUsers({
          current: data.data.activeUsers || 0,
          last24h: data.data.activeUsers24h || 0,
          total: data.data.totalUsers || 0,
          newUsers7Days: data.data.newUsers7Days || 0
        })
        
      } else {
        setError(data.error || 'Ana site durumu alınamadı')
      }
    } catch (error) {
      console.error('Ana site durumu alınamadı:', error)
      setSystemData({
        success: false,
        metrics: {
          cpu: { usage: 0, cores: 1, temperature: null },
          memory: { usage: 0, total: 8, used: 0, free: 8 },
          disk: { usage: 0, total: 256, used: 0, free: 256 },
          network: { received: 0, sent: 0, total: 0 },
          load: { average: 0, status: 'normal' },
          uptime: 'Bilinmiyor',
          version: 'v1.2.3',
          lastUpdate: 'Şimdi'
        },
        errors: [{
          type: 'critical',
          title: 'Ana Site Bağlantısı',
          message: 'Ana site durumu alınamadı',
          time: 'Şimdi'
        }],
        status: 'error'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchHealthScore = async () => {
    // Sağlık skoru artık fetchSystemStatus içinde ayarlanıyor
    // Bu fonksiyon boş bırakıldı
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/system/alerts')
      const data = await response.json()
      if (data.success) {
        setAlertData(data.data)
      }
    } catch (error) {
      console.error('Sistem uyarıları alınamadı:', error)
    }
  }

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/security/analysis')
      const data = await response.json()
      if (data.success) {
        setSecurityStatus(data.data)
      }
    } catch (error) {
      console.error('Güvenlik durumu alınamadı:', error)
    }
  }

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/system/maintenance-mode')
      const data = await response.json()
      setMaintenanceStatus(data)
    } catch (error) {
      console.error('Bakım modu durumu alınamadı:', error)
      setMaintenanceStatus({
        maintenanceMode: false,
        maintenanceReason: '',
        maintenanceStart: '',
        estimatedDuration: ''
      })
    }
  }

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch('/api/system/backup')
      const data = await response.json()
      if (data.success) {
        setBackupStatus(data.data)
      }
    } catch (error) {
      console.error('Yedekleme durumu alınamadı:', error)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    fetchHealthScore()
    fetchAlerts()
    fetchSecurityStatus()
    fetchMaintenanceStatus()
    fetchBackupStatus()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSystemStatus()
    fetchHealthScore()
    fetchAlerts()
    fetchSecurityStatus()
    fetchMaintenanceStatus()
    fetchBackupStatus()
  }

  const handleMaintenanceClick = async () => {
    console.log('Bakım modu butonuna tıklandı!')
    setMaintenanceModalOpen(true)
    console.log('Modal açıldı:', true)
    await fetchMaintenanceStatus()
  }

  const handleLogsClick = async () => {
    setLogsModalOpen(true)
    setLogsLoading(true)
    
    try {
      const response = await fetch('/api/system/logs')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
      } else {
        alert(`❌ Hata: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Loglar alınamadı')
    } finally {
      setLogsLoading(false)
    }
  }

  const handleAlertsClick = async () => {
    setAlertsModalOpen(true)
    setAlertsLoading(true)
    
    try {
      await fetchAlerts()
    } catch (error) {
      alert('❌ Uyarılar alınamadı')
    } finally {
      setAlertsLoading(false)
    }
  }

  // Başlangıç logları ekle
  useEffect(() => {
    const addInitialLogs = async () => {
      try {
        await fetch('/api/system/logs/init', { method: 'POST' })
      } catch (error) {
        console.log('Başlangıç logları zaten mevcut')
      }
    }
    
    addInitialLogs()
  }, [])

  const handleToggleMaintenance = async () => {
    setMaintenanceLoading(true)
    try {
      if (maintenanceStatus?.maintenanceMode) {
        // Bakım modunu kapat
        const response = await fetch('/api/system/maintenance-mode/disable', {
          method: 'DELETE'
        })
        const data = await response.json()
        
        if (data.success) {
          alert('Bakım modu başarıyla kapatıldı!')
        } else {
          alert('Bakım modu kapatılamadı: ' + data.error)
        }
      } else {
        // Bakım modunu aç
        const response = await fetch('/api/system/maintenance-mode', {
          method: 'POST'
        })
        const data = await response.json()
        
        if (data.success) {
          alert('Bakım modu başarıyla açıldı!')
        } else {
          alert('Bakım modu açılamadı: ' + data.error)
        }
      }
      
      // Durumu yenile
      await fetchMaintenanceStatus()
    } catch (error) {
      alert('İşlem başarısız!')
      console.error('Bakım modu işlemi hatası:', error)
    } finally {
      setMaintenanceLoading(false)
    }
  }

  const handleBackupClick = () => {
    setBackupModalOpen(true)
  }

  const handleCreateBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ Yedekleme başarıyla oluşturuldu!\n\nBoyut: ${data.size}\nKonum: ${data.path}`)
        await fetchBackupStatus() // Durumu yenile
      } else {
        alert(`❌ Yedekleme oluşturulamadı!\n\n${data.error}`)
      }
    } catch (error) {
      alert('❌ Yedekleme işlemi sırasında hata oluştu!')
      console.error('Backup Error:', error)
    } finally {
      setBackupLoading(false)
    }
  }

  const handleToggleBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ ${data.message}`)
        await fetchBackupStatus() // Durumu yenile
      } else {
        alert(`❌ İşlem başarısız!\n\n${data.error}`)
      }
    } catch (error) {
      alert('❌ İşlem sırasında hata oluştu!')
      console.error('Toggle Backup Error:', error)
    } finally {
      setBackupLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    try {
      let endpoint = ''
      let method = 'POST'
      
      switch (action) {
        case 'Cache Temizle':
          endpoint = '/api/system/clear-cache'
          break
        case 'Bakım Modu':
          handleMaintenanceClick()
          return
        case 'Log Görüntüle':
          handleLogsClick()
          return
        case 'Yedekleme':
          handleBackupClick()
          return
        default:
          alert(`${action} işlemi başlatıldı!`)
          return
      }
      
      const response = await fetch(endpoint, { method })
      const data = await response.json()
      
      if (data.success) {
        alert(`${action} işlemi başarılı!\n\n${data.message}`)
      } else {
        alert(`${action} işlemi başarısız!\n\n${data.error}`)
      }
    } catch (error) {
      alert(`${action} işlemi sırasında hata oluştu!`)
      console.error('API Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 min-w-0">
        <div className="bg-white rounded-lg shadow p-8 w-full">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Sistem durumu yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 min-w-0">
      {/* Başlık ve Yenile Butonu */}
      <div className="flex items-center justify-end">
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Hata Uyarıları */}
      {systemData?.errors && systemData.errors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-900">Sistem Hataları</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {systemData.errors.map((error, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-md ${
                error.type === 'critical' ? 'bg-red-50 border border-red-200' :
                error.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                {error.type === 'critical' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : error.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    error.type === 'critical' ? 'text-red-800' :
                    error.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {error.title}
                  </div>
                  <div className={`text-xs mt-1 ${
                    error.type === 'critical' ? 'text-red-600' :
                    error.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {error.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{error.time}</div>
                </div>
                <button className={`text-xs hover:opacity-80 ${
                  error.type === 'critical' ? 'text-red-600 hover:text-red-800' :
                  error.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800' :
                  'text-blue-600 hover:text-blue-800'
                }`}>
                  {error.type === 'critical' ? 'Çöz' : error.type === 'warning' ? 'İncele' : 'Güncelle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Güvenlik Durumu */}
      {securityStatus && (
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Güvenlik Durumu</h3>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                securityStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                securityStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                securityStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {securityStatus.status === 'excellent' ? 'Mükemmel' :
                 securityStatus.status === 'good' ? 'İyi' :
                 securityStatus.status === 'fair' ? 'Orta' :
                 securityStatus.status === 'poor' ? 'Kötü' : 'Kritik'}
              </div>
              <button 
                onClick={fetchSecurityStatus}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Yenile</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* SSL Durumu */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${securityStatus?.sslStatus?.valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h4 className="font-medium text-sm">SSL Sertifikası</h4>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {securityStatus?.sslStatus?.valid ? 'Geçerli' : 'Geçersiz'}
              </p>
              <p className="text-xs text-gray-500">
                {securityStatus?.sslStatus?.daysUntilExpiry || 0} gün kaldı
              </p>
            </div>

            {/* Firewall Durumu */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${securityStatus?.firewallStatus?.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h4 className="font-medium text-sm">Firewall</h4>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {securityStatus?.firewallStatus?.active ? 'Aktif' : 'Pasif'}
              </p>
              <p className="text-xs text-gray-500">
                {securityStatus?.firewallStatus?.rules || 0} kural
              </p>
            </div>

            {/* Güvenlik Skoru */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  (securityStatus?.overallScore || 0) >= 80 ? 'bg-green-500' :
                  (securityStatus?.overallScore || 0) >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <h4 className="font-medium text-sm">Güvenlik Skoru</h4>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {securityStatus?.overallScore || 0}/100
              </p>
              <p className="text-xs text-gray-500">
                {securityStatus?.threats?.total || 0} açık
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>{securityStatus?.message || 'Güvenlik durumu normal'}</p>
            <p className="text-xs text-gray-500 mt-1">
              Son tarama: {securityStatus?.lastCheck ? new Date(securityStatus.lastCheck).toLocaleString('tr-TR') : 'Bilinmiyor'}
            </p>
          </div>
        </div>
      )}

      {/* Güvenlik Detayları */}
      {securityStatus && (
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Güvenlik Detayları</h3>
            <button 
              onClick={fetchSecurityStatus}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Yenile</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Saldırı Analizi */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 text-red-600">Saldırı Analizi</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Son 24h:</span>
                  <span className="font-medium">{securityStatus?.attackAnalysis?.last24h || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>DDoS:</span>
                  <span className="font-medium">{securityStatus?.attackAnalysis?.attackTypes?.ddos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Brute Force:</span>
                  <span className="font-medium">{securityStatus?.attackAnalysis?.attackTypes?.bruteForce || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>XSS:</span>
                  <span className="font-medium">{securityStatus?.attackAnalysis?.attackTypes?.xss || 0}</span>
                </div>
              </div>
            </div>

            {/* Şüpheli Aktivite */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 text-orange-600">Şüpheli Aktivite</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Bot Trafiği:</span>
                  <span className="font-medium">{securityStatus?.suspiciousActivity?.botTraffic || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>VPN Kullanıcı:</span>
                  <span className="font-medium">{securityStatus?.suspiciousActivity?.vpnUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tor Kullanıcı:</span>
                  <span className="font-medium">{securityStatus?.suspiciousActivity?.torUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Başarısız Login:</span>
                  <span className="font-medium">{securityStatus?.suspiciousActivity?.failedLogins || 0}</span>
                </div>
              </div>
            </div>

            {/* Gerçek Zamanlı Tehditler */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 text-purple-600">Gerçek Zamanlı</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Aktif Saldırı:</span>
                  <span className="font-medium">{securityStatus?.realTimeThreats?.activeAttacks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bloklanan İstek:</span>
                  <span className="font-medium">{securityStatus?.realTimeThreats?.blockedRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Firewall Uyarı:</span>
                  <span className="font-medium">{securityStatus?.realTimeThreats?.firewallAlerts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Son Tehdit:</span>
                  <span className="font-medium">{securityStatus?.realTimeThreats?.lastThreat || 'Yok'}</span>
                </div>
              </div>
            </div>

            {/* Coğrafi Analiz */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 text-blue-600">Coğrafi Analiz</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Toplam Ülke:</span>
                  <span className="font-medium">{securityStatus?.geoAnalysis?.totalCountries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Riskli Bölge:</span>
                  <span className="font-medium">{securityStatus?.geoAnalysis?.riskiestRegions?.[0] || 'Yok'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Güvenli Bölge:</span>
                  <span className="font-medium">{securityStatus?.geoAnalysis?.safestRegions?.[0] || 'Yok'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proxy Kullanım:</span>
                  <span className="font-medium">%{securityStatus?.geoAnalysis?.proxyUsage || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* En Çok Saldırı Yapan Ülkeler */}
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2 text-gray-700">En Çok Saldırı Yapan Ülkeler</h4>
            <div className="flex flex-wrap gap-2">
              {securityStatus?.attackAnalysis?.topCountries?.map((country: any, index: number) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1 text-xs">
                  <span>{country.flag}</span>
                  <span>{country.country}</span>
                  <span className="text-red-600 font-medium">({country.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sistem Bilgileri */}
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sistem Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Sunucu Durumu:</span>
            <span className={`ml-2 font-medium ${
              systemData?.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>
              {systemData?.status === 'active' ? 'Aktif' : 'Hata'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Son Güncelleme:</span>
            <span className="ml-2 text-gray-900">{systemData?.metrics.lastUpdate || 'Bilinmiyor'}</span>
          </div>
          <div>
            <span className="text-gray-500">Uptime:</span>
            <span className="ml-2 text-gray-900">{systemData?.metrics.uptime || 'Bilinmiyor'}</span>
          </div>
          <div>
            <span className="text-gray-500">Versiyon:</span>
            <span className="ml-2 text-gray-900">{systemData?.metrics.version || 'v1.2.3'}</span>
          </div>
          <div>
            <span className="text-gray-500">Network (Gelen):</span>
            <span className="ml-2 text-gray-900">{systemData?.metrics.network?.received || 0} GB</span>
          </div>
          <div>
            <span className="text-gray-500">Network (Giden):</span>
            <span className="ml-2 text-gray-900">{systemData?.metrics.network?.sent || 0} GB</span>
          </div>
        </div>
      </div>

      {/* Yedekleme Durumu */}
      {backupStatus && (
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Yedekleme Sistemi</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              backupStatus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {backupStatus.status === 'active' ? 'Aktif' : 'Pasif'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Son Yedekleme */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Son Yedekleme</h4>
              <div className="text-sm text-gray-600">
                {backupStatus.lastBackup ? (
                  <div>
                    <p className="font-medium">{new Date(backupStatus.lastBackup).toLocaleDateString('tr-TR')}</p>
                    <p className="text-xs">{new Date(backupStatus.lastBackup).toLocaleTimeString('tr-TR')}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz yedekleme yapılmamış</p>
                )}
              </div>
            </div>

            {/* Sonraki Yedekleme */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Sonraki Yedekleme</h4>
              <div className="text-sm text-gray-600">
                {backupStatus.nextBackup ? (
                  <div>
                    <p className="font-medium">{new Date(backupStatus.nextBackup).toLocaleDateString('tr-TR')}</p>
                    <p className="text-xs">{new Date(backupStatus.nextBackup).toLocaleTimeString('tr-TR')}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Planlanmamış</p>
                )}
              </div>
            </div>

            {/* Yedekleme Boyutu */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Yedekleme Boyutu</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{backupStatus.backupSize > 0 ? `${backupStatus.backupSize}MB` : '0MB'}</p>
                <p className="text-xs text-gray-500">Toplam boyut</p>
              </div>
            </div>

            {/* Saklama Süresi */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Saklama Süresi</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{backupStatus.config.retention} gün</p>
                <p className="text-xs text-gray-500">Otomatik silme</p>
              </div>
            </div>
          </div>

          {/* Yedekleme Ayarları */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Yedekleme Ayarları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backupStatus.config.includeDatabase ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600">Veritabanı</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backupStatus.config.includeUploads ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600">Yüklenen Dosyalar</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backupStatus.config.includeLogs ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600">Sistem Logları</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Zamanlama:</strong> {backupStatus.config.schedule}</p>
            </div>
          </div>

          {/* Yedekleme İşlemleri */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{backupLoading ? 'Oluşturuluyor...' : 'Manuel Yedekleme'}</span>
            </button>
            <button 
              onClick={handleToggleBackup}
              disabled={backupLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md disabled:opacity-50 ${
                backupStatus.config.enabled 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {backupStatus.config.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{backupStatus.config.enabled ? 'Otomatik Yedeklemeyi Durdur' : 'Otomatik Yedeklemeyi Başlat'}</span>
            </button>
            <button 
              onClick={() => setBackupModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
              <span>Ayarlar</span>
            </button>
          </div>
        </div>
      )}

      {/* Hızlı İşlemler */}
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => handleQuickAction('Cache Temizle')}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
          >
            <Activity className="h-4 w-4" />
            <span>Cache Temizle</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Bakım Modu')}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
          >
            <Settings className="h-4 w-4" />
            <span>Bakım Modu</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Log Görüntüle')}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Log Görüntüle</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Yedekleme')}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100"
          >
            <HardDrive className="h-4 w-4" />
            <span>Yedekleme</span>
          </button>
        </div>
      </div>

      {/* Test Modal */}
      {maintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMaintenanceModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bakım Modu Durumu</h2>
              <button
                onClick={() => setMaintenanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {maintenanceStatus?.maintenanceMode ? (
                <div className="space-y-4">
                  {/* Bakım Modu Aktif */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Bakım Modu Aktif</h3>
                    <p className="text-gray-600">Sistem şu anda bakım modunda çalışıyor</p>
                  </div>

                  <div className="space-y-3">
                    {/* Bakım Nedeni */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h4 className="font-medium text-orange-800 text-sm">Bakım Nedeni</h4>
                      </div>
                      <p className="text-orange-700 text-sm">
                        {maintenanceStatus.maintenanceReason || 'Sistem bakımı'}
                      </p>
                    </div>

                    {/* Başlangıç Zamanı */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-blue-800 text-sm">Başlangıç Zamanı</h4>
                      </div>
                      <p className="text-blue-700 text-sm">
                        {maintenanceStatus.maintenanceStart 
                          ? new Date(maintenanceStatus.maintenanceStart).toLocaleString('tr-TR')
                          : 'Bilinmiyor'
                        }
                      </p>
                    </div>

                    {/* Tahmini Süre */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-green-800 text-sm">Tahmini Süre</h4>
                      </div>
                      <p className="text-green-700 text-sm">
                        {maintenanceStatus.estimatedDuration || '30 dakika'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sistem Aktif */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sistem Aktif</h3>
                    <p className="text-gray-600">Sistem şu anda normal çalışma modunda</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Sistem Durumu</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Tüm servisler çalışıyor</li>
                      <li>• Kullanıcılar sisteme erişebilir</li>
                      <li>• Normal işlemler devam ediyor</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={handleToggleMaintenance}
                  disabled={maintenanceLoading}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    maintenanceStatus?.maintenanceMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  } disabled:opacity-50`}
                >
                  {maintenanceLoading ? 'İşleniyor...' : (maintenanceStatus?.maintenanceMode ? 'Bakım Modunu Kapat' : 'Bakım Modunu Aç')}
                </button>
                <button
                  onClick={() => setMaintenanceModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setLogsModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Sistem Logları</h2>
              <button
                onClick={() => setLogsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loglar yükleniyor...</span>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log: any, index: number) => (
                    <div key={index} className={`border rounded-lg p-3 ${
                      log.level === 'ERROR' ? 'border-red-200 bg-red-50' :
                      log.level === 'WARNING' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {log.level === 'ERROR' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : log.level === 'WARNING' ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                              log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {log.level}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString('tr-TR')}
                            </span>
                          </div>
                                                     <p className="text-sm text-gray-700 mb-1">{log.message}</p>
                           <span className="text-xs text-gray-500">Kaynak: {log.source}</span>
                           {log.userName && (
                             <div className="text-xs text-blue-600 mt-1">
                               Kullanıcı: {log.userName}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">Henüz log kaydı bulunmuyor</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Toplam {logs.length} log kaydı
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogsClick}
                  disabled={logsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {logsLoading ? 'Yenileniyor...' : 'Yenile'}
                </button>
                <button
                  onClick={() => setLogsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setBackupModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Yedekleme Ayarları</h2>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {backupStatus && (
                <div className="space-y-6">
                  {/* Otomatik Yedekleme */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Otomatik Yedekleme</h3>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={backupStatus.config.enabled}
                          onChange={(e) => {
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, enabled: e.target.checked }
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Otomatik yedeklemeyi etkinleştir</span>
                      </label>
                    </div>
                  </div>

                  {/* Zamanlama */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Zamanlama</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                        <select 
                          value={backupStatus.config.schedule.split(' ')[1] || '2'}
                          onChange={(e) => {
                            const newSchedule = `0 ${e.target.value} * * *`
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, schedule: newSchedule }
                            })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saklama Süresi (gün)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={backupStatus.config.retention}
                          onChange={(e) => {
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, retention: parseInt(e.target.value) }
                            })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* İçerik Seçimi */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Yedekleme İçeriği</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={backupStatus.config.includeDatabase}
                          onChange={(e) => {
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, includeDatabase: e.target.checked }
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Veritabanı</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={backupStatus.config.includeUploads}
                          onChange={(e) => {
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, includeUploads: e.target.checked }
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yüklenen Dosyalar</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={backupStatus.config.includeLogs}
                          onChange={(e) => {
                            setBackupStatus({
                              ...backupStatus,
                              config: { ...backupStatus.config, includeLogs: e.target.checked }
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sistem Logları</span>
                      </label>
                    </div>
                  </div>

                  {/* Özet */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Yedekleme Özeti</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Durum:</strong> {backupStatus.config.enabled ? 'Aktif' : 'Pasif'}</p>
                      <p><strong>Zamanlama:</strong> Her gün saat {backupStatus.config.schedule.split(' ')[1]}:00</p>
                      <p><strong>Saklama:</strong> {backupStatus.config.retention} gün</p>
                      <p><strong>İçerik:</strong> {
                        [
                          backupStatus.config.includeDatabase && 'Veritabanı',
                          backupStatus.config.includeUploads && 'Dosyalar',
                          backupStatus.config.includeLogs && 'Loglar'
                        ].filter(Boolean).join(', ')
                      }</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setBackupModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  if (backupStatus) {
                    try {
                      const response = await fetch('/api/system/backup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          action: 'configure', 
                          config: backupStatus.config 
                        })
                      })
                      const data = await response.json()
                      
                      if (data.success) {
                        alert('✅ Yedekleme ayarları güncellendi!')
                        await fetchBackupStatus()
                        setBackupModalOpen(false)
                      } else {
                        alert(`❌ Ayarlar güncellenemedi!\n\n${data.error}`)
                      }
                    } catch (error) {
                      alert('❌ İşlem sırasında hata oluştu!')
                      console.error('Config Error:', error)
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 