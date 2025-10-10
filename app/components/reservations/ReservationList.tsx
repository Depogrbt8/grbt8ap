'use client'
import { useState } from 'react'

interface Passenger {
  name: string
  seat: string
  baggage: string
  ticketType: string
  // Ekstra bagaj bilgileri
  extraBaggage?: {
    value: number
    unit: string
    price: number
    currency: string
  }
}

interface Flight {
  id: string
  airlineName: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  direct: boolean
  baggage: string
}

interface Agency {
  agencyId: string
  companyName: string
  address: string
  taxNo: string
  taxOffice: string
}

interface Ticket {
  ticketNumber: string
  passengerName: string
  pnr: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  seat: string
  price: number
  currency: string
  status: string
}

interface Reservation {
  id: string
  name: string
  orderType: 'individual' | 'corporate'
  status: 'ready' | 'preparing' | 'cancelled' | 'completed'
  orderDate: string
  adultCount: number
  childCount: number
  infantCount: number
  studentCount: number
  militaryCount: number
  phoneNumber?: string
  phoneArea?: string
  email?: string
  totalAmount?: number
  orderReason?: string
  paymentType?: string
  paymentMethod?: string
  agencyCommission?: number
  invoicePreference?: string
  note?: string
  validUntil?: string
  currency?: string
  bookingType?: 'book' | 'reserve'
  tripType?: 'oneWay' | 'roundTrip'
  contactInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  passengers?: Passenger[]
  flights?: Flight[]
  // Ana site ekstra bilgileri
  agency?: Agency
  tickets?: Ticket[]
  // Fare detayları
  fareId?: string
  cabinClass?: string
  bookingClass?: string
  fareType?: string
  duration?: string
  direct?: boolean
  // Ekstra bagaj bilgileri
  totalExtraBaggagePrice?: number
}

interface ReservationListProps {
  reservations: Reservation[]
  onStatusChange: (id: string, status: string) => void
  onViewDetails: (id: string) => void
}

