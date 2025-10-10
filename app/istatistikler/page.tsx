'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { Users, Calendar, Euro, Plane, TrendingUp, Star, Clock, Activity, Globe, UserX, UserPlus, RefreshCw } from 'lucide-react'

interface StatisticsData {
  totalUsers: number
  last24Hours: number
  totalReservations: number
  totalRevenue: number
  activePassengers: number
  completedFlights: number
  averageTicketPrice: number
  customerSatisfaction: number
  // Kullanıcı detayları
  todayRegistrations: number
  usersByCountry: { [key: string]: number }
  abandonedRegistrations: number
  activeUsers24h: number
  // Rezervasyon detayları
  todayReservations: number
  cancelledReservations: number
  reservationGrowthPercentage: number
  // Gelir detayları
  todayRevenue: number
  thisMonthRevenue: number
  revenueGrowthPercentage: number
  // Uçuş detayları
  todayFlights: number
  thisMonthFlights: number
  flightGrowthPercentage: number
  topSearchedRoutes: Array<{ route: string; searches: number; airports: string }>
}

export default function IstatistiklerPage() {
  const [activeTab, setActiveTab] = useState('istatistikler')
  const [statsData, setStatsData] = useState<StatisticsData>({
    totalUsers: 34,
    last24Hours: 6,
    totalReservations: 1234,
    totalRevenue: 45678,
    activePassengers: 892,
    completedFlights: 567,
    averageTicketPrice: 234,
    customerSatisfaction: 4.8,
    // Kullanıcı detayları
    todayRegistrations: 12,
    usersByCountry: {
      'TR': 18,
      'DE': 8,
      'FR': 4,
      'NL': 3,
      'BE': 1
    },
    abandonedRegistrations: 34,
    activeUsers24h: 28,
    // Rezervasyon detayları
    todayReservations: 15,
    cancelledReservations: 8,
    reservationGrowthPercentage: 12.5,
    // Gelir detayları
    todayRevenue: 1250,
    thisMonthRevenue: 15600,
    revenueGrowthPercentage: 8.3,
    // Uçuş detayları
    todayFlights: 12,
    thisMonthFlights: 145,
    flightGrowthPercentage: 6.7,
    topSearchedRoutes: [
      { route: 'İstanbul → Berlin', searches: 45, airports: 'IST → BER' },
      { route: 'Ankara → Amsterdam', searches: 38, airports: 'ESB → AMS' },
      { route: 'İzmir → Frankfurt', searches: 32, airports: 'ADB → FRA' }
    ]
  })
  const [currentTime, setCurrentTime] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)

  // Client-side hydration kontrolü
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Gerçek veri çekme
  useEffect(() => {
    if (!isClient) return

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR'))
    }

    // İlk yükleme
    fetchStats()
    updateTime()
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchStats()
      updateTime()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [isClient])

  // fetchStats fonksiyonunu useCallback ile sarmalayalım
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      // Ana istatistik API'sini çek
      const response = await fetch('/api/statistics')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStatsData(prev => ({
            ...prev,
            // Ana metrikler
            totalUsers: data.data.totalUsers,
            totalReservations: data.data.totalReservations,
            totalRevenue: data.data.totalRevenue,
            completedFlights: data.data.totalFlights,
            
            // Günlük metrikler
            todayRegistrations: data.data.todayRegistrations,
            todayReservations: data.data.todayReservations,
            todayRevenue: data.data.todayRevenue,
            activeUsers24h: data.data.activeUsers24h,
            
            // Ek metrikler
            cancelledReservations: data.data.cancelledReservations,
            abandonedRegistrations: data.data.abandonedUsers,
            thisMonthRevenue: data.data.thisMonthRevenue,
            thisMonthFlights: data.data.thisMonthFlights,
            
            // Büyüme oranları
            reservationGrowthPercentage: data.data.reservationGrowthPercentage,
            revenueGrowthPercentage: data.data.revenueGrowthPercentage,
            flightGrowthPercentage: data.data.flightGrowthPercentage,
            
            // Detaylı veriler
            usersByCountry: data.data.usersByCountry,
            topSearchedRoutes: data.data.topSearchedRoutes,
            
            // Fallback değerler
            todayFlights: data.data.todayReservations, // Uçuş = rezervasyon
            last24Hours: data.data.todayRegistrations,
            activePassengers: data.data.activeUsers24h,
            averageTicketPrice: data.data.totalRevenue > 0 && data.data.totalReservations > 0 ? 
              Math.round(data.data.totalRevenue / data.data.totalReservations) : 0,
            customerSatisfaction: 4.5 // Sabit değer
          }))
        }
      }
    } catch (error) {
      console.log('İstatistik verisi çekilemedi, demo veriler kullanılıyor')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 w-full overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Son güncelleme: {isClient ? currentTime : 'Yükleniyor...'}
                </div>
                <button 
                  onClick={fetchStats}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Yenile</span>
                </button>
              </div>
            </div>

            {/* Minimalist İstatistikler - Her satıra 2 kart */}
            <div className="space-y-4">
              {/* Satır 1: Kullanıcılar & Rezervasyonlar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Kullanıcı İstatistikleri */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Kullanıcılar</h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {loading ? '...' : statsData.totalUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {loading ? '...' : `+${statsData.todayRegistrations}`}
                      </p>
                      <p className="text-xs text-gray-500">Bugün</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">
                        {loading ? '...' : statsData.activeUsers24h}
                      </p>
                      <p className="text-xs text-gray-500">Aktif</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-600">
                        {loading ? '...' : statsData.abandonedRegistrations}
                      </p>
                      <p className="text-xs text-gray-500">Ayrılan</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(statsData.usersByCountry).slice(0, 4).map(([country, count]) => (
                        <span key={country} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {country} {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rezervasyon İstatistikleri */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Rezervasyonlar</h3>
                        <p className="text-2xl font-bold text-gray-900">{statsData.totalReservations}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">+{statsData.todayReservations}</p>
                      <p className="text-xs text-gray-500">Bugün</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">{statsData.cancelledReservations}</p>
                      <p className="text-xs text-gray-500">İptal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">+{statsData.reservationGrowthPercentage}%</p>
                      <p className="text-xs text-gray-500">Büyüme</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Satır 2: Gelir & Uçuşlar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gelir İstatistikleri */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <Euro className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Gelir</h3>
                        <p className="text-2xl font-bold text-gray-900">€{statsData.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">€{statsData.todayRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Bugün</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">€{statsData.thisMonthRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Bu Ay</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">+{statsData.revenueGrowthPercentage}%</p>
                      <p className="text-xs text-gray-500">Büyüme</p>
                    </div>
                  </div>
                </div>

                {/* Uçuş İstatistikleri */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Plane className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Uçuşlar</h3>
                        <p className="text-2xl font-bold text-gray-900">{statsData.completedFlights}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">{statsData.todayFlights}</p>
                      <p className="text-xs text-gray-500">Bugün</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">{statsData.thisMonthFlights}</p>
                      <p className="text-xs text-gray-500">Bu Ay</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">+{statsData.flightGrowthPercentage}%</p>
                      <p className="text-xs text-gray-500">Büyüme</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Satır 3: Popüler Rotalar */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Plane className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">En Çok Aranan Rotalar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {statsData.topSearchedRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{route.airports}</p>
                          <p className="text-xs text-gray-500">{route.route}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">{route.searches}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  )
} 