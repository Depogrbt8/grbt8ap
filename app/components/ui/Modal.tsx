'use client'
import { useEffect } from 'react'
import { X, Wrench, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="admin-modal">
        {/* Header */}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="admin-modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  maintenanceStatus: {
    maintenanceMode: boolean
    maintenanceReason?: string
    maintenanceStart?: string
    estimatedDuration?: string
  } | null
  onToggleMaintenance: () => void
  loading?: boolean
}

export function MaintenanceModal({ 
  isOpen, 
  onClose, 
  maintenanceStatus, 
  onToggleMaintenance,
  loading = false 
}: MaintenanceModalProps) {
  const startTime = maintenanceStatus?.maintenanceStart 
    ? new Date(maintenanceStatus.maintenanceStart).toLocaleString('tr-TR')
    : 'Bilinmiyor'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bakım Modu Durumu">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Durum kontrol ediliyor...</p>
        </div>
      ) : maintenanceStatus?.maintenanceMode ? (
        <div className="space-y-4">
          {/* Bakım Modu Aktif */}
          <div className="text-center mb-6">
            <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bakım Modu Aktif</h3>
            <p className="text-gray-600">Sistem şu anda bakım modunda çalışıyor</p>
          </div>

          <div className="space-y-3">
            {/* Bakım Nedeni */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium text-orange-800 text-sm">Bakım Nedeni</h4>
              </div>
              <p className="text-orange-700 text-sm">
                {maintenanceStatus.maintenanceReason || 'Sistem bakımı'}
              </p>
            </div>

            {/* Başlangıç Zamanı */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-blue-800 text-sm">Başlangıç Zamanı</h4>
              </div>
              <p className="text-blue-700 text-sm">{startTime}</p>
            </div>

            {/* Tahmini Süre */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-green-800 text-sm">Tahmini Süre</h4>
              </div>
              <p className="text-green-700 text-sm">
                {maintenanceStatus.estimatedDuration || '30 dakika'}
              </p>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              onClick={onToggleMaintenance}
              className="admin-btn admin-btn-primary"
            >
              Bakım Modunu Kapat
            </button>
            <button
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sistem Aktif */}
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
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

          <div className="admin-modal-footer">
            <button
              onClick={onToggleMaintenance}
              className="admin-btn admin-btn-primary"
            >
              Bakım Modunu Aç
            </button>
            <button
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
