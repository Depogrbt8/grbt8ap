'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { Car, Calendar, MapPin, Search, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

interface CarBooking {
  id: string
  userId: string
  bookingNumber: string
  bookingReference?: string
  carName: string
  carCategory: string
  supplierName: string
  pickupDateTime: string
  dropoffDateTime: string
  pickupLocation?: string
  dropoffLocation?: string
  driver: string
  totalPrice: number
  currency: string
  status: string
  createdAt: string
  confirmationEmail?: string
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

export default function AracRezervasyonlarPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('araclar')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState<CarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [activeFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (activeFilter !== 'all') params.append('status', activeFilter)
      // Demo veri görmek için: ?mock=true ekle (veya ana site boşsa otomatik mock döner)
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1') {
        params.set('mock', 'true')
      }
      const response = await fetch(`/api/cars/bookings?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : data.data?.bookings ?? []
        setBookings(list)
      } else {
        setError(data.error || 'Rezervasyonlar yüklenemedi')
        setBookings([])
      }
    } catch (err) {
      console.error(err)
      setError('Rezervasyonlar yüklenirken hata oluştu')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Onaylandı'
      case 'pending': return 'Beklemede'
      case 'cancelled': return 'İptal'
      case 'completed': return 'Tamamlandı'
      default: return status
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'pending': return <AlertCircle className="h-3 w-3 text-yellow-600" />
      case 'cancelled': return <XCircle className="h-3 w-3 text-red-600" />
      case 'completed': return <CheckCircle className="h-3 w-3 text-blue-600" />
      default: return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const parseDriver = (driverJson: string) => {
    try {
      const d = typeof driverJson === 'string' ? JSON.parse(driverJson) : driverJson
      return { firstName: d?.firstName || '', lastName: d?.lastName || '', email: d?.email || '', phone: d?.phone || '', countryCode: d?.countryCode || '' }
    } catch {
      return { firstName: '', lastName: '', email: '', phone: '', countryCode: '' }
    }
  }

  const parseLocation = (loc: string | undefined): { name?: string; address?: string } => {
    if (!loc) return {}
    try {
      const o = typeof loc === 'string' ? JSON.parse(loc) : loc
      return { name: o?.name, address: o?.address }
    } catch {
      return {}
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter !== 'all' && b.status !== activeFilter) return false
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    const driver = parseDriver(b.driver)
    return (
      b.bookingNumber?.toLowerCase().includes(s) ||
      b.carName?.toLowerCase().includes(s) ||
      b.supplierName?.toLowerCase().includes(s) ||
      b.user?.email?.toLowerCase().includes(s) ||
      (b.user?.firstName && b.user.firstName.toLowerCase().includes(s)) ||
      (b.user?.lastName && b.user.lastName.toLowerCase().includes(s)) ||
      driver.email?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header />
        <main className="flex-1 p-4 w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-green-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Araç Rezervasyonları</h1>
                  <p className="text-xs text-gray-500">Tüm araç kiralama rezervasyonlarını görüntüleyin</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rezervasyon no, araç, müşteri ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-2.5 py-1 text-xs font-medium rounded ${
                        activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all' ? 'Tümü' : getStatusText(f)} ({f === 'all' ? bookings.length : bookings.filter((b) => b.status === f).length})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center">
                <XCircle className="h-3 w-3 text-red-600 mr-1.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <p className="ml-2 text-xs text-gray-600">Yükleniyor...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Rezervasyon bulunamadı</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Rezervasyon No</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Araç</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Tarihler</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                        <th className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((b) => {
                        const driver = parseDriver(b.driver)
                        const userName = b.user
                          ? [b.user.firstName, b.user.lastName].filter(Boolean).join(' ') || b.user.email
                          : [driver.firstName, driver.lastName].filter(Boolean).join(' ') || driver.email || '-'
                        const userEmail = b.user?.email || driver.email || ''
                        const isExpanded = expandedId === b.id
                        return (
                          <React.Fragment key={b.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900">{b.bookingNumber}</div>
                                {b.bookingReference && <div className="text-xs text-gray-400">{b.bookingReference}</div>}
                              </td>
                              <td className="px-3 py-1.5">
                                <div className="text-xs font-medium text-gray-900">{b.carName}</div>
                                <div className="text-xs text-gray-500">{b.carCategory} · {b.supplierName}</div>
                              </td>
                              <td className="px-3 py-1.5">
                                <div className="text-xs leading-tight">
                                  <span className="font-medium text-gray-900">{userName}</span>
                                  {userEmail && <span className="text-gray-500"> · {userEmail}</span>}
                                </div>
                                {b.user?.id && (
                                  <a href={`/kullanici/${b.user.id}`} className="text-xs text-blue-600 hover:underline">Kullanıcıya git</a>
                                )}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-700 leading-tight">
                                {new Date(b.pickupDateTime).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' – '}
                                {new Date(b.dropoffDateTime).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">
                                {b.totalPrice} {b.currency}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(b.status)}`}>
                                  {getStatusIcon(b.status)}
                                  <span className="ml-0.5">{getStatusText(b.status)}</span>
                                </span>
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  {isExpanded ? 'Gizle' : 'Detay'}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="px-3 py-3 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <div className="font-semibold text-gray-900 mb-1.5">Rezervasyon Bilgileri</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Rezervasyon No:</span><span className="text-gray-900 font-medium">{b.bookingNumber}</span></div>
                                        {b.bookingReference && <div className="flex justify-between"><span className="text-gray-500">Referans:</span><span className="text-gray-900">{b.bookingReference}</span></div>}
                                        <div className="flex justify-between"><span className="text-gray-500">Durum:</span><span className={`inline-flex px-1.5 py-0.5 rounded font-medium ${getStatusColor(b.status)}`}>{getStatusText(b.status)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Oluşturulma:</span><span className="text-gray-900">{b.createdAt ? formatDate(b.createdAt) : '-'}</span></div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 mb-1.5">Araç Bilgileri</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Araç:</span><span className="text-gray-900 font-medium">{b.carName}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Kategori:</span><span className="text-gray-900">{b.carCategory}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Tedarikçi:</span><span className="text-gray-900">{b.supplierName}</span></div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 mb-1.5">Tarih ve Lokasyon</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Alış:</span><span className="text-gray-900">{formatDate(b.pickupDateTime)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Teslim:</span><span className="text-gray-900">{formatDate(b.dropoffDateTime)}</span></div>
                                        {(parseLocation(b.pickupLocation).name || parseLocation(b.dropoffLocation).name) && (
                                          <>
                                            {parseLocation(b.pickupLocation).name && <div className="flex justify-between"><span className="text-gray-500">Alış yeri:</span><span className="text-gray-900">{parseLocation(b.pickupLocation).name}</span></div>}
                                            {parseLocation(b.dropoffLocation).name && <div className="flex justify-between"><span className="text-gray-500">Teslim yeri:</span><span className="text-gray-900">{parseLocation(b.dropoffLocation).name}</span></div>}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 mb-1.5">Müşteri / Sürücü Bilgileri</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Ad Soyad:</span><span className="text-gray-900">{driver.firstName} {driver.lastName}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">E-posta:</span><span className="text-gray-900">{driver.email || b.confirmationEmail || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Telefon:</span><span className="text-gray-900">{driver.countryCode ? `${driver.countryCode} ${driver.phone}` : driver.phone || '-'}</span></div>
                                        {b.user?.id && <div className="flex justify-between"><span className="text-gray-500">Kullanıcı:</span><a href={`/kullanici/${b.user.id}`} className="text-blue-600 hover:underline">Profili aç</a></div>}
                                      </div>
                                    </div>
                                    <div className="md:col-span-2">
                                      <div className="font-semibold text-gray-900 mb-1.5">Fiyat Bilgileri</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Toplam:</span><span className="text-gray-900 font-medium">{b.totalPrice} {b.currency}</span></div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
