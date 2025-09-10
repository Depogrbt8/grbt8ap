'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { Users, Calendar, Euro, Plane, TrendingUp, Star, Clock, Activity, Globe, UserX, UserPlus } from 'lucide-react'

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

  // Client-side hydration kontrolü
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ana site ile eş zamanlı veri çekme
  useEffect(() => {
    if (!isClient) return

    const fetchStats = async () => {
      try {
        // Kullanıcı metriklerini çek
        const userMetricsResponse = await fetch('/api/users/metrics')
        if (userMetricsResponse.ok) {
          const userMetricsData = await userMetricsResponse.json()
          if (userMetricsData.success) {
            setStatsData(prev => ({
              ...prev,
              totalUsers: userMetricsData.data.totalUsers,
              todayRegistrations: userMetricsData.data.todayRegistrations,
              activeUsers24h: userMetricsData.data.activeUsers24h,
              usersByCountry: userMetricsData.data.usersByCountry,
              abandonedRegistrations: userMetricsData.data.abandonedRegistrations
            }))
          }
        }

        // Rezervasyon metriklerini çek
        const reservationMetricsResponse = await fetch('/api/reservations/metrics')
        if (reservationMetricsResponse.ok) {
          const reservationMetricsData = await reservationMetricsResponse.json()
          if (reservationMetricsData.success) {
            setStatsData(prev => ({
              ...prev,
              totalReservations: reservationMetricsData.data.totalReservations,
              todayReservations: reservationMetricsData.data.todayReservations,
              cancelledReservations: reservationMetricsData.data.cancelledReservations,
              reservationGrowthPercentage: reservationMetricsData.data.growthPercentage
            }))
          }
        }

        // Gelir metriklerini çek
        const revenueMetricsResponse = await fetch('/api/revenue/metrics')
        if (revenueMetricsResponse.ok) {
          const revenueMetricsData = await revenueMetricsResponse.json()
          if (revenueMetricsData.success) {
            setStatsData(prev => ({
              ...prev,
              totalRevenue: revenueMetricsData.data.totalRevenue,
              todayRevenue: revenueMetricsData.data.todayRevenue,
              thisMonthRevenue: revenueMetricsData.data.thisMonthRevenue,
              revenueGrowthPercentage: revenueMetricsData.data.growthPercentage
            }))
          }
        }

        // Uçuş metriklerini çek
        const flightMetricsResponse = await fetch('/api/flights/metrics')
        if (flightMetricsResponse.ok) {
          const flightMetricsData = await flightMetricsResponse.json()
          if (flightMetricsData.success) {
            setStatsData(prev => ({
              ...prev,
              completedFlights: flightMetricsData.data.totalFlights,
              todayFlights: flightMetricsData.data.todayFlights,
              thisMonthFlights: flightMetricsData.data.thisMonthFlights,
              flightGrowthPercentage: flightMetricsData.data.growthPercentage,
              topSearchedRoutes: flightMetricsData.data.topSearchedRoutes
            }))
          }
        }

        // Diğer istatistikleri çek (rezervasyon, gelir vb.)
        const response = await fetch('/api/statistics')
        if (response.ok) {
          const data = await response.json()
          setStatsData(prev => ({
            ...prev,
            totalReservations: data.totalReservations || prev.totalReservations,
            totalRevenue: data.totalRevenue || prev.totalRevenue,
            activePassengers: data.activePassengers || prev.activePassengers,
            completedFlights: data.completedFlights || prev.completedFlights,
            averageTicketPrice: data.averageTicketPrice || prev.averageTicketPrice,
            customerSatisfaction: data.customerSatisfaction || prev.customerSatisfaction
          }))
        }
      } catch (error) {
        console.log('İstatistik verisi çekilemedi, demo veriler kullanılıyor')
      }
    }

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
              <div className="text-sm text-gray-500">
                Son güncelleme: {isClient ? currentTime : 'Yükleniyor...'}
              </div>
            </div>

            {/* Ana Metrikler - Kompakt Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Kullanıcılar - Genişletilmiş */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-900">Kullanıcı İstatistikleri</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{statsData.totalUsers}</p>
                    <p className="text-xs text-gray-500">Toplam Kullanıcı</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {/* Bugün Kayıt Olanlar */}
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <UserPlus className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">{statsData.todayRegistrations}</p>
                    <p className="text-xs text-green-600">Bugün Kayıt</p>
                  </div>
                  
                  {/* Ayrılan Kullanıcılar */}
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <UserX className="h-4 w-4 text-red-600 mx-auto mb-1" />
                    <p className="font-semibold text-red-700">{statsData.abandonedRegistrations}</p>
                    <p className="text-xs text-red-600">Ayrılan</p>
                  </div>
                  
                  {/* Aktif Kullanıcılar */}
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-700">{statsData.activeUsers24h}</p>
                    <p className="text-xs text-blue-600">Aktif 24h</p>
                  </div>
                </div>
                
                {/* Ülkelere Göre Dağılım */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-700">Ülkelere Göre Dağılım</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statsData.usersByCountry).map(([country, count]) => (
                      <div key={country} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs">
                        <span className="font-medium text-gray-700">{country}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rezervasyonlar - Detaylandırılmış */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-900">Rezervasyon İstatistikleri</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{statsData.totalReservations}</p>
                    <p className="text-xs text-gray-500">Toplam Rezervasyon</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {/* Bugün Yapılan Rezervasyonlar */}
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-700">{statsData.todayReservations}</p>
                    <p className="text-xs text-blue-600">Bugün Yapılan</p>
                  </div>
                  
                  {/* İptal Edilen Rezervasyonlar */}
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <UserX className="h-4 w-4 text-red-600 mx-auto mb-1" />
                    <p className="font-semibold text-red-700">{statsData.cancelledReservations}</p>
                    <p className="text-xs text-red-600">İptal Edilen</p>
                  </div>
                  
                  {/* Büyüme Oranı */}
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">+{statsData.reservationGrowthPercentage}%</p>
                    <p className="text-xs text-green-600">Bu Ay Büyüme</p>
                  </div>
                </div>
              </div>
            </div>

            {/* İkinci Satır Metrikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Gelir - Detaylandırılmış */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Euro className="h-6 w-6 text-yellow-500" />
                    <h3 className="text-sm font-medium text-gray-900">Gelir İstatistikleri</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{statsData.totalRevenue.toLocaleString('en-US')}</p>
                    <p className="text-xs text-gray-500">Toplam Gelir</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {/* Bugünkü Gelir */}
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <Euro className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">€{statsData.todayRevenue.toLocaleString('en-US')}</p>
                    <p className="text-xs text-green-600">Bugün</p>
                  </div>
                  
                  {/* Bu Ayki Gelir */}
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-700">€{statsData.thisMonthRevenue.toLocaleString('en-US')}</p>
                    <p className="text-xs text-blue-600">Bu Ay</p>
                  </div>
                  
                  {/* Büyüme Oranı */}
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                    <p className="font-semibold text-yellow-700">+{statsData.revenueGrowthPercentage}%</p>
                    <p className="text-xs text-yellow-600">Büyüme</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Üçüncü Satır - Uçuş İstatistikleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Uçuşlar - Detaylandırılmış */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-6 w-6 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900">Uçuş İstatistikleri</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{statsData.completedFlights}</p>
                    <p className="text-xs text-gray-500">Toplam Uçuş</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {/* Bugünkü Uçuşlar */}
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <Plane className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <p className="font-semibold text-purple-700">{statsData.todayFlights}</p>
                    <p className="text-xs text-purple-600">Bugün</p>
                  </div>
                  
                  {/* Bu Ayki Uçuşlar */}
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-700">{statsData.thisMonthFlights}</p>
                    <p className="text-xs text-blue-600">Bu Ay</p>
                  </div>
                  
                  {/* Büyüme */}
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">+{statsData.flightGrowthPercentage}%</p>
                    <p className="text-xs text-green-600">Büyüme</p>
                  </div>
                </div>
                
                {/* En Çok Aranan Rotalar */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Plane className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-700">En Çok Aranan Rotalar</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statsData.topSearchedRoutes.map((route, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs">
                        <span className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-700">{route.airports}</span>
                        <span className="text-gray-500">{route.searches}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  )
} 