'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { Building2, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react'

interface HotelBooking {
  id: string
  userId: string
  hotelId: string
  hotelName: string
  hotelLocation: string
  roomType: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: string // JSON: { adults: number, children: number, rooms: number }
  guestInfo: string // JSON: { firstName, lastName, email, phone }
  totalPrice: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  confirmationNumber?: string
  bookingReference?: string
  cancellationPolicy?: string
  provider?: string
  providerBookingId?: string
  apiProviderId?: string
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  cancellationReason?: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  apiProvider?: {
    name: string
    displayName: string
  }
}

export default function OtelRezervasyonlarPage() {
  const [activeTab, setActiveTab] = useState('oteller')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState<HotelBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [activeFilter, searchTerm])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (activeFilter !== 'all') {
        params.append('status', activeFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/hotels/bookings?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setBookings(data.data || [])
      } else {
        setError(data.error || 'Rezervasyonlar yüklenemedi')
        setBookings([])
      }
    } catch (err: any) {
      console.error('Otel rezervasyonları yükleme hatası:', err)
      setError('Rezervasyonlar yüklenirken hata oluştu')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı'
      case 'pending':
        return 'Beklemede'
      case 'cancelled':
        return 'İptal Edildi'
      case 'completed':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const parseGuests = (guestsJson: string) => {
    try {
      const guests = typeof guestsJson === 'string' ? JSON.parse(guestsJson) : guestsJson
      return {
        adults: guests.adults || 0,
        children: guests.children || 0,
        rooms: guests.rooms || 1
      }
    } catch {
      return { adults: 0, children: 0, rooms: 1 }
    }
  }

  const parseGuestInfo = (guestInfoJson: string) => {
    try {
      return typeof guestInfoJson === 'string' ? JSON.parse(guestInfoJson) : guestInfoJson
    } catch {
      return { firstName: '', lastName: '', email: '', phone: '' }
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter !== 'all' && booking.status !== activeFilter) {
      return false
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        booking.hotelName?.toLowerCase().includes(searchLower) ||
        booking.hotelLocation?.toLowerCase().includes(searchLower) ||
        booking.confirmationNumber?.toLowerCase().includes(searchLower) ||
        booking.bookingReference?.toLowerCase().includes(searchLower) ||
        booking.user?.email?.toLowerCase().includes(searchLower) ||
        booking.user?.firstName?.toLowerCase().includes(searchLower) ||
        booking.user?.lastName?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Otel Rezervasyonları</h1>
                  <p className="text-gray-600">Tüm otel rezervasyonlarını görüntüleyin ve yönetin</p>
                </div>
              </div>
            </div>

            {/* Filtreler ve Arama */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Arama */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Otel, konum, rezervasyon no veya müşteri ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Durum Filtresi */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tümü ({bookings.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Beklemede ({bookings.filter(b => b.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('confirmed')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'confirmed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Onaylandı ({bookings.filter(b => b.status === 'confirmed').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('cancelled')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    İptal ({bookings.filter(b => b.status === 'cancelled').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('completed')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeFilter === 'completed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tamamlandı ({bookings.filter(b => b.status === 'completed').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Rezervasyon Listesi */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="ml-3 text-gray-600">Rezervasyonlar yükleniyor...</p>
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Rezervasyon bulunamadı</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rezervasyon No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Otel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Müşteri
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarihler
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Misafirler
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => {
                        const guests = parseGuests(booking.guests)
                        const guestInfo = parseGuestInfo(booking.guestInfo)
                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.confirmationNumber || booking.id.slice(-8).toUpperCase()}
                              </div>
                              {booking.bookingReference && (
                                <div className="text-xs text-gray-500">
                                  Ref: {booking.bookingReference}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.hotelName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.hotelLocation}
                              </div>
                              {booking.roomName && (
                                <div className="text-xs text-gray-500">
                                  {booking.roomName} ({booking.roomType})
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {guestInfo.firstName} {guestInfo.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{guestInfo.email}</div>
                              {guestInfo.phone && (
                                <div className="text-xs text-gray-500">{guestInfo.phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                {formatDate(booking.checkIn)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(booking.checkOut)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.nights} gece
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <Users className="h-4 w-4 inline mr-1" />
                                {guests.adults} Yetişkin
                              </div>
                              {guests.children > 0 && (
                                <div className="text-xs text-gray-500">
                                  {guests.children} Çocuk
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {guests.rooms} Oda
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.totalPrice} {booking.currency || 'EUR'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{getStatusText(booking.status)}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.apiProvider?.displayName || booking.provider || 'Demo'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => window.location.href = `/oteller/rezervasyonlar/${booking.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Detay
                              </button>
                            </td>
                          </tr>
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

