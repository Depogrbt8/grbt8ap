'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { Building2, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, X } from 'lucide-react'

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
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-3 w-3 text-red-600" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-blue-600" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
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
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Otel Rezervasyonları</h1>
                  <p className="text-xs text-gray-500">Tüm otel rezervasyonlarını görüntüleyin ve yönetin</p>
                </div>
              </div>
            </div>

            {/* Filtreler ve Arama */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Arama */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Otel, konum, rezervasyon no veya müşteri ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Durum Filtresi */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    >
                    Tümü ({bookings.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                      activeFilter === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Beklemede ({bookings.filter(b => b.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('confirmed')}
                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                      activeFilter === 'confirmed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Onaylandı ({bookings.filter(b => b.status === 'confirmed').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('cancelled')}
                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                      activeFilter === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    İptal ({bookings.filter(b => b.status === 'cancelled').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('completed')}
                    className={`px-2.5 py-1 text-xs font-medium rounded ${
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
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <div className="flex items-center">
                  <XCircle className="h-3 w-3 text-red-600 mr-1.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Rezervasyon Listesi */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-xs text-gray-600">Yükleniyor...</p>
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-center">
                  <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Rezervasyon bulunamadı</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Rezervasyon No
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Otel
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Müşteri
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Tarihler
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Tutar
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Durum
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Provider
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
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
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">
                                {booking.confirmationNumber || booking.id.slice(-8).toUpperCase()}
                              </div>
                              {booking.bookingReference && (
                                <div className="text-xs text-gray-400">
                                  {booking.bookingReference}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium text-gray-900">
                                {booking.hotelName}
                              </div>
                              {booking.roomName && (
                                <div className="text-xs text-gray-400">
                                  {booking.roomName}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium text-gray-900">
                                {guestInfo.firstName} {guestInfo.lastName}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900">
                                {new Date(booking.checkIn).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(booking.checkOut).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {booking.nights} gece
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">
                                {booking.totalPrice} {booking.currency || 'EUR'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-0.5">{getStatusText(booking.status)}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-600">
                                {booking.apiProvider?.displayName || booking.provider || 'Demo'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowDetailModal(true)
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
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

      {/* Detay Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Rezervasyon Detayları</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedBooking(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3">
              {(() => {
                const guests = parseGuests(selectedBooking.guests)
                const guestInfo = parseGuestInfo(selectedBooking.guestInfo)
                return (
                  <>
                    {/* Rezervasyon Bilgileri */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Rezervasyon No</div>
                        <div className="text-xs font-medium text-gray-900">
                          {selectedBooking.confirmationNumber || selectedBooking.id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      {selectedBooking.bookingReference && (
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Booking Reference</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.bookingReference}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Durum</div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Provider</div>
                        <div className="text-xs font-medium text-gray-900">
                          {selectedBooking.apiProvider?.displayName || selectedBooking.provider || 'Demo'}
                        </div>
                      </div>
                    </div>

                    {/* Otel Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Otel Bilgileri</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Otel Adı</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.hotelName}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Konum</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.hotelLocation}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Oda Tipi</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.roomType}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Oda Adı</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.roomName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tarih Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Tarih Bilgileri</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Giriş Tarihi</div>
                          <div className="text-xs font-medium text-gray-900">
                            {formatDate(selectedBooking.checkIn)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Çıkış Tarihi</div>
                          <div className="text-xs font-medium text-gray-900">
                            {formatDate(selectedBooking.checkOut)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Gece Sayısı</div>
                          <div className="text-xs font-medium text-gray-900">{selectedBooking.nights} gece</div>
                        </div>
                      </div>
                    </div>

                    {/* Misafir Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Misafir Bilgileri</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Yetişkin</div>
                          <div className="text-xs font-medium text-gray-900">{guests.adults} kişi</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Çocuk</div>
                          <div className="text-xs font-medium text-gray-900">{guests.children} kişi</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Oda Sayısı</div>
                          <div className="text-xs font-medium text-gray-900">{guests.rooms} oda</div>
                        </div>
                      </div>
                    </div>

                    {/* Müşteri Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Müşteri Bilgileri</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Ad Soyad</div>
                          <div className="text-xs font-medium text-gray-900">
                            {guestInfo.firstName} {guestInfo.lastName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Email</div>
                          <div className="text-xs font-medium text-gray-900">{guestInfo.email}</div>
                        </div>
                        {guestInfo.phone && (
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">Telefon</div>
                            <div className="text-xs font-medium text-gray-900">{guestInfo.phone}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fiyat Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Fiyat Bilgileri</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Toplam Tutar</div>
                          <div className="text-xs font-semibold text-gray-900">
                            {selectedBooking.totalPrice} {selectedBooking.currency || 'EUR'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* İptal Politikası */}
                    {selectedBooking.cancellationPolicy && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="text-xs font-semibold text-gray-900 mb-1">İptal Politikası</div>
                        <div className="text-xs text-gray-700">{selectedBooking.cancellationPolicy}</div>
                      </div>
                    )}

                    {/* İptal Bilgileri */}
                    {selectedBooking.status === 'cancelled' && selectedBooking.cancelledAt && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="text-xs font-semibold text-gray-900 mb-2">İptal Bilgileri</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">İptal Tarihi</div>
                            <div className="text-xs font-medium text-gray-900">
                              {new Date(selectedBooking.cancelledAt).toLocaleString('tr-TR')}
                            </div>
                          </div>
                          {selectedBooking.cancellationReason && (
                            <div>
                              <div className="text-xs text-gray-500 mb-0.5">İptal Nedeni</div>
                              <div className="text-xs font-medium text-gray-900">{selectedBooking.cancellationReason}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sistem Bilgileri */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">Sistem Bilgileri</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Oluşturulma</div>
                          <div className="text-xs font-medium text-gray-900">
                            {new Date(selectedBooking.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Son Güncelleme</div>
                          <div className="text-xs font-medium text-gray-900">
                            {new Date(selectedBooking.updatedAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                        {selectedBooking.providerBookingId && (
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">Provider Booking ID</div>
                            <div className="text-xs font-medium text-gray-900">{selectedBooking.providerBookingId}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedBooking(null)
                }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

