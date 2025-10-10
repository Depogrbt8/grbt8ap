'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Mail, CreditCard, Calendar, FileText, Settings, Search, Globe, Briefcase, BookOpen, Megaphone, Code, RefreshCw } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

interface DashboardStats {
  totalUsers: number
  activeReservations: number
  emailsSent: number
  totalRevenue: number
  todayRegistrations: number
  activeUsers24h: number
  deliveryRate: number
  systemHealth: number
  lastUpdated: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeReservations: 0,
    emailsSent: 0,
    totalRevenue: 0,
    todayRegistrations: 0,
    activeUsers24h: 0,
    deliveryRate: 0,
    systemHealth: 100,
    lastUpdated: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(num)
  }

  const statsCards = [
    { 
      name: 'Toplam Kullanıcı', 
      value: formatNumber(stats.totalUsers), 
      icon: Users, 
      color: 'blue',
      subtitle: `+${stats.todayRegistrations} bugün`
    },
    { 
      name: 'Aktif Rezervasyon', 
      value: formatNumber(stats.activeReservations), 
      icon: BookOpen, 
      color: 'green',
      subtitle: `${stats.activeUsers24h} aktif kullanıcı`
    },
    { 
      name: 'Email Gönderilen', 
      value: formatNumber(stats.emailsSent), 
      icon: Mail, 
      color: 'purple',
      subtitle: `%${stats.deliveryRate} teslimat oranı`
    },
    { 
      name: 'Toplam Gelir', 
      value: formatCurrency(stats.totalRevenue), 
      icon: CreditCard, 
      color: 'yellow',
      subtitle: 'Toplam gelir'
    }
  ]

  const quickActions = [
    { name: 'Sistem', href: '/sistem', icon: Settings, color: 'gray' },
    { name: 'Kullanıcılar', href: '/kullanici', icon: Users, color: 'blue' },
    { name: 'Kampanyalar', href: '/kampanyalar', icon: Megaphone, color: 'orange' },
    { name: 'SEO', href: '/seo', icon: Search, color: 'green' },
    { name: 'Email', href: '/email', icon: Mail, color: 'purple' },
    { name: 'API', href: '/apiler', icon: Code, color: 'indigo' },
    { name: 'Rezervasyonlar', href: '/rezervasyonlar', icon: BookOpen, color: 'pink' },
    { name: 'Uçuşlar', href: '/ucuslar', icon: Calendar, color: 'teal' },
    { name: 'Ödemeler', href: '/odemeler', icon: CreditCard, color: 'yellow' },
    { name: 'Raporlar', href: '/raporlar', icon: FileText, color: 'red' },
    { name: 'İstatistikler', href: '/istatistikler', icon: BarChart3, color: 'cyan' },
    { name: 'Ayarlar', href: '/ayarlar', icon: Settings, color: 'gray' }
  ]

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Page Header */}
          <div className="mb-3 flex justify-between items-center">
            <div>
              <h1 className="admin-text-lg flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </h1>
              <p className="admin-text-xs mt-1">
                Admin paneli genel bakış
                {stats.lastUpdated && (
                  <span className="text-gray-500 ml-2">
                    • Son güncelleme: {new Date(stats.lastUpdated).toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="admin-button-sm flex items-center"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>

          {/* Stats Cards */}
          <div className="admin-grid-4 mb-3">
            {statsCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.name} className="admin-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded bg-${stat.color}-100`}>
                        <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                      </div>
                      <div className="ml-3">
                        <p className="admin-text-xs">{stat.name}</p>
                        <p className="admin-text-lg">{loading ? '...' : stat.value}</p>
                        {stat.subtitle && (
                          <p className="admin-text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* System Health */}
          <div className="admin-card mb-3">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Sistem Durumu</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-text-sm">Sistem Sağlığı</p>
                <p className="admin-text-xs text-gray-500">API'lerin aktiflik oranı</p>
              </div>
              <div className="text-right">
                <p className="admin-text-lg font-bold text-green-600">
                  {loading ? '...' : `${stats.systemHealth}%`}
                </p>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${loading ? 0 : stats.systemHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Hızlı Erişim</h3>
            </div>
            <div className="admin-grid-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <a
                    key={action.name}
                    href={action.href}
                    className="admin-card-small hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <div className={`p-1 rounded bg-${action.color}-100 mr-2`}>
                      <Icon className={`h-3 w-3 text-${action.color}-600`} />
                    </div>
                    <span className="admin-text-xs">{action.name}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}