'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Header() {
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false)
  const [announcementCount, setAnnouncementCount] = useState(0) // Duyuru sayısı
  const [systemAlerts, setSystemAlerts] = useState(0) // Sistem uyarı sayısı
  
  // Kullanıcı rolünü localStorage'dan al (varsayılan: normal admin)
  const [userRole, setUserRole] = useState('admin')
  
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'admin'
    setUserRole(role)
  }, [])

  // Duyuru sayısını localStorage'dan al
  useEffect(() => {
    const count = localStorage.getItem('announcementCount')
    if (count) {
      setAnnouncementCount(parseInt(count))
    }
  }, [])

  // Sistem uyarılarını kontrol et
  useEffect(() => {
    const checkSystemAlerts = async () => {
      try {
        const risks = []

        // Güvenlik durumu kontrolü
        const securityRes = await fetch('/api/system/security/status')
        if (securityRes.ok) {
          const security = await securityRes.json()
          const data = security.data

          if (data?.realTimeThreats?.activeAttacks > 10) risks.push('security_attack')
          if (data?.rateLimitingStatus?.blockedRequests > 100) risks.push('security_rate')
          if (data?.overallScore < 70) risks.push('security_score')
        }

        // Admin Panel durumu kontrolü
        const [adminMetricsRes, adminHealthRes] = await Promise.all([
          fetch('/api/system/real-metrics'),
          fetch('/api/system/health-score')
        ])

        if (adminMetricsRes.ok && adminHealthRes.ok) {
          const metrics = await adminMetricsRes.json()
          const health = await adminHealthRes.json()

          if (metrics.success && health.success) {
            if (metrics.data.cpu.usage > 80) risks.push('admin_cpu')
            if (metrics.data.memory.usage > 90) risks.push('admin_memory')
            if (metrics.data.disk.usage > 85) risks.push('admin_disk')
            if (health.data.overall.score < 60) risks.push('admin_health')
          }
        }

        // Ana Site durumu kontrolü
        try {
          const [mainStatusRes, mainHealthRes] = await Promise.all([
            fetch('https://anasite.grbt8.store/api/system/status'),
            fetch('https://anasite.grbt8.store/api/system/health-score')
          ])

          if (mainStatusRes.ok && mainHealthRes.ok) {
            const mainStatus = await mainStatusRes.json()
            const mainHealth = await mainHealthRes.json()

            if (mainStatus.success && mainHealth.success) {
              if (mainHealth.data.metrics.cpuUsage > 80) risks.push('main_cpu')
              if (mainHealth.data.metrics.memoryUsage > 90) risks.push('main_memory')
              if (mainHealth.data.metrics.loadAverage > 2.5) risks.push('main_load')
              if (mainHealth.data.score < 60) risks.push('main_health')
              if (mainStatus.data.database.status !== 'connected') risks.push('main_db')
            }
          } else {
            risks.push('main_offline')
          }
        } catch {
          risks.push('main_offline')
        }

        setSystemAlerts(risks.length)
      } catch (error) {
        console.error('Sistem uyarı kontrolü hatası:', error)
      }
    }

    checkSystemAlerts()
    
    // Her 60 saniyede bir kontrol et
    const interval = setInterval(checkSystemAlerts, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Duyuru popup'ı açıldığında sayıyı sıfırla
  const handleAnnouncementClick = () => {
    setShowAnnouncementPopup(true)
    setAnnouncementCount(0)
    localStorage.setItem('announcementCount', '0')
    
    // Duyuruları okundu olarak işaretle
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]')
    const updatedAnnouncements = announcements.map((announcement: any) => ({
      ...announcement,
      read: true
    }))
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
  }

  return (
    <header className="bg-white shadow-sm border-b px-4 py-2">
      <div className="flex items-center">
        <h1 className="text-base font-medium text-gray-900">GurbetBiz Admin Panel</h1>
        <button 
          onClick={handleAnnouncementClick}
          className={`text-sm font-normal cursor-pointer ml-3 ${
            announcementCount > 0 
              ? 'text-red-600 hover:text-red-800' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Duyuru: {announcementCount}
        </button>
        
        {/* Sistem Uyarıları */}
        {systemAlerts > 0 && (
          <div className="flex items-center ml-4 px-2 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Uyarı: {systemAlerts}</span>
          </div>
        )}
      </div>

      {/* Duyuru Popup */}
      {showAnnouncementPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh]">
                          <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Duyurular ({(() => {
                    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]')
                    return announcements.length
                  })()})
                </h2>
              <button
                onClick={() => setShowAnnouncementPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {(() => {
                const announcements = JSON.parse(localStorage.getItem('announcements') || '[]')
                if (announcements.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Henüz duyuru bulunmuyor.</p>
                    </div>
                  )
                }
                
                // Duyuruları tarihe göre sırala (en yeni üstte)
                const sortedAnnouncements = announcements.sort((a: any, b: any) => {
                  // Önce ID'ye göre sırala (en büyük ID en yeni)
                  if (b.id !== a.id) {
                    return b.id - a.id
                  }
                  // ID'ler aynıysa tarihe göre sırala
                  return new Date(b.date).getTime() - new Date(a.date).getTime()
                })
                
                return (
                  <div className="space-y-4">
                    {sortedAnnouncements.map((announcement: any) => (
                      <div key={announcement.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                              {announcement.title || 'Başlıksız Duyuru'}
                            </h3>
                            <p className="text-sm text-gray-700 mb-1">{announcement.text}</p>
                            <p className="text-xs text-gray-500">{announcement.date}</p>
                          </div>
                          {userRole === 'super-admin' && (
                            <button 
                              onClick={() => {
                                // Duyuruyu tamamen sil
                                const updatedAnnouncements = announcements.filter((a: any) => a.id !== announcement.id)
                                localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
                                // Sayıyı güncelle
                                const newCount = Math.max(0, parseInt(localStorage.getItem('announcementCount') || '0') - 1)
                                localStorage.setItem('announcementCount', newCount.toString())
                                setAnnouncementCount(newCount)
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-2"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 