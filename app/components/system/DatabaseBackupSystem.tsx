'use client'
import { useState, useEffect } from 'react'

interface BackupStatus {
  lastBackup?: string
  nextBackup?: string
  totalRecords: number
  backupSize: string
  isActive: boolean
  changes: {
    newUsers: number
    newReservations: number
    newPayments: number
    updatedRecords: number
  }
}

export default function DatabaseBackupSystem() {
  const [status, setStatus] = useState<BackupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [sources, setSources] = useState<Array<{ key: string; title: string; subtitle: string; active: boolean; pulledInfo: string }>>([])
  const [security, setSecurity] = useState<any>(null)

  useEffect(() => {
    fetchBackupStatus()
    fetchSources()
    fetchSecurity()
  }, [])

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch('/api/database-backup/status')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Yedekleme durumu alınamadı:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/database-backup/sources')
      const data = await res.json()
      if (data.success) setSources(data.data)
    } catch (e) {
      // ignore visual section errors
    }
  }

  const fetchSecurity = async () => {
    try {
      const res = await fetch('/api/system/security/status')
      const json = await res.json()
      if (json.success) {
        setSecurity(json.data)
      }
    } catch (e) {
      console.log('Security data fetch failed:', e)
    }
  }

  const toggleAutoBackup = async () => {
    setIsToggling(true)
    
    try {
      const response = await fetch('/api/database-backup/toggle', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchBackupStatus()
      }
    } catch (error) {
      console.error('Otomatik yedekleme durumu değiştirilemedi:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading && !status) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-title">🗄️ Database Yedekleme Sistemi</h3>
          <p className="admin-card-subtitle">Incremental Backup - Her saatte bir otomatik</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`admin-status-dot ${
            status?.isActive ? 'admin-status-dot-success' : 'admin-status-dot-error'
          }`}></div>
          <span className="admin-text-xs">
            {status?.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      {/* Kaynak Kartları (Monitor tasarımı) */}
      {sources?.length > 0 && (
        <div className="admin-grid-4 mb-3">
          {sources.map((s) => (
            <div key={s.key} className={`admin-card-small ${s.active ? 'border-green-300' : 'border-red-300'}`}>
              <div className={`admin-text-xs ${s.active ? 'text-green-600' : 'text-red-500'}`}>{s.active ? 'Aktif' : 'Pasif'}</div>
              <div className="admin-text-sm">{s.title}</div>
              <div className="admin-text-xs">{s.pulledInfo}</div>
            </div>
          ))}
        </div>
      )}
      {/* Güvenlik Bölümü */}
      {security && (
        <div className="admin-card-small">
          <div className="admin-card-header">
            <h4 className="admin-card-title">
              🛡️ Güvenlik Durumu
            </h4>
            <div className={`admin-badge ${
              security.overallScore >= 90 ? 'admin-badge-success' :
              security.overallScore >= 70 ? 'admin-badge-warning' :
              'admin-badge-error'
            }`}>
              Skor: {security.overallScore}/100
            </div>
          </div>
          
          <div className="admin-grid-4">
            {/* Aktif Saldırılar */}
            <div className={`admin-card-small ${security.realTimeThreats?.activeAttacks > 5 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="admin-text-xs">Aktif Saldırı</div>
                {security.realTimeThreats?.activeAttacks > 5 && (
                  <span className="text-red-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="admin-text-sm">
                {security.realTimeThreats?.activeAttacks || 0}
              </div>
            </div>

            {/* Engellenen İstekler */}
            <div className={`admin-card-small ${security.realTimeThreats?.blockedRequests > 500 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="admin-text-xs">Engellenen</div>
                {security.realTimeThreats?.blockedRequests > 500 && (
                  <span className="text-yellow-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="admin-text-sm">
                {security.realTimeThreats?.blockedRequests || 0}
              </div>
            </div>

            {/* Rate Limit */}
            <div className={`admin-card-small ${security.rateLimitingStatus?.blockedRequests > 100 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="admin-text-xs">Rate Limit</div>
                {security.rateLimitingStatus?.blockedRequests > 100 && (
                  <span className="text-orange-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="admin-text-sm">
                {security.rateLimitingStatus?.blockedRequests || 0}
              </div>
            </div>

            {/* Son Tehdit */}
            <div className="admin-card-small border-gray-200">
              <div className="admin-text-xs">Son Tehdit</div>
              <div className="admin-text-sm truncate">
                {security.realTimeThreats?.lastThreat || 'Yok'}
              </div>
            </div>
          </div>

          {/* Durum Mesajı */}
          <div className="mt-2 admin-text-xs text-center">
            {security.message || 'Güvenlik sistemleri izleniyor'}
          </div>
        </div>
      )}
    </div>
  )
}
