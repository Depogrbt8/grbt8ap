'use client'
import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import ReservationDetailHeader from '../../components/reservations/ReservationDetailHeader'

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

interface AirRule {
  title: string
  detail: string
}

interface Reservation {
  id: string
  pnr: string
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
  airRules?: AirRule[]
  // Fare detayları
  fareId?: string
  cabinClass?: string
  fareRules?: {
    cancellation: string
    change: string
    refund: string
  }
  bookingClass?: string
  fareType?: string
  duration?: string
  direct?: boolean
  // Ekstra bagaj bilgileri
  totalExtraBaggagePrice?: number
}

export default function RezervasyonDetayPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('rezervasyonlar')
  const [activeDetailTab, setActiveDetailTab] = useState('genel')

  // Ana site bilgilerine göre örnek rezervasyon verisi
      const [reservation] = useState<Reservation>({
      id: params.id,
      pnr: 'ABC123456',
      name: 'Ahmet Yılmaz',
    orderType: 'individual',
    status: 'ready',
    orderDate: '2024-07-20T15:30:00.000Z',
    adultCount: 2,
    childCount: 1,
    infantCount: 0,
    studentCount: 0,
    militaryCount: 0,
    phoneNumber: '5551234567',
    phoneArea: '+90',
    email: 'ahmet.yilmaz@example.com',
    totalAmount: 125.50,
    orderReason: 'vacation',
    paymentType: 'creditCard',
    paymentMethod: 'threeD',
    agencyCommission: 0,
    invoicePreference: 'toAgency',
    note: 'Pencere kenarı tercih edilir',
    validUntil: '2024-07-22T15:30:00.000Z',
    currency: 'EUR',
    bookingType: 'book',
    tripType: 'roundTrip',
    contactInfo: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      phone: '+90 555 123 4567'
    },
          passengers: [
        {
          name: 'Ahmet Yılmaz',
          seat: '12A',
          baggage: '20kg',
          ticketType: 'Ekonomi',
          extraBaggage: {
            value: 5,
            unit: 'KG',
            price: 25.00,
            currency: 'EUR'
          }
        },
        {
          name: 'Fatma Yılmaz',
          seat: '12B',
          baggage: '20kg',
          ticketType: 'Ekonomi',
          extraBaggage: {
            value: 10,
            unit: 'KG',
            price: 45.00,
            currency: 'EUR'
          }
        },
        {
          name: 'Ali Yılmaz',
          seat: '12C',
          baggage: '15kg',
          ticketType: 'Çocuk'
        }
      ],
    flights: [
      {
        id: 'flight-1',
        airlineName: 'Turkish Airlines',
        flightNumber: 'TK123',
        origin: 'IST',
        destination: 'AMS',
        departureTime: '2024-08-15T09:00:00',
        arrivalTime: '2024-08-15T11:20:00',
        duration: '2s 20d',
        price: 85.50,
        currency: 'EUR',
        direct: true,
        baggage: '20 kg'
      },
      {
        id: 'flight-2',
        airlineName: 'Turkish Airlines',
        flightNumber: 'TK124',
        origin: 'AMS',
        destination: 'IST',
        departureTime: '2024-08-22T14:30:00',
        arrivalTime: '2024-08-22T18:50:00',
        duration: '3s 20d',
        price: 40.00,
        currency: 'EUR',
        direct: true,
        baggage: '20 kg'
      }
    ],
    // Ana site ekstra bilgileri
    agency: {
      agencyId: 'demo-agency-id',
      companyName: 'DEMO SEYAHAT',
      address: 'İstanbul, Türkiye',
      taxNo: '1234567890',
      taxOffice: 'DEMO',
    },
    tickets: [
      {
        ticketNumber: 'DEMO-TKT-1001',
        passengerName: 'Ahmet Yılmaz',
        pnr: 'DEMO123456',
        flightNumber: 'TK123',
        origin: 'IST',
        destination: 'AMS',
        departureTime: '2024-08-15T09:00:00',
        seat: '12A',
        price: 85.50,
        currency: 'EUR',
        status: 'confirmed'
      },
      {
        ticketNumber: 'DEMO-TKT-1002',
        passengerName: 'Fatma Yılmaz',
        pnr: 'DEMO123456',
        flightNumber: 'TK123',
        origin: 'IST',
        destination: 'AMS',
        departureTime: '2024-08-15T09:00:00',
        seat: '12B',
        price: 85.50,
        currency: 'EUR',
        status: 'confirmed'
      },
      {
        ticketNumber: 'DEMO-TKT-1003',
        passengerName: 'Ali Yılmaz',
        pnr: 'DEMO123456',
        flightNumber: 'TK123',
        origin: 'IST',
        destination: 'AMS',
        departureTime: '2024-08-15T09:00:00',
        seat: '12C',
        price: 40.00,
        currency: 'EUR',
        status: 'confirmed'
      }
    ],
    airRules: [
      { title: 'Bagaj Kuralları', detail: 'Her yolcu için 20kg bagaj dahildir. Ekstra bagaj ücretlidir.' },
      { title: 'İade/Değişiklik', detail: 'İade edilemez, değişiklik ücreti 50 EUR.' },
      { title: 'Check-in', detail: 'Online check-in uçuş saatinden 24 saat önce başlar.' }
    ],
    // Fare detayları
    fareId: 'demo-fare-id-12345',
    cabinClass: 'Economy',
    fareRules: {
      cancellation: 'İade edilemez',
      change: 'Değişiklik ücreti: 50 EUR',
      refund: 'İade edilemez'
    },
    bookingClass: 'Y',
    fareType: 'Public',
    duration: '2s 20d',
    direct: true,
          // Ekstra bagaj bilgileri
      totalExtraBaggagePrice: 70.00
  })

  // Event handlers
  const handleBack = () => {
    window.history.back()
  }

  const handleApprove = () => {
    // Bilet Dükkanı API'ye onay isteği gönder
    console.log('Rezervasyon onaylandı:', reservation.id)
    // TODO: API call to update status to 'completed'
  }

  const handlePrepare = () => {
    // Bilet Dükkanı API'ye hazırlama isteği gönder
    console.log('Rezervasyon hazırlanıyor:', reservation.id)
    // TODO: API call to update status to 'ready'
  }

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Lütfen iptal sebebini belirtin')
      return
    }

    setIsProcessing(true)
    try {
      // Bilet Dükkanı API'ye iptal isteği gönder
      const response = await fetch(`/api/orders/${reservation.id}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason: cancelReason,
          refundAmount: reservation.totalAmount || 0
        })
      })

      if (response.ok) {
        alert('Rezervasyon başarıyla iptal edildi')
        setShowCancelModal(false)
        setCancelReason('')
        // Sayfayı yenile veya state'i güncelle
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`İptal işlemi başarısız: ${error.message}`)
      }
    } catch (error) {
      console.error('İptal hatası:', error)
      alert('İptal işlemi sırasında bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (refundAmount <= 0) {
      alert('Lütfen geçerli bir iade tutarı girin')
      return
    }

    setIsProcessing(true)
    try {
      // Bilet Dükkanı API'ye iade isteği gönder
      const response = await fetch(`/api/orders/${reservation.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: refundAmount,
          reason: 'Manuel iade işlemi'
        })
      })

      if (response.ok) {
        alert('İade işlemi başarıyla tamamlandı')
        setShowRefundModal(false)
        setRefundAmount(0)
        // Sayfayı yenile veya state'i güncelle
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`İade işlemi başarısız: ${error.message}`)
      }
    } catch (error) {
      console.error('İade hatası:', error)
      alert('İade işlemi sırasında bir hata oluştu')
    } finally {
      setIsProcessing(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const getTotalPassengers = () => {
    return reservation.adultCount + reservation.childCount + reservation.infantCount + 
           reservation.studentCount + reservation.militaryCount
  }

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 w-full">
          <div className="p-6">
            {/* Rezervasyon Başlık */}
            <ReservationDetailHeader
              reservation={reservation}
              onBack={handleBack}
              onApprove={handleApprove}
              onPrepare={handlePrepare}
              onCancel={handleCancel}
              onShowCancelModal={() => setShowCancelModal(true)}
              onShowRefundModal={() => setShowRefundModal(true)}
            />

            {/* Detay Sekmeleri */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tab Başlıkları */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveDetailTab('genel')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailTab === 'genel'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Genel Bilgiler
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('yolcular')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailTab === 'yolcular'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Yolcular ({getTotalPassengers()})
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('ucuslar')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailTab === 'ucuslar'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Uçuşlar ({reservation.flights?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('biletler')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailTab === 'biletler'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Biletler ({reservation.tickets?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('odeme')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailTab === 'odeme'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Ödeme
                  </button>
                </nav>
              </div>

              {/* Tab İçerikleri */}
              <div className="p-6">
                {activeDetailTab === 'genel' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Rezervasyon Bilgileri</h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Bilet No</dt>
                            <dd className="text-sm text-gray-900">{reservation.tickets?.[0]?.ticketNumber || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Müşteri Adı</dt>
                            <dd className="text-sm text-gray-900">{reservation.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Rezervasyon Tarihi</dt>
                            <dd className="text-sm text-gray-900">{formatDate(reservation.orderDate)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Geçerlilik Tarihi</dt>
                            <dd className="text-sm text-gray-900">{reservation.validUntil ? formatDate(reservation.validUntil) : '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Rezervasyon Türü</dt>
                            <dd className="text-sm text-gray-900">{reservation.bookingType === 'book' ? 'Bilet' : 'Rezervasyon'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Seyahat Türü</dt>
                            <dd className="text-sm text-gray-900">{reservation.tripType === 'oneWay' ? 'Tek Yön' : 'Gidiş-Dönüş'}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">İletişim Bilgileri</h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                            <dd className="text-sm text-gray-900">
                              {reservation.phoneArea && reservation.phoneNumber 
                                ? `${reservation.phoneArea} ${reservation.phoneNumber}`
                                : reservation.phoneNumber || '-'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                            <dd className="text-sm text-gray-900">{reservation.email || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Seyahat Nedeni</dt>
                            <dd className="text-sm text-gray-900">{getOrderReasonText(reservation.orderReason || 'none')}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Not</dt>
                            <dd className="text-sm text-gray-900">{reservation.note || '-'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Acente Bilgileri */}
                    {reservation.agency && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Acente Bilgileri</h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Acente Adı</dt>
                            <dd className="text-sm text-gray-900">{reservation.agency.companyName}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Adres</dt>
                            <dd className="text-sm text-gray-900">{reservation.agency.address}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Vergi No</dt>
                            <dd className="text-sm text-gray-900">{reservation.agency.taxNo}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Vergi Dairesi</dt>
                            <dd className="text-sm text-gray-900">{reservation.agency.taxOffice}</dd>
                          </div>
                        </dl>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Yolcu Sayıları</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{reservation.adultCount}</div>
                          <div className="text-sm text-gray-500">Yetişkin</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{reservation.childCount}</div>
                          <div className="text-sm text-gray-500">Çocuk</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{reservation.infantCount}</div>
                          <div className="text-sm text-gray-500">Bebek</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{reservation.studentCount}</div>
                          <div className="text-sm text-gray-500">Öğrenci</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{reservation.militaryCount}</div>
                          <div className="text-sm text-gray-500">Asker</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'yolcular' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yolcu Listesi</h3>
                    <div className="space-y-4">
                      {reservation.passengers?.map((passenger, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {passenger.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {passenger.ticketType}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Koltuk: {passenger.seat}</p>
                              <p className="text-sm text-gray-500">Bagaj: {passenger.baggage}</p>
                              {passenger.extraBaggage && (
                                <div className="mt-1">
                                  <p className="text-xs text-blue-600 font-medium">
                                    +{passenger.extraBaggage.value} {passenger.extraBaggage.unit} 
                                    ({passenger.extraBaggage.currency} {passenger.extraBaggage.price.toFixed(2)})
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'ucuslar' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Uçuş Bilgileri</h3>
                    <div className="space-y-4">
                      {reservation.flights?.map((flight, index) => (
                        <div key={flight.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{flight.airlineName}</h4>
                                <p className="text-sm text-gray-500">Uçuş: {flight.flightNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {flight.currency} {flight.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">{flight.duration}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Kalkış</p>
                              <p className="text-lg font-medium text-gray-900">{flight.origin}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(flight.departureTime).toLocaleString('tr-TR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Varış</p>
                              <p className="text-lg font-medium text-gray-900">{flight.destination}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(flight.arrivalTime).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Bagaj: {flight.baggage}</span>
                              <span className="text-gray-500">
                                {flight.direct ? 'Direkt Uçuş' : 'Aktarmalı'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'biletler' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bilet Detayları</h3>
                    <div className="space-y-4">
                      {reservation.tickets?.map((ticket, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Bilet No: {ticket.ticketNumber}
                              </h4>
                              <p className="text-sm text-gray-500">Yolcu: {ticket.passengerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {ticket.currency} {ticket.price.toFixed(2)}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.status === 'confirmed' ? 'Onaylandı' : ticket.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-500">Uçuş No</p>
                              <p className="text-gray-900">{ticket.flightNumber}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Koltuk</p>
                              <p className="text-gray-900">{ticket.seat}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Kalkış</p>
                              <p className="text-gray-900">{ticket.origin}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Varış</p>
                              <p className="text-gray-900">{ticket.destination}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Kalkış Zamanı</p>
                              <p className="text-gray-900">{formatDate(ticket.departureTime)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">PNR</p>
                              <p className="text-gray-900">{ticket.pnr}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Havayolu Kuralları */}
                    {reservation.airRules && reservation.airRules.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Havayolu Kuralları</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <ul className="space-y-2">
                            {reservation.airRules.map((rule, index) => (
                              <li key={index} className="text-sm">
                                <span className="font-semibold text-green-800">{rule.title}:</span> {rule.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Fare Detayları */}
                    {reservation.fareId && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Tarife Detayları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-500">Tarife ID</p>
                            <p className="text-gray-900">{reservation.fareId}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">Kabin Sınıfı</p>
                            <p className="text-gray-900">{reservation.cabinClass}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">Rezervasyon Sınıfı</p>
                            <p className="text-gray-900">{reservation.bookingClass}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">Tarife Tipi</p>
                            <p className="text-gray-900">{reservation.fareType}</p>
                          </div>
                          {reservation.fareRules && (
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-500 mb-2">Tarife Kuralları</p>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700"><span className="font-medium">İptal:</span> {reservation.fareRules.cancellation}</p>
                                <p className="text-sm text-gray-700"><span className="font-medium">Değişiklik:</span> {reservation.fareRules.change}</p>
                                <p className="text-sm text-gray-700"><span className="font-medium">İade:</span> {reservation.fareRules.refund}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeDetailTab === 'odeme' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Ödeme Detayları</h4>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Ödeme Türü</dt>
                            <dd className="text-sm text-gray-900">{getPaymentTypeText(reservation.paymentType || '')}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Ödeme Yöntemi</dt>
                            <dd className="text-sm text-gray-900">{reservation.paymentMethod || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Toplam Tutar</dt>
                            <dd className="text-lg font-semibold text-gray-900">
                              {reservation.totalAmount ? `${reservation.currency || '€'}${reservation.totalAmount.toFixed(2)}` : '-'}
                            </dd>
                          </div>
                          {reservation.totalExtraBaggagePrice && reservation.totalExtraBaggagePrice > 0 && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Ekstra Bagaj</dt>
                              <dd className="text-sm text-blue-600">
                                {reservation.currency || '€'}{reservation.totalExtraBaggagePrice.toFixed(2)}
                              </dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Acente Komisyonu</dt>
                            <dd className="text-sm text-gray-900">
                              {reservation.agencyCommission ? `${reservation.agencyCommission}%` : '-'}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Fatura Bilgileri</h4>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Fatura Tercihi</dt>
                            <dd className="text-sm text-gray-900">
                              {reservation.invoicePreference === 'toAgency' ? 'Acenteye' :
                               reservation.invoicePreference === 'toCustomer' ? 'Müşteriye' :
                               reservation.invoicePreference === 'none' ? 'Fatura Yok' : '-'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* İptal Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Rezervasyon İptali</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Bu rezervasyonu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İptal Sebebi *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="İptal sebebini belirtin..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Dikkat:</strong> İptal işlemi sonrasında müşteriye otomatik iade yapılacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isProcessing}
              >
                İptal
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing || !cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'İşleniyor...' : 'Rezervasyonu İptal Et'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İade Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Manuel İade İşlemi</h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Müşteriye manuel iade işlemi yapmak istediğinizden emin misiniz?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İade Tutarı *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={reservation.totalAmount || 0}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{reservation.currency || '€'}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimum iade tutarı: {reservation.currency || '€'}{reservation.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Bu işlem müşterinin ödeme yöntemine göre iade yapacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isProcessing}
              >
                İptal
              </button>
              <button
                onClick={handleRefund}
                disabled={isProcessing || refundAmount <= 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'İşleniyor...' : 'İade Yap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 