'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ReservationList from '../components/reservations/ReservationList'
import ReservationFilters from '../components/reservations/ReservationFilters'

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

export default function RezervasyonlarPage() {
  const [activeTab, setActiveTab] = useState('rezervasyonlar')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Ana site bilgilerine göre örnek rezervasyon verileri
  const [reservations] = useState<Reservation[]>([
    {
      id: '1',
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
      // Fare detayları
      fareId: 'demo-fare-id-12345',
      cabinClass: 'Economy',
      bookingClass: 'Y',
      fareType: 'Public',
      duration: '2s 20d',
      direct: true,
      // Ekstra bagaj bilgileri
      totalExtraBaggagePrice: 70.00
    },
    {
      id: '2',
      name: 'Mehmet Demir',
      orderType: 'corporate',
      status: 'preparing',
      orderDate: '2024-07-19T10:15:00.000Z',
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      studentCount: 0,
      militaryCount: 0,
      phoneNumber: '5559876543',
      phoneArea: '+90',
      email: 'mehmet.demir@company.com',
      totalAmount: 89.99,
      orderReason: 'business',
      paymentType: 'creditCard',
      paymentMethod: 'threeD',
      agencyCommission: 5,
      invoicePreference: 'toCustomer',
      note: 'İş seyahati',
      validUntil: '2024-07-21T10:15:00.000Z',
      currency: 'EUR',
      bookingType: 'book',
      tripType: 'oneWay',
      contactInfo: {
        firstName: 'Mehmet',
        lastName: 'Demir',
        email: 'mehmet.demir@company.com',
        phone: '+90 555 987 6543'
      },
      passengers: [
        {
          name: 'Mehmet Demir',
          seat: '15F',
          baggage: '25kg',
          ticketType: 'Ekonomi'
        }
      ],
      flights: [
        {
          id: 'flight-3',
          airlineName: 'SunExpress',
          flightNumber: 'XQ456',
          origin: 'IST',
          destination: 'ADB',
          departureTime: '2024-08-10T08:30:00',
          arrivalTime: '2024-08-10T09:45:00',
          duration: '1s 15d',
          price: 89.99,
          currency: 'EUR',
          direct: true,
          baggage: '25 kg'
        }
      ],
      // Ana site ekstra bilgileri
      agency: {
        agencyId: 'demo-agency-id-2',
        companyName: 'KURUMSAL SEYAHAT',
        address: 'Ankara, Türkiye',
        taxNo: '9876543210',
        taxOffice: 'ANKARA',
      },
      tickets: [
        {
          ticketNumber: 'DEMO-TKT-2001',
          passengerName: 'Mehmet Demir',
          pnr: 'DEMO789012',
          flightNumber: 'XQ456',
          origin: 'IST',
          destination: 'ADB',
          departureTime: '2024-08-10T08:30:00',
          seat: '15F',
          price: 89.99,
          currency: 'EUR',
          status: 'confirmed'
        }
      ],
      // Fare detayları
      fareId: 'demo-fare-id-67890',
      cabinClass: 'Economy',
      bookingClass: 'Y',
      fareType: 'Corporate',
      duration: '1s 15d',
      direct: true
    },
    {
      id: '3',
      name: 'Ayşe Kaya',
      orderType: 'individual',
      status: 'completed',
      orderDate: '2024-07-18T14:45:00.000Z',
      adultCount: 3,
      childCount: 0,
      infantCount: 0,
      studentCount: 0,
      militaryCount: 0,
      phoneNumber: '5554567890',
      phoneArea: '+90',
      email: 'ayse.kaya@example.com',
      totalAmount: 245.75,
      orderReason: 'vacation',
      paymentType: 'creditCard',
      paymentMethod: 'threeD',
      agencyCommission: 0,
      invoicePreference: 'toAgency',
      note: 'Aile tatili',
      validUntil: '2024-07-20T14:45:00.000Z',
      currency: 'EUR',
      bookingType: 'book',
      tripType: 'roundTrip',
      contactInfo: {
        firstName: 'Ayşe',
        lastName: 'Kaya',
        email: 'ayse.kaya@example.com',
        phone: '+90 555 456 7890'
      },
      passengers: [
        {
          name: 'Ayşe Kaya',
          seat: '8A',
          baggage: '20kg',
          ticketType: 'Ekonomi'
        },
        {
          name: 'Hasan Kaya',
          seat: '8B',
          baggage: '20kg',
          ticketType: 'Ekonomi'
        },
        {
          name: 'Elif Kaya',
          seat: '8C',
          baggage: '20kg',
          ticketType: 'Ekonomi'
        }
      ],
      flights: [
        {
          id: 'flight-4',
          airlineName: 'Turkish Airlines',
          flightNumber: 'TK789',
          origin: 'IST',
          destination: 'AYT',
          departureTime: '2024-08-05T06:00:00',
          arrivalTime: '2024-08-05T07:15:00',
          duration: '1s 15d',
          price: 125.25,
          currency: 'EUR',
          direct: true,
          baggage: '20 kg'
        },
        {
          id: 'flight-5',
          airlineName: 'Turkish Airlines',
          flightNumber: 'TK790',
          origin: 'AYT',
          destination: 'IST',
          departureTime: '2024-08-12T20:30:00',
          arrivalTime: '2024-08-12T21:45:00',
          duration: '1s 15d',
          price: 120.50,
          currency: 'EUR',
          direct: true,
          baggage: '20 kg'
        }
      ],
      // Ana site ekstra bilgileri
      agency: {
        agencyId: 'demo-agency-id-3',
        companyName: 'TATİL SEYAHAT',
        address: 'Antalya, Türkiye',
        taxNo: '5556667778',
        taxOffice: 'ANTALYA',
      },
      tickets: [
        {
          ticketNumber: 'DEMO-TKT-3001',
          passengerName: 'Ayşe Kaya',
          pnr: 'DEMO345678',
          flightNumber: 'TK789',
          origin: 'IST',
          destination: 'AYT',
          departureTime: '2024-08-05T06:00:00',
          seat: '8A',
          price: 125.25,
          currency: 'EUR',
          status: 'confirmed'
        },
        {
          ticketNumber: 'DEMO-TKT-3002',
          passengerName: 'Hasan Kaya',
          pnr: 'DEMO345678',
          flightNumber: 'TK789',
          origin: 'IST',
          destination: 'AYT',
          departureTime: '2024-08-05T06:00:00',
          seat: '8B',
          price: 125.25,
          currency: 'EUR',
          status: 'confirmed'
        },
        {
          ticketNumber: 'DEMO-TKT-3003',
          passengerName: 'Elif Kaya',
          pnr: 'DEMO345678',
          flightNumber: 'TK789',
          origin: 'IST',
          destination: 'AYT',
          departureTime: '2024-08-05T06:00:00',
          seat: '8C',
          price: 125.25,
          currency: 'EUR',
          status: 'confirmed'
        }
      ],
      // Fare detayları
      fareId: 'demo-fare-id-11111',
      cabinClass: 'Economy',
      bookingClass: 'Y',
      fareType: 'Public',
      duration: '1s 15d',
      direct: true
    }
  ])

  // Filtreleme fonksiyonu
  const filteredReservations = reservations.filter(reservation => {
    const matchesFilter = activeFilter === 'all' || reservation.status === activeFilter
    
    const fullPhoneNumber = reservation.phoneArea && reservation.phoneNumber 
      ? `${reservation.phoneArea} ${reservation.phoneNumber}`
      : reservation.phoneNumber || ''
    
    const matchesSearch = reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fullPhoneNumber.includes(searchTerm) ||
                         reservation.tickets?.some(ticket => 
                           ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         reservation.flights?.some(flight => 
                           flight.airlineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    return matchesFilter && matchesSearch
  })

  // Event handlers
  const handleStatusChange = (id: string, status: string) => {
    // Bilet Dükkanı API'ye durum güncelleme isteği gönder
    console.log('Rezervasyon durumu güncellendi:', id, status)
    // TODO: API call to update reservation status
  }

  const handleViewDetails = (id: string) => {
    window.location.href = `/rezervasyonlar/${id}`
  }

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Filtreler */}
          <ReservationFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Rezervasyon Listesi */}
          <div className="mt-3">
            <ReservationList
              reservations={filteredReservations}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Boş Durum */}
          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="admin-text-sm mb-2">Rezervasyon Bulunamadı</h3>
              <p className="admin-text-xs">
                {searchTerm || activeFilter !== 'all' 
                  ? 'Arama kriterlerinize uygun rezervasyon bulunamadı.'
                  : 'Henüz rezervasyon bulunmuyor.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}