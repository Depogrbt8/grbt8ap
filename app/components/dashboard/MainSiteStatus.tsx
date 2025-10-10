'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, Cpu, HardDrive, Activity, Gauge, Server, Network, Clock, Globe } from 'lucide-react'

interface MainSiteMetrics {
  serverStatus: string
  version: string
  uptime: number
  nodeVersion: string
  platform: string
  arch: string
  hostname: string
  memory: {
    total: number
    free: number
    used: number
    usage: number
  }
  cpu: {
    cores: number
    model: string
    loadAverage: number[]
  }
  disk: {
    dbPath: string
    dbSize: number
  }
  network: {
    hostname: string
    interfaces: any
  }
  database: {
    status: string
    userCount: number
    reservationCount: number
    paymentCount: number
  }
  lastUpdate: string
}

interface MainSiteHealth {
  score: number
  status: string
  issues: string[]
  metrics: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
    loadAverage: number
  }
  timestamp: string
}

export default function MainSiteStatus() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<MainSiteMetrics | null>(null)
  const [health, setHealth] = useState<MainSiteHealth | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setError(null)
      const [statusRes, healthRes] = await Promise.all([
        fetch('https://anasite.grbt8.store/api/system/status'),
        fetch('https://anasite.grbt8.store/api/system/health-score')
      ])

      const statusJson = await statusRes.json()
      const healthJson = await healthRes.json()

      if (!statusJson.success) throw new Error(statusJson.error || 'Ana site durumu alınamadı')
      if (!healthJson.success) throw new Error(healthJson.error || 'Ana site sağlık skoru alınamadı')

      setMetrics(statusJson.data)
      setHealth(healthJson.data)
    } catch (e: any) {
      setError(e?.message || 'Ana site bağlantısı kurulamadı')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Her 30 saniyede bir otomatik yenileme
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const chip = (color: string, text: string) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      color === 'green' ? 'bg-green-100 text-green-800' :
      color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
      color === 'orange' ? 'bg-orange-100 text-orange-800' :
      'bg-red-100 text-red-800'
    }`}>{text}</span>
  )

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ana Site Durumu</h3>
        </div>
        <div className="flex items-center justify-center text-gray-600">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-500" /> Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="flex items-center space-x-1">
          <Globe className="h-4 w-4 text-blue-600" />
          <h3 className="admin-card-title">Ana Site Durumu</h3>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="admin-btn admin-btn-primary flex items-center space-x-1"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Ana Site Özet */}
      {metrics && health && (
        <div className="admin-grid-6 mb-3">
          <div className={`admin-card-small ${health.metrics.cpuUsage < 60 ? 'border-green-300' : health.metrics.cpuUsage < 80 ? 'border-yellow-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Cpu className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">CPU</span>
              </div>
              {chip(
                health.metrics.cpuUsage < 60 ? 'green' : 
                health.metrics.cpuUsage < 80 ? 'yellow' : 'red',
                health.metrics.cpuUsage < 60 ? 'İyi' : 
                health.metrics.cpuUsage < 80 ? 'Orta' : 'Yüksek'
              )}
            </div>
            <div className="text-sm font-semibold text-gray-900">%{Math.round(health.metrics.cpuUsage)}</div>
            <div className="text-[10px] text-gray-500">Çekirdek: {metrics.cpu.cores}</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full ${
                  health.metrics.cpuUsage < 60 ? 'bg-green-500' : 
                  health.metrics.cpuUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(health.metrics.cpuUsage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`admin-card-small ${health.metrics.memoryUsage < 80 ? 'border-green-300' : health.metrics.memoryUsage < 90 ? 'border-yellow-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Bellek</span>
              </div>
              {chip(
                health.metrics.memoryUsage < 80 ? 'green' : 
                health.metrics.memoryUsage < 90 ? 'yellow' : 'red',
                health.metrics.memoryUsage < 80 ? 'İyi' : 
                health.metrics.memoryUsage < 90 ? 'Orta' : 'Yüksek'
              )}
            </div>
            <div className="text-sm font-semibold text-gray-900">%{Math.round(health.metrics.memoryUsage)}</div>
            <div className="text-[10px] text-gray-500">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full ${
                  health.metrics.memoryUsage < 80 ? 'bg-green-500' : 
                  health.metrics.memoryUsage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(health.metrics.memoryUsage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`admin-card-small ${health.metrics.diskUsage < 85 ? 'border-green-300' : health.metrics.diskUsage < 95 ? 'border-yellow-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <HardDrive className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Disk</span>
              </div>
              {chip(
                health.metrics.diskUsage < 85 ? 'green' : 
                health.metrics.diskUsage < 95 ? 'yellow' : 'red',
                health.metrics.diskUsage < 85 ? 'İyi' : 
                health.metrics.diskUsage < 95 ? 'Orta' : 'Yüksek'
              )}
            </div>
            <div className="text-sm font-semibold text-gray-900">%{Math.round(health.metrics.diskUsage)}</div>
            <div className="text-[10px] text-gray-500">DB: {formatBytes(metrics.disk.dbSize)}</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full ${
                  health.metrics.diskUsage < 85 ? 'bg-green-500' : 
                  health.metrics.diskUsage < 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(health.metrics.diskUsage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`admin-card-small ${health.metrics.loadAverage < 1 ? 'border-green-300' : health.metrics.loadAverage < 2 ? 'border-yellow-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Gauge className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Sistem Yükü</span>
              </div>
              {chip(
                health.metrics.loadAverage < 1 ? 'green' : 
                health.metrics.loadAverage < 2 ? 'yellow' : 'red',
                health.metrics.loadAverage < 1 ? 'Normal' : 
                health.metrics.loadAverage < 2 ? 'Orta' : 'Yüksek'
              )}
            </div>
            <div className="text-sm font-semibold text-gray-900">{health.metrics.loadAverage.toFixed(2)}</div>
            <div className="text-[10px] text-gray-500">Ortalama yük</div>
          </div>

          <div className={`admin-card-small ${metrics.serverStatus === 'active' ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Network className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Sunucu</span>
              </div>
              {chip(
                metrics.serverStatus === 'active' ? 'green' : 'red',
                metrics.serverStatus === 'active' ? 'Aktif' : 'Pasif'
              )}
            </div>
            <div className="text-sm font-semibold text-gray-900">{metrics.hostname}</div>
            <div className="text-[10px] text-gray-500">{metrics.platform} {metrics.arch}</div>
          </div>

          <div className="admin-card-small border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Çalışma Süresi</span>
              </div>
              {chip('green', 'Aktif')}
            </div>
            <div className="text-sm font-semibold text-gray-900">{formatUptime(metrics.uptime)}</div>
            <div className="text-[10px] text-gray-500">v{metrics.version}</div>
          </div>
        </div>
      )}

      {/* Veritabanı Durumu */}
      {metrics && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="flex items-center space-x-1">
              <Server className="h-4 w-4 text-gray-700" />
              <span className="admin-card-title">Veritabanı Durumu</span>
            </div>
            {chip(
              metrics.database.status === 'connected' ? 'green' : 'red',
              metrics.database.status === 'connected' ? 'Bağlı' : 'Bağlantı Yok'
            )}
          </div>
          
          <div className="admin-grid-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Kullanıcılar:</span>
              <span className="font-medium text-sm">{metrics.database.userCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Rezervasyonlar:</span>
              <span className="font-medium text-sm">{metrics.database.reservationCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Ödemeler:</span>
              <span className="font-medium text-sm">{metrics.database.paymentCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Genel Sağlık */}
      {health && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="flex items-center space-x-1">
              <Server className="h-4 w-4 text-gray-700" />
              <span className="admin-card-title">Ana Site Sağlığı</span>
            </div>
            {chip(
              health.score >= 80 ? 'green' : 
              health.score >= 60 ? 'yellow' : 'red',
              health.status
            )}
          </div>
          
          <div className="admin-text-sm mb-2">
            Sağlık Skoru: {health.score}/100
          </div>
          
          {health.issues.length > 0 && (
            <div className="admin-text-sm">
              <div className="admin-text-xs mb-1">Tespit Edilen Sorunlar:</div>
              <ul className="list-disc list-inside admin-text-xs space-y-1">
                {health.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Zaman damgası */}
      <div className="admin-text-xs">
        Son güncelleme: {metrics ? new Date(metrics.lastUpdate).toLocaleString('tr-TR') : '-'}
      </div>
    </div>
  )
}
