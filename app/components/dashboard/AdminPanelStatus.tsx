'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, Cpu, HardDrive, Activity, Gauge, Server, Network, Clock } from 'lucide-react'

interface RealMetrics {
  cpu: { usage: number; cores: number; temperature: number | null }
  memory: { usage: number; total: number; used: number; free: number }
  disk: { usage: number; total: number; used: number; free: number }
  network: { received: number; sent: number; total: number }
  load: { average: number; status: string }
  timestamp: string
}

interface HealthComponent {
  score: number
  status: string
  color: string
  message: string
}

interface HealthScore {
  overall: HealthComponent & { score: number }
  components: {
    cpu: HealthComponent & { usage: number }
    memory: HealthComponent & { usage: number }
    disk: HealthComponent & { usage: number }
    load: HealthComponent & { average: number }
  }
  recommendations: string[]
  timestamp: string
}

export default function AdminPanelStatus() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<RealMetrics | null>(null)
  const [health, setHealth] = useState<HealthScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setError(null)
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/system/real-metrics'),
        fetch('/api/system/health-score')
      ])

      const metricsJson = await metricsRes.json()
      const healthJson = await healthRes.json()

      if (!metricsJson.success) throw new Error(metricsJson.error || 'Metrikler alınamadı')
      if (!healthJson.success) throw new Error(healthJson.error || 'Sağlık skoru alınamadı')

      setMetrics(metricsJson.data)
      setHealth(healthJson.data)
    } catch (e: any) {
      setError(e?.message || 'Bilinmeyen hata')
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Admin Panel Durumu</h3>
        </div>
        <div className="flex items-center justify-center text-gray-600">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-500" /> Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 lg:p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Admin Panel Durumu</h3>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Özet Satırı */}
      {metrics && health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              {chip(health.components.cpu.color, health.components.cpu.status)}
            </div>
            <div className="text-sm text-gray-700">%{Math.round(metrics.cpu.usage)}</div>
            <div className="text-xs text-gray-500">Çekirdek: {metrics.cpu.cores}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${
                  metrics.cpu.usage < 70 ? 'bg-green-500' : 
                  metrics.cpu.usage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.cpu.usage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Bellek</span>
              </div>
              {chip(health.components.memory.color, health.components.memory.status)}
            </div>
            <div className="text-sm text-gray-700">%{Math.round(metrics.memory.usage)}</div>
            <div className="text-xs text-gray-500">{metrics.memory.used}GB / {metrics.memory.total}GB</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${
                  metrics.memory.usage < 80 ? 'bg-green-500' : 
                  metrics.memory.usage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.memory.usage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Disk</span>
              </div>
              {chip(health.components.disk.color, health.components.disk.status)}
            </div>
            <div className="text-sm text-gray-700">%{Math.round(metrics.disk.usage)}</div>
            <div className="text-xs text-gray-500">{metrics.disk.used}GB / {metrics.disk.total}GB</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${
                  metrics.disk.usage < 85 ? 'bg-green-500' : 
                  metrics.disk.usage < 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.disk.usage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Sistem Yükü</span>
              </div>
              {chip(health.components.load.color, health.components.load.status)}
            </div>
            <div className="text-sm text-gray-700">Ortalama: {metrics.load.average.toFixed(2)}</div>
            <div className="text-xs text-gray-500 capitalize">{metrics.load.status}</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Aktif</span>
            </div>
            <div className="text-sm text-gray-700">↓ {metrics.network.received.toFixed(2)}GB</div>
            <div className="text-xs text-gray-500">↑ {metrics.network.sent.toFixed(2)}GB</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Çalışma Süresi</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
            </div>
            <div className="text-sm text-gray-700">Sistem Çalışıyor</div>
            <div className="text-xs text-gray-500">Son güncelleme: {new Date(metrics.timestamp).toLocaleTimeString('tr-TR')}</div>
          </div>
        </div>
      )}

      {/* Genel Sağlık */}
      {health && (
        <div className="mb-4 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">Genel Sağlık</span>
            </div>
            {chip(health.overall.color, health.overall.status)}
          </div>
          <div className="mt-2 text-sm text-gray-700">
            Skor: {health.overall.score}/100 — {health.overall.message}
          </div>
          {health.recommendations?.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-gray-600 space-y-1">
              {health.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Zaman damgası */}
      <div className="text-xs text-gray-500">
        Güncelleme: {metrics ? new Date(metrics.timestamp).toLocaleString('tr-TR') : '-'}
      </div>
    </div>
  )
}