export default function ReservationList({ reservations, onStatusChange, onViewDetails }: ReservationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'preparing':
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
      case 'ready':
        return 'Hazır'
      case 'preparing':
        return 'Hazırlanıyor'
      case 'cancelled':
        return 'İptal Edildi'
      case 'completed':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const getOrderReasonText = (orderReason: string) => {
    switch (orderReason) {
      case 'vacation':
        return 'Tatil'
      case 'business':
        return 'İş'
      case 'school':
        return 'Okul'
      case 'health':
        return 'Sağlık'
      case 'sport':
        return 'Spor'
      case 'foundation':
        return 'Vakıf'
      case 'ministry':
        return 'Bakanlık'
      case 'municipality':
        return 'Belediye'
      case 'none':
        return 'Belirtilmemiş'
      default:
        return orderReason
    }
  }

  const getPaymentTypeText = (paymentType: string) => {
    switch (paymentType) {
      case 'creditCard':
        return 'Kredi Kartı'
      case 'cash':
        return 'Nakit'
      case 'bankTransfer':
        return 'Banka Transferi'
      default:
        return paymentType
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getTotalPassengers = (reservation: Reservation) => {
    return reservation.adultCount + reservation.childCount + reservation.infantCount + 
           reservation.studentCount + reservation.militaryCount
  }

  const getTotalTickets = (reservation: Reservation) => {
    return reservation.tickets?.length || 0
  }

  const getTotalFlights = (reservation: Reservation) => {
    return reservation.flights?.length || 0
  }

  return (
    <div className="admin-card">
      {/* Tablo Başlığı */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-700">
          <div className="text-center">Ad Soyad</div>
          <div className="text-center">Bilet</div>
          <div className="text-center">Tarih</div>
          <div className="text-center">Yolcu</div>
          <div className="text-center">Tutar</div>
          <div className="text-center">Seyahat</div>
          <div className="text-center">Durum</div>
        </div>
      </div>

      {/* Tablo Satırları */}
      <div className="divide-y divide-gray-200">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-4 text-sm">
                  <div className="text-center text-gray-900">{reservation.name}</div>
                  <div className="text-center text-gray-900">{reservation.tickets?.[0]?.ticketNumber || '-'}</div>
                  <div className="text-center text-gray-900">{formatDate(reservation.orderDate)}</div>
                  <div className="text-center text-gray-900">{getTotalPassengers(reservation)}</div>
                  <div className="text-center text-gray-900">{reservation.totalAmount ? `${reservation.currency || '€'}${reservation.totalAmount.toFixed(2)}` : '-'}</div>
                  <div className="text-center text-gray-900">{reservation.tripType === 'oneWay' ? 'Tek Yön' : 'Gidiş-Dönüş'}</div>
                  <div className="text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setExpandedId(expandedId === reservation.id ? null : reservation.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {expandedId === reservation.id ? 'Gizle' : 'Detay'}
                </button>
                <button
                  onClick={() => onViewDetails(reservation.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Görüntüle
                </button>
              </div>
            </div>

            {/* Genişletilmiş Bilgiler */}
            {expandedId === reservation.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sol Kolon */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Rezervasyon Detayları</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Müşteri:</dt>
                        <dd className="text-gray-900">{reservation.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Telefon:</dt>
                        <dd className="text-gray-900">
                          {reservation.phoneArea && reservation.phoneNumber 
                            ? `${reservation.phoneArea} ${reservation.phoneNumber}`
                            : reservation.phoneNumber || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">E-posta:</dt>
                        <dd className="text-gray-900">{reservation.email || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Seyahat Nedeni:</dt>
                        <dd className="text-gray-900">{getOrderReasonText(reservation.orderReason || 'none')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Ödeme Türü:</dt>
                        <dd className="text-gray-900">{getPaymentTypeText(reservation.paymentType || '')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Geçerlilik:</dt>
                        <dd className="text-gray-900">{reservation.validUntil ? formatDate(reservation.validUntil) : '-'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Sağ Kolon */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Yolcu Dağılımı</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Yetişkin:</span>
                        <span className="font-medium">{reservation.adultCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Çocuk:</span>
                        <span className="font-medium">{reservation.childCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bebek:</span>
                        <span className="font-medium">{reservation.infantCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Öğrenci:</span>
                        <span className="font-medium">{reservation.studentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Asker:</span>
                        <span className="font-medium">{reservation.militaryCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Toplam:</span>
                        <span className="font-medium text-blue-600">{getTotalPassengers(reservation)}</span>
                      </div>
                    </div>

                    {/* Ana site ekstra bilgileri */}
                    {reservation.fareId && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Tarife Bilgileri</h5>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tarife ID:</span>
                            <span className="text-gray-900">{reservation.fareId}</span>
                          </div>
                          {reservation.cabinClass && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Kabin:</span>
                              <span className="text-gray-900">{reservation.cabinClass}</span>
                            </div>
                          )}
                          {reservation.bookingClass && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Sınıf:</span>
                              <span className="text-gray-900">{reservation.bookingClass}</span>
                            </div>
                          )}
                          {reservation.fareType && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tarife Tipi:</span>
                              <span className="text-gray-900">{reservation.fareType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Durum Değiştirme */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Durum Güncelle</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onStatusChange(reservation.id, 'ready')}
                      disabled={reservation.status === 'ready'}
                      className="px-3 py-1 text-sm rounded border ${
                        reservation.status === 'ready'
                          ? 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed'
                          : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                      }"
                    >
                      Hazır
                    </button>
                    <button
                      onClick={() => onStatusChange(reservation.id, 'preparing')}
                      disabled={reservation.status === 'preparing'}
                      className="px-3 py-1 text-sm rounded border ${
                        reservation.status === 'preparing'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed'
                          : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50'
                      }"
                    >
                      Hazırlanıyor
                    </button>
                    <button
                      onClick={() => onStatusChange(reservation.id, 'completed')}
                      disabled={reservation.status === 'completed'}
                      className="px-3 py-1 text-sm rounded border ${
                        reservation.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed'
                          : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                      }"
                    >
                      Tamamlandı
                    </button>
                    <button
                      onClick={() => onStatusChange(reservation.id, 'cancelled')}
                      disabled={reservation.status === 'cancelled'}
                      className="px-3 py-1 text-sm rounded border ${
                        reservation.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed'
                          : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                      }"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 