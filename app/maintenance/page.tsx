'use client'
import { useState, useEffect } from 'react'
import { Wrench, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface MaintenanceStatus {
  maintenanceMode: boolean
  maintenanceReason?: string
  maintenanceStart?: string
  estimatedDuration?: string
}

export default function MaintenancePage() {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaintenanceStatus()
  }, [])

  const fetchMaintenanceStatus = async () => {
    try {
      console.log('Bakım modu durumu alınıyor...')
      const response = await fetch('/api/system/maintenance-mode')
      console.log('API yanıtı:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API verisi:', data)
      setMaintenanceStatus(data)
      setError(null)
    } catch (error) {
      console.error('Bakım modu durumu alınamadı:', error)
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  const disableMaintenanceMode = async () => {
    try {
      const response = await fetch('/api/system/maintenance-mode/disable', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Bakım modu başarıyla kapatıldı!')
        fetchMaintenanceStatus() // Durumu yenile
      } else {
        alert('Bakım modu kapatılamadı: ' + data.error)
      }
    } catch (error) {
      alert('Bakım modu kapatma işlemi başarısız!')
      console.error('Bakım modu kapatma hatası:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMaintenanceStatus}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!maintenanceStatus?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Aktif</h1>
          <p className="text-gray-600 mb-6">Sistem şu anda normal çalışma modunda.</p>
          <a 
            href="/sistem" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sistem Sayfasına Dön
          </a>
        </div>
      </div>
    )
  }

  const startTime = maintenanceStatus.maintenanceStart 
    ? new Date(maintenanceStatus.maintenanceStart).toLocaleString('tr-TR')
    : 'Bilinmiyor'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bakım Modu</h1>
          <p className="text-gray-600">Sistem şu anda bakım modunda çalışıyor</p>
        </div>

        <div className="space-y-4">
          {/* Bakım Nedeni */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-orange-800">Bakım Nedeni</h3>
            </div>
            <p className="text-orange-700">
              {maintenanceStatus.maintenanceReason || 'Sistem bakımı'}
            </p>
          </div>

          {/* Başlangıç Zamanı */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-blue-800">Başlangıç Zamanı</h3>
            </div>
            <p className="text-blue-700">{startTime}</p>
          </div>

          {/* Tahmini Süre */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-green-800">Tahmini Süre</h3>
            </div>
            <p className="text-green-700">
              {maintenanceStatus.estimatedDuration || '30 dakika'}
            </p>
          </div>

          {/* Bilgi */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Bilgi</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sistem güvenlik güncellemeleri yapılıyor</li>
              <li>• Veritabanı optimizasyonu gerçekleştiriliyor</li>
              <li>• Performans iyileştirmeleri uygulanıyor</li>
              <li>• Lütfen sabırla bekleyin</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center space-x-4">
          <button 
            onClick={fetchMaintenanceStatus}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Durumu Yenile
          </button>
          <button 
            onClick={disableMaintenanceMode}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Bakım Modunu Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
