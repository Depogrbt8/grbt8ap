'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { User, Calendar, Clock, Edit, Save, CreditCard, X, Mail, Phone, MapPin, ChevronDown, ChevronUp, Home, Building, Plane, MessageSquare } from 'lucide-react'

interface User {
  id: string
  name: string
  customerNo: string
  email: string
  phone: string
  status: string
  city: string
  address: string
  joinDate: string
  lastLogin: string
  role?: string
  isForeigner?: string
  emailVerified?: string
  passengerCount?: number
  alertCount?: number
  favoriteCount?: number
  reservationCount?: number
  paymentCount?: number
  firstName?: string
  lastName?: string
  birthDay?: string
  birthMonth?: string
  birthYear?: string
  gender?: string
  identityNumber?: string
  countryCode?: string
}

export default function KullaniciDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [surveyResponse, setSurveyResponse] = useState<any[]>([])
  const [showAddresses, setShowAddresses] = useState(false)
  const [billingInfos, setBillingInfos] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showPriceAlerts, setShowPriceAlerts] = useState(false)
  const [priceAlerts, setPriceAlerts] = useState<any[]>([])
  const [loadingPriceAlerts, setLoadingPriceAlerts] = useState(false)
  const [favoriteSearches, setFavoriteSearches] = useState<any[]>([])
  const [hotelFavorites, setHotelFavorites] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [hotelReservations, setHotelReservations] = useState<any[]>([])
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [loadingHotelReservations, setLoadingHotelReservations] = useState(false)
  const [reservationFilter, setReservationFilter] = useState<'all' | 'flight' | 'hotel'>('all')
  // Inline tab and passengers panel (non-navigating UI)
  const [activeInlineTab, setActiveInlineTab] = useState<'none' | 'passengers' | 'reservations'>('reservations')
  const [passengers, setPassengers] = useState<any[]>([])
  const [loadingPassengers, setLoadingPassengers] = useState(false)
  const [showPassengerModal, setShowPassengerModal] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<any | null>(null)
  const [savingPassenger, setSavingPassenger] = useState(false)
  const [showPassengers, setShowPassengers] = useState(false)
  // Inline payments-style tabs state and mock data (same structure as Ödemeler sayfası)
  const [paymentsInlineTab, setPaymentsInlineTab] = useState<'rezervasyonlar' | 'odemeler' | 'iadeler'>('rezervasyonlar')
  // Yorumlar state
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState('')
  const [savingComments, setSavingComments] = useState(false)
  // Feature flag: sayfanın en altındaki inline Rezervasyonlar kartını gizle
  const HIDE_BOTTOM_RESERVATIONS_SECTION = true
  const balances = [
    {
      id: '1',
      agencyId: 'agency-1',
      agencyName: 'DEMO SEYAHAT',
      amount: 5000.0,
      currency: 'EUR',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      description: 'Başlangıç bakiyesi'
    },
    {
      id: '2',
      agencyId: 'agency-2',
      agencyName: 'TEST ACENTE',
      amount: 2500.0,
      currency: 'EUR',
      status: 'active',
      createdAt: '2024-01-10T14:20:00Z',
      description: 'Test bakiyesi'
    }
  ] as any[]
  const refunds = [
    {
      id: 'refund-1',
      orderId: 'order-123',
      agencyId: 'agency-1',
      agencyName: 'DEMO SEYAHAT',
      customerName: 'Ahmet Yılmaz',
      amount: 150.0,
      currency: 'EUR',
      reason: 'Müşteri talebi - İptal',
      status: 'pending',
      createdAt: '2024-01-20T09:15:00Z'
    },
    {
      id: 'refund-2',
      orderId: 'order-456',
      agencyId: 'agency-2',
      agencyName: 'TEST ACENTE',
      customerName: 'Fatma Demir',
      amount: 75.5,
      currency: 'EUR',
      reason: 'Uçuş iptali',
      status: 'approved',
      createdAt: '2024-01-18T14:30:00Z',
      processedAt: '2024-01-19T10:00:00Z',
      processedBy: 'admin@demo.com'
    }
  ] as any[]

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+90',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    identityNumber: '',
    status: 'Aktif',
    role: 'Kullanıcı',
    address: '',
    city: '',
    isForeigner: false
  })

  useEffect(() => {
    fetchUser()
    fetchSurveyResponse()
    fetchHotelReservations()
  }, [params.id])

  const fetchHotelReservations = async () => {
    if (!params.id) return
    try {
      setLoadingHotelReservations(true)
      const response = await fetch(`/api/hotels/bookings?userId=${params.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // data.data düz dizi veya { bookings: [...] } olabilir
        const bookingsList = Array.isArray(data.data) 
          ? data.data 
          : Array.isArray(data.data?.bookings) 
            ? data.data.bookings 
            : []
        setHotelReservations(bookingsList)
      } else {
        setHotelReservations([])
      }
    } catch (error) {
      console.error('Otel rezervasyonları yüklenirken hata:', error)
      setHotelReservations([])
    } finally {
      setLoadingHotelReservations(false)
    }
  }

  const fetchBillingInfos = async () => {
    if (!params.id) return
    
    try {
      setLoadingAddresses(true)
      const response = await fetch(`/api/billing-info?userId=${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setBillingInfos(data.data || [])
      } else {
        console.log('Fatura bilgileri bulunamadı')
        setBillingInfos([])
      }
    } catch (error) {
      console.error('Fatura bilgileri yüklenirken hata:', error)
      setBillingInfos([])
    } finally {
      setLoadingAddresses(false)
    }
  }

  const toggleAddresses = () => {
    setShowAddresses(!showAddresses)
    if (!showAddresses && billingInfos.length === 0) {
      fetchBillingInfos()
    }
  }

  const fetchPriceAlerts = async () => {
    if (!params.id) return
    
    try {
      setLoadingPriceAlerts(true)
      const response = await fetch(`/api/users/${params.id}`)
      const data = await response.json()
      
      if (data.success && data.priceAlerts) {
        setPriceAlerts(data.priceAlerts || [])
      } else {
        console.log('Fiyat alarmı bilgileri bulunamadı')
        setPriceAlerts([])
      }
    } catch (error) {
      console.error('Fiyat alarmı bilgileri yüklenirken hata:', error)
      setPriceAlerts([])
    } finally {
      setLoadingPriceAlerts(false)
    }
  }

  const togglePriceAlerts = () => {
    setShowPriceAlerts(!showPriceAlerts)
    if (!showPriceAlerts && priceAlerts.length === 0) {
      fetchPriceAlerts()
    }
  }

  // Inline passengers fetcher
  const fetchPassengers = async () => {
    if (!params.id) return
    try {
      setLoadingPassengers(true)
      const res = await fetch(`/api/passengers?userId=${String(params.id)}`)
      const data = await res.json()
      if (data?.success) {
        setPassengers(data.data || [])
      } else {
        setPassengers([])
      }
    } catch (e) {
      console.error('Yolcu listesi alınamadı:', e)
      setPassengers([])
    } finally {
      setLoadingPassengers(false)
    }
  }

  const openPassengerModal = async (passengerId: string) => {
    try {
      setSelectedPassenger(null)
      const res = await fetch(`/api/passengers/${passengerId}`)
      const data = await res.json()
      if (data?.success) {
        setSelectedPassenger(data.data)
        setShowPassengerModal(true)
      }
    } catch (e) {
      console.error('Yolcu detay alınamadı:', e)
    }
  }

  const handlePassengerSave = async () => {
    if (!selectedPassenger?.id) return
    try {
      setSavingPassenger(true)
      const res = await fetch(`/api/passengers/${selectedPassenger.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: selectedPassenger.firstName,
          lastName: selectedPassenger.lastName,
          phone: selectedPassenger.phone,
          countryCode: selectedPassenger.countryCode,
          identityNumber: selectedPassenger.identityNumber,
          birthDay: selectedPassenger.birthDay,
          birthMonth: selectedPassenger.birthMonth,
          birthYear: selectedPassenger.birthYear,
          gender: selectedPassenger.gender,
          isForeigner: selectedPassenger.isForeigner,
        })
      })
      const data = await res.json()
      if (data?.success) {
        // listeyi tazele
        await fetchPassengers()
        setShowPassengerModal(false)
      }
    } catch (e) {
      console.error('Yolcu güncellenemedi:', e)
    } finally {
      setSavingPassenger(false)
    }
  }

  const handleSaveComments = async () => {
    if (!params.id) return
    try {
      setSavingComments(true)
      console.log('💾 Yorumlar kaydediliyor:', comments)
      const res = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      })
      const data = await res.json()
      if (data?.success) {
        alert('Yorumlar başarıyla kaydedildi!')
      }
    } catch (e) {
      console.error('Yorumlar kaydedilemedi:', e)
      alert('Yorumlar kaydedilirken hata oluştu')
    } finally {
      setSavingComments(false)
    }
  }

  const togglePassengers = async () => {
    const next = !showPassengers
    setShowPassengers(next)
    if (next && passengers.length === 0) {
      await fetchPassengers()
    }
  }

  const fetchSurveyResponse = async () => {
    try {
      // Kendi API'mizden bu kullanıcının anket cevaplarını çek
      const response = await fetch(`/api/surveys/user/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSurveyResponse(data.data)
        } else {
          // Anket cevabı yok
          setSurveyResponse([])
        }
      } else {
        // API hatası - anket cevabı yok
        setSurveyResponse([])
      }
    } catch (error) {
      console.error('Anket verisi alınamadı:', error)
      // Hata durumunda anket cevabı yok
      setSurveyResponse([])
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setUser(data.data)
        setReservations(data.reservations || [])
        setComments(data.data.comments || '')
        // Form verilerini doldur
        setFormData({
          firstName: data.data.firstName || data.data.name?.split(' ')[0] || '',
          lastName: data.data.lastName || data.data.name?.split(' ')[1] || '',
          email: data.data.email,
          phone: data.data.phone.replace(/^\+90\s?/, '') || '',
          countryCode: data.data.countryCode || '+90',
          birthDay: data.data.birthDay || '',
          birthMonth: data.data.birthMonth || '',
          birthYear: data.data.birthYear || '',
          gender: data.data.gender || '',
          identityNumber: data.data.identityNumber || '',
          status: data.data.status,
          role: data.data.role || 'Kullanıcı',
          address: data.data.address || '',
          city: data.data.city || '',
          isForeigner: data.data.isForeigner || false
        })
        // Fiyat alarmları ve favori aramalar
        setPriceAlerts(data.priceAlerts || [])
        setFavoriteSearches(data.searchFavorites || [])
        
        // Detaylı API response log'u
        console.log('[Frontend] ========== API RESPONSE START ==========')
        console.log('[Frontend] Full API Response:', JSON.stringify(data, null, 2))
        console.log('[Frontend] data.hotelFavorites:', data.hotelFavorites)
        console.log('[Frontend] data.hotelFavorites type:', typeof data.hotelFavorites)
        console.log('[Frontend] data.hotelFavorites isArray:', Array.isArray(data.hotelFavorites))
        console.log('[Frontend] data.hotelFavorites length:', data.hotelFavorites?.length)
        console.log('[Frontend] User ID:', params.id)
        console.log('[Frontend] ========== API RESPONSE END ==========')
        
        const favs = Array.isArray(data.hotelFavorites) ? data.hotelFavorites : []
        console.log('[Frontend] Setting hotelFavorites:', favs)
        setHotelFavorites(favs)
      } else {
        setError(data.error || 'Kullanıcı bulunamadı')
      }
    } catch (err) {
      setError('Kullanıcı yüklenirken hata oluştu')
      console.error('Kullanıcı yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          countryCode: formData.countryCode,
          birthDay: formData.birthDay,
          birthMonth: formData.birthMonth,
          birthYear: formData.birthYear,
          gender: formData.gender,
          identityNumber: formData.identityNumber,
          status: formData.status,
          role: formData.role,
          city: formData.city,
          address: formData.address,
          isForeigner: formData.isForeigner
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Kullanıcı başarıyla güncellendi!')
        // Kullanıcı verilerini yenile
        await fetchUser()
      } else {
        setError(data.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      setError('Güncelleme sırasında hata oluştu')
      console.error('Güncelleme hatası:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-red-600 text-xl mb-4">⚠️ Hata</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => router.push('/kullanici')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Kullanıcı Listesine Dön
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto">
            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Hesap Bilgileri - Başta */}
                <div>
                  <h3 className="text-xs font-medium text-gray-900 mb-2">Hesap Bilgileri</h3>
                  <div className="flex">
                    <div className="p-2 bg-gray-50 rounded-l-md border-r border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Numara</p>
                      <p className="text-xs text-gray-500">{user?.customerNo}</p>
                    </div>
                    <div className="p-2 bg-gray-50 border-r border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Durum</p>
                      <p className="text-xs text-gray-500">{user?.status}</p>
                    </div>
                    <div className="p-2 bg-gray-50 border-r border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Rol</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Kullanıcı'}</p>
                    </div>
                    <div className="p-2 bg-gray-50 border-r border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Kayıt Tarihi</p>
                      <p className="text-xs text-gray-500">{user?.joinDate}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-r-md">
                      <p className="text-sm font-medium text-gray-900">Son Giriş</p>
                      <p className="text-xs text-gray-500">{user?.lastLogin}</p>
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div>
                  <h3 className="text-xs font-medium text-gray-900 mb-2">İstatistikler</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div 
                      className="hidden text-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={async () => {
                        setActiveInlineTab('passengers')
                        setShowPassengers(true)
                        await fetchPassengers()
                        setTimeout(() => {
                          const el = document.getElementById('section-passengers')
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 0)
                      }}
                    >
                      <div className="text-lg font-bold text-blue-600">{user?.passengerCount || 0}</div>
                      <div className="text-xs text-gray-600">Yolcu</div>
                    </div>
                    <div className="hidden text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{user?.alertCount || 0}</div>
                      <div className="text-xs text-gray-600">Fiyat Alarmı</div>
                    </div>
                    <div className="hidden text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{user?.favoriteCount || 0}</div>
                      <div className="text-xs text-gray-600">Favori Arama</div>
                    </div>
                    <div 
                      className="text-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => setActiveInlineTab('reservations')}
                    >
                      <div className="text-lg font-bold text-purple-600">{user?.reservationCount || 0}</div>
                      <div className="text-xs text-gray-600">Rezervasyon</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{user?.paymentCount || 0}</div>
                      <div className="text-xs text-gray-600">Ödeme</div>
                    </div>
                  </div>
                </div>

                {/* Kullanıcı Bilgileri */}
                <div>
                  <h3 className="text-xs font-medium text-gray-900 mb-2">Kullanıcı Bilgileri</h3>
                  
                  {/* Hata/Success Mesajları */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-6 gap-2 mb-3">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Ad"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Soyad"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="TC Kimlik No"
                        value={formData.identityNumber}
                        onChange={(e) => handleInputChange('identityNumber', e.target.value)}
                        maxLength={11}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select 
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Cinsiyet</option>
                        <option value="male">Erkek</option>
                        <option value="female">Kadın</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="date" 
                        value={formData.birthYear && formData.birthMonth && formData.birthDay ? 
                          `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value)
                          handleInputChange('birthDay', date.getDate().toString())
                          handleInputChange('birthMonth', (date.getMonth() + 1).toString())
                          handleInputChange('birthYear', date.getFullYear().toString())
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-28">
                      <select 
                        value={formData.countryCode}
                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="+90">🇹🇷 TR (+90)</option>
                        <option value="+49">🇩🇪 DE (+49)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+33">🇫🇷 FR (+33)</option>
                        <option value="+32">🇧🇪 BE (+32)</option>
                        <option value="+31">🇳🇱 NL (+31)</option>
                        <option value="+43">🇦🇹 AT (+43)</option>
                        <option value="+41">🇨🇭 CH (+41)</option>
                      </select>
                    </div>
                    <div className="w-36">
                      <input 
                        type="tel" 
                        placeholder="Telefon"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-36">
                      <input 
                        type="text" 
                        placeholder="Şehir"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Adres"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.isForeigner}
                        onChange={(e) => handleInputChange('isForeigner', e.target.checked.toString())}
                        className="mr-2"
                      />
                      <label className="text-xs text-gray-600">Yabancı Uyruklu</label>
                    </div>
                  </div>
                </div>

                

                {/* İşlemler */}
                <div>
                  <h3 className="text-xs font-medium text-gray-900 mb-2">İşlemler</h3>
                  {/* Ödemeler sayfasındaki yapı - inline kart */}
                  <div className="admin-card">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8 px-6">
                        <button
                          onClick={() => setPaymentsInlineTab('rezervasyonlar')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            paymentsInlineTab === 'rezervasyonlar'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Rezervasyonlar ({reservations.length + hotelReservations.length})
                        </button>
                        <button
                          onClick={() => setPaymentsInlineTab('odemeler')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            paymentsInlineTab === 'odemeler'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Ödemeler ({billingInfos.length})
                        </button>
                        <button
                          onClick={() => setPaymentsInlineTab('iadeler')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            paymentsInlineTab === 'iadeler'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          İadeler ({refunds.length})
                        </button>
                      </nav>
                    </div>

                    <div className="p-6">
                      {paymentsInlineTab === 'rezervasyonlar' && (
                        <>
                          {/* Filtreleme Butonları */}
                          <div className="flex gap-2 mb-4">
                            <button
                              onClick={() => setReservationFilter('all')}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                reservationFilter === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Tümü ({reservations.length + hotelReservations.length})
                            </button>
                            <button
                              onClick={() => setReservationFilter('flight')}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                reservationFilter === 'flight'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Uçuş ({reservations.length})
                            </button>
                            <button
                              onClick={() => setReservationFilter('hotel')}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                reservationFilter === 'hotel'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Otel ({hotelReservations.length})
                            </button>
                          </div>

                          {(loadingReservations || loadingHotelReservations) ? (
                            <div className="admin-text-xs text-gray-500">Yükleniyor...</div>
                          ) : (
                            <>
                              {/* Uçuş Rezervasyonları */}
                              {(reservationFilter === 'all' || reservationFilter === 'flight') && reservations.length > 0 && (
                                <div className="w-full mb-4">
                                  <div className="text-xs font-medium text-gray-700 mb-2">Uçuş Rezervasyonları</div>
                                  <div className="grid grid-cols-7 text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded-t-lg">
                                    <div>Bilet</div>
                                    <div>Tarih</div>
                                    <div>Yolcu</div>
                                    <div>Tutar</div>
                                    <div>Seyahat</div>
                                    <div>Durum</div>
                                    <div className="text-right">Aksiyon</div>
                                  </div>
                                  <div className="divide-y divide-gray-200 bg-white rounded-b-lg border">
                                    {reservations.map((r: any) => {
                                      const tarih = r.departureTime ? new Date(r.departureTime) : null
                                      const yolcuSayisi = r.passengers ? (() => { try { const arr = JSON.parse(r.passengers); return Array.isArray(arr) ? arr.length : '-' } catch { return '-' } })() : '-'
                                      const seyahat = r.origin && r.destination ? `${r.origin}-${r.destination}` : (r.flightNumber || '-')
                                      const tutar = r.amount ? `${r.amount} ${r.currency || ''}` : '-'
                                      const pnr = r.pnr || (r.id ? r.id.slice(-8).toUpperCase() : '-')
                                      const badge = (s: string) => {
                                        const base = 'px-2 py-0.5 rounded text-xs'
                                        if (!s) return <span className={`${base} bg-gray-100 text-gray-600`}>Bilinmiyor</span>
                                        const map: Record<string,string> = {
                                          ready: 'bg-green-100 text-green-700',
                                          confirmed: 'bg-green-100 text-green-700',
                                          pending: 'bg-yellow-100 text-yellow-700',
                                          processing: 'bg-yellow-100 text-yellow-700',
                                          cancelled: 'bg-red-100 text-red-700',
                                          completed: 'bg-blue-100 text-blue-700',
                                        }
                                        const cls = map[s] || 'bg-gray-100 text-gray-700'
                                        return <span className={`${base} ${cls}`}>{s}</span>
                                      }
                                      return (
                                        <div key={r.id} className="grid grid-cols-7 items-center px-3 py-3">
                                          <div className="font-medium text-gray-900">{pnr}</div>
                                          <div className="text-gray-700">{tarih ? tarih.toLocaleDateString('tr-TR') : '-'}</div>
                                          <div className="text-gray-700">{yolcuSayisi}</div>
                                          <div className="text-gray-900 font-medium">{tutar}</div>
                                          <div className="text-gray-700">{seyahat}</div>
                                          <div>{badge(r.status)}</div>
                                          <div className="text-right">
                                            <button 
                                              onClick={() => router.push(`/rezervasyonlar/${r.id}`)}
                                              className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                              Görüntüle
                                            </button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Otel Rezervasyonları */}
                              {(reservationFilter === 'all' || reservationFilter === 'hotel') && hotelReservations.length > 0 && (
                                <div className="w-full overflow-x-auto">
                                  <div className="text-sm font-medium text-gray-900 mb-2">Otel Rezervasyonları</div>
                                  <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rezervasyon No</th>
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Otel</th>
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Müşteri</th>
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tarihler</th>
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tutar</th>
                                        <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Durum</th>
                                        <th className="text-right py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">İşlemler</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                    {hotelReservations.map((r: any) => {
                                      const checkIn = r.checkIn ? new Date(r.checkIn) : null
                                      const checkOut = r.checkOut ? new Date(r.checkOut) : null
                                      const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
                                      const dateStr = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                                      const guestsParsed = r.guests ? (() => { try { const g = typeof r.guests === 'string' ? JSON.parse(r.guests) : r.guests; return { adults: g.adults || 0, children: g.children || 0 } } catch { return { adults: 0, children: 0 } } })() : { adults: 0, children: 0 }
                                      const guests = `${guestsParsed.adults} Yetişkin${guestsParsed.children ? `, ${guestsParsed.children} Çocuk` : ''}`
                                      const guestDetailsList = (() => {
                                        try {
                                          if (!r.guestDetails) return []
                                          const p = typeof r.guestDetails === 'string' ? JSON.parse(r.guestDetails) : r.guestDetails
                                          return Array.isArray(p) ? p : []
                                        } catch { return [] }
                                      })()
                                      const guestInfo = (() => {
                                        try {
                                          if (!r.guestInfo) return { firstName: '', lastName: '' }
                                          const p = typeof r.guestInfo === 'string' ? JSON.parse(r.guestInfo) : r.guestInfo
                                          return p || { firstName: '', lastName: '' }
                                        } catch { return { firstName: '', lastName: '' } }
                                      })()
                                      const misafirAd = guestDetailsList.length > 0
                                        ? guestDetailsList.map((g: any) => [g.firstName, g.lastName].filter(Boolean).join(' ')).filter(Boolean).join(', ') || '-'
                                        : [guestInfo.firstName, guestInfo.lastName].filter(Boolean).join(' ') || '-'
                                      const tutar = r.totalPrice ? `${r.totalPrice} ${r.currency || 'EUR'}` : '-'
                                      const confirmationNumber = r.confirmationNumber || (r.id ? r.id.slice(-8).toUpperCase() : '-')
                                      const roomType = r.roomType || r.roomName || null
                                      const badge = (s: string) => {
                                        if (!s) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Bilinmiyor</span>
                                        const textMap: Record<string,string> = {
                                          pending: 'Beklemede',
                                          confirmed: 'Onaylandı',
                                          cancelled: 'İptal Edildi',
                                          completed: 'Tamamlandı',
                                        }
                                        const text = textMap[s] || s
                                        if (s === 'confirmed') {
                                          return (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                              {text}
                                            </span>
                                          )
                                        }
                                        const map: Record<string,string> = {
                                          pending: 'bg-amber-100 text-amber-800',
                                          cancelled: 'bg-red-100 text-red-700',
                                          completed: 'bg-blue-100 text-blue-700',
                                        }
                                        const cls = map[s] || 'bg-gray-100 text-gray-700'
                                        return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{text}</span>
                                      }
                                      return (
                                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                          <td className="py-3 px-3">
                                            <span className="font-semibold text-gray-900">{confirmationNumber}</span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div>
                                              <span className="font-semibold text-gray-900 block">{r.hotelName || '-'}</span>
                                              {roomType && <span className="text-xs text-gray-500 font-normal">{roomType}</span>}
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span className="font-semibold text-gray-900">{misafirAd}</span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div className="text-gray-700 text-sm space-y-0.5">
                                              {checkIn && <div>{dateStr(checkIn)}</div>}
                                              {checkOut && <div>{dateStr(checkOut)}</div>}
                                              {nights > 0 && <div className="text-gray-500">{nights} gece</div>}
                                              {!checkIn && !checkOut && <div>-</div>}
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span className="font-semibold text-gray-900">{tutar}</span>
                                          </td>
                                          <td className="py-3 px-3">{badge(r.status)}</td>
                                          <td className="py-3 px-3 text-right">
                                            <button
                                              onClick={() => router.push(`/oteller/rezervasyonlar?expand=${r.id}`)}
                                              className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
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
                              )}

                              {/* Boş Durum */}
                              {reservationFilter === 'all' && reservations.length === 0 && hotelReservations.length === 0 && (
                                <div className="admin-text-xs text-gray-500">Kayıtlı rezervasyon yok</div>
                              )}
                              {reservationFilter === 'flight' && reservations.length === 0 && (
                                <div className="admin-text-xs text-gray-500">Kayıtlı uçuş rezervasyonu yok</div>
                              )}
                              {reservationFilter === 'hotel' && hotelReservations.length === 0 && (
                                <div className="admin-text-xs text-gray-500">Kayıtlı otel rezervasyonu yok</div>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {paymentsInlineTab === 'odemeler' && (
                        <div>
                          <h3 className="admin-text-sm mb-3">Ödeme Bilgileri</h3>
                          {loadingAddresses ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-2 text-xs text-gray-500">Ödeme bilgileri yükleniyor...</p>
                            </div>
                          ) : billingInfos.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="admin-text-xs text-yellow-800">
                                    <strong>Bilgi:</strong> Henüz ödeme bilgisi eklenmemiş.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {billingInfos.map((billing: any) => (
                                <div key={billing.id} className="admin-card-small">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        {billing.type === 'corporate' ? (
                                          <Building className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <Home className="h-4 w-4 text-green-500" />
                                        )}
                                        <span className="admin-text-sm font-medium">{billing.title}</span>
                                        {billing.isDefault && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Varsayılan</span>
                                        )}
                                      </div>
                                      {billing.type === 'corporate' ? (
                                        <div className="admin-text-xs space-y-1">
                                          <p className="font-medium">{billing.companyName}</p>
                                          <p>VN: {billing.taxNumber}</p>
                                          <p>{billing.address}</p>
                                          <p>{billing.city}, {billing.country}</p>
                                        </div>
                                      ) : (
                                        <div className="admin-text-xs space-y-1">
                                          <p className="font-medium">{billing.firstName} {billing.lastName}</p>
                                          <p>{billing.address}</p>
                                          <p>{billing.city}, {billing.country}</p>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(billing.createdAt).toLocaleDateString('tr-TR')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {paymentsInlineTab === 'iadeler' && (
                        <div>
                          <h3 className="admin-text-sm mb-3">Manuel İade Yönetimi</h3>
                          <div className="space-y-4">
                            {refunds.map((refund: any) => (
                              <div key={refund.id} className="admin-card-small">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h4 className="admin-text-sm">{refund.customerName}</h4>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        refund.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : refund.status === 'approved'
                                          ? 'bg-blue-100 text-blue-800'
                                          : refund.status === 'rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {refund.status === 'pending'
                                          ? 'Beklemede'
                                          : refund.status === 'approved'
                                          ? 'Onaylandı'
                                          : refund.status === 'rejected'
                                          ? 'Reddedildi'
                                          : 'Tamamlandı'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 admin-text-xs">
                                      <div>
                                        <p><strong>Acente:</strong> {refund.agencyName}</p>
                                        <p><strong>Sipariş ID:</strong> {refund.orderId}</p>
                                        <p><strong>Sebep:</strong> {refund.reason}</p>
                                      </div>
                                      <div>
                                        <p><strong>Oluşturulma:</strong> {new Date(refund.createdAt).toLocaleString('tr-TR')}</p>
                                        {refund.processedAt && (
                                          <p><strong>İşlenme:</strong> {new Date(refund.processedAt).toLocaleString('tr-TR')}</p>
                                        )}
                                        {refund.processedBy && (
                                          <p><strong>İşleyen:</strong> {refund.processedBy}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="admin-text-lg">
                                      {refund.currency} {Number(refund.amount).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adres Bilgileri Bölümü */}
            <div className="border-t border-gray-200">
              <button
                onClick={toggleAddresses}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Fatura Adresleri</span>
                  <span className="text-xs text-gray-500">({billingInfos.length} adres)</span>
                </div>
                {showAddresses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {showAddresses && (
                <div className="px-4 pb-4">
                  {loadingAddresses ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-xs text-gray-500">Adresler yükleniyor...</p>
                    </div>
                  ) : billingInfos.length === 0 ? (
                    <div className="text-center py-4">
                      <Home className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Henüz fatura adresi eklenmemiş</p>
                      <p className="text-xs text-gray-400">Kullanıcı ana sitede adres ekleyebilir</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {billingInfos.map((billing, index) => (
                        <div key={billing.id} className="bg-gray-50 rounded-lg p-3 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                {billing.type === 'corporate' ? (
                                  <Building className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Home className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900">{billing.title}</span>
                                {billing.isDefault && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Varsayılan</span>
                                )}
                              </div>
                              
                              {billing.type === 'corporate' ? (
                                <div className="text-xs text-gray-600 space-y-1">
                             <p className="font-medium">{billing.companyName}</p>
                             <p>VN: {billing.taxNumber}</p>
                             <p>{billing.address}</p>
                             <p>{billing.city}</p>
                             <p className="text-gray-500">{billing.country}</p>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p className="font-medium">{billing.firstName} {billing.lastName}</p>
                                  <p>{billing.address}</p>
                                  <p>{billing.city}</p>
                                  <p className="text-gray-500">{billing.country}</p>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{new Date(billing.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fiyat Alarmı - Tek satır, sürekli görünür */}
            <div className="border-t border-gray-200">
              <div className="w-full flex items-center p-4">
                <div className="flex items-center space-x-2 mr-3">
                  <span className="text-gray-400">🔔</span>
                  <span className="text-sm font-medium text-gray-900">Fiyat Alarmı :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {priceAlerts && priceAlerts.length > 0 ? (
                    priceAlerts.map((alert: any) => (
                      <div key={alert.id} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md">
                        {`${alert.origin}-${alert.destination}`}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Kayıtlı alarm yok</span>
                  )}
                </div>
              </div>
            </div>

            {/* Favori Arama U. - Tek satır, sürekli görünür */}
            <div className="border-t border-gray-200">
              <div className="w-full flex items-center p-4">
                <div className="flex items-center space-x-2 mr-3">
                  <span className="text-gray-400">🔎</span>
                  <span className="text-sm font-medium text-gray-900">Favori Arama U. :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favoriteSearches && favoriteSearches.length > 0 ? (
                    favoriteSearches.map((fav: any) => (
                      <div key={fav.id} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md">
                        {`${fav.origin}-${fav.destination}`}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Kayıtlı favori yok</span>
                  )}
                </div>
              </div>
            </div>

            {/* Favori Oteller - Tek satır, sürekli görünür */}
            <div className="border-t border-gray-200">
              <div className="w-full flex items-center p-4">
                <div className="flex items-center space-x-2 mr-3">
                  <span className="text-gray-400">🏨</span>
                  <span className="text-sm font-medium text-gray-900">Favori Oteller :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    console.log('[Frontend Render] hotelFavorites state:', hotelFavorites)
                    console.log('[Frontend Render] hotelFavorites length:', hotelFavorites?.length)
                    console.log('[Frontend Render] hotelFavorites isArray:', Array.isArray(hotelFavorites))
                    
                    if (!hotelFavorites || !Array.isArray(hotelFavorites) || hotelFavorites.length === 0) {
                      return <span className="text-xs text-gray-500">Kayıtlı favori otel yok</span>
                    }
                    
                    return hotelFavorites.map((fav: any) => {
                      console.log('[Frontend Render] Rendering favorite:', fav)
                      return (
                        <div key={fav.id || fav.hotelId} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md">
                          {fav.hotelName || 'İsimsiz Otel'}
                          {fav.hotelLocation && <span className="text-gray-500 ml-1">({fav.hotelLocation})</span>}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>

            {/* Yolcular - Fatura adresleri gibi açılır kapalı bölüm */}
            <div id="section-passengers" className="border-t border-gray-200">
              <button
                onClick={togglePassengers}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Yolcular</span>
                  <span className="text-xs text-gray-500">({passengers.length})</span>
                </div>
                {showPassengers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showPassengers && (
                <div className="px-4 pb-4">
                  {loadingPassengers ? (
                    <div className="text-xs text-gray-500">Yükleniyor...</div>
                  ) : passengers.length === 0 ? (
                    <div className="text-xs text-gray-500">Kayıtlı yolcu yok</div>
                  ) : (
                    <div className="space-y-2">
                      {passengers.map((p: any, idx: number) => (
                        <div key={p.id || idx} className="bg-gray-50 rounded px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-800 flex items-center flex-wrap gap-2">
                              <span className="font-medium mr-1">{p.firstName} {p.lastName}</span>
                              {p.identityNumber ? (
                                <span className="text-gray-500">({p.identityNumber})</span>
                              ) : null}
                              {idx === 0 && (
                                <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Hesap Sahibi</span>
                              )}
                              {(p.birthDay && p.birthMonth && p.birthYear) ? (
                                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                  {String(p.birthDay).toString().padStart(2,'0')}/{String(p.birthMonth).toString().padStart(2,'0')}/{p.birthYear}
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Doğum: -</span>
                              )}
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                {p.gender === 'male' ? 'Erkek' : p.gender === 'female' ? 'Kadın' : 'Cinsiyet: -'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 whitespace-nowrap">{(p.countryCode || '') + ' ' + (p.phone || '')}</span>
                              <button
                                onClick={() => openPassengerModal(p.id)}
                                className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Düzenle
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Yorumlar - Açılır kapanır bölüm */}
            <div className="border-t border-gray-200">
              <button
                onClick={() => setShowComments(!showComments)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Yorumlar</span>
                </div>
                {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showComments && (
                <div className="px-4 pb-4">
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    placeholder="Kullanıcı hakkında notlarınızı buraya yazabilirsiniz..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveComments}
                    disabled={savingComments}
                    className={`mt-2 px-4 py-2 text-sm rounded-md ${
                      savingComments
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {savingComments ? 'Kaydediliyor...' : 'Yorumları Kaydet'}
                  </button>
                </div>
              )}
            </div>

            {/* Inline Detay Kartı - Rezervasyonlar sekmesi (sadece tıklanınca göster) */}
            {!HIDE_BOTTOM_RESERVATIONS_SECTION && activeInlineTab === 'reservations' && (
              <div className="admin-card">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveInlineTab('none')}
                    className="py-3 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
                  >
                    Rezervasyonlar ({reservations.length})
                  </button>
                </nav>
              </div>

              <div className="p-4">
                {activeInlineTab === 'reservations' && (
                  loadingReservations ? (
                    <div className="admin-text-xs text-gray-500">Yükleniyor...</div>
                  ) : reservations.length === 0 ? (
                    <div className="admin-text-xs text-gray-500">Kayıtlı rezervasyon yok</div>
                  ) : (
                    <div className="w-full">
                      <div className="grid grid-cols-7 text-xs text-gray-500 px-3 py-2">
                        <div>Bilet</div>
                        <div>Tarih</div>
                        <div>Yolcu</div>
                        <div>Tutar</div>
                        <div>Seyahat</div>
                        <div>Durum</div>
                        <div className="text-right">Aksiyon</div>
                      </div>
                      <div className="divide-y divide-gray-200 bg-white rounded-lg border">
                        {reservations.map((r: any) => {
                          const tarih = r.departureTime ? new Date(r.departureTime) : null
                          const yolcuSayisi = r.passengers ? (() => { try { const arr = JSON.parse(r.passengers); return Array.isArray(arr) ? arr.length : '-' } catch { return '-' } })() : '-'
                          const seyahat = r.origin && r.destination ? `${r.origin}-${r.destination}` : (r.flightNumber || '-')
                          const tutar = r.amount ? `${r.amount} ${r.currency || ''}` : '-'
                          const pnr = r.pnr || (r.id ? r.id.slice(-8).toUpperCase() : '-')
                          const badge = (s: string) => {
                            const base = 'px-2 py-0.5 rounded text-xs'
                            if (!s) return <span className={`${base} bg-gray-100 text-gray-600`}>Bilinmiyor</span>
                            const map: Record<string,string> = {
                              ready: 'bg-green-100 text-green-700',
                              confirmed: 'bg-green-100 text-green-700',
                              pending: 'bg-yellow-100 text-yellow-700',
                              processing: 'bg-yellow-100 text-yellow-700',
                              cancelled: 'bg-red-100 text-red-700',
                              completed: 'bg-blue-100 text-blue-700',
                            }
                            const cls = map[s] || 'bg-gray-100 text-gray-700'
                            return <span className={`${base} ${cls}`}>{s}</span>
                          }
                          return (
                            <div key={r.id} className="grid grid-cols-7 items-center px-3 py-3">
                              <div className="font-medium text-gray-900">{pnr}</div>
                              <div className="text-gray-700">{tarih ? tarih.toLocaleDateString('tr-TR') : '-'}</div>
                              <div className="text-gray-700">{yolcuSayisi}</div>
                              <div className="text-gray-900 font-medium">{tutar}</div>
                              <div className="text-gray-700">{seyahat}</div>
                              <div>{badge(r.status)}</div>
                              <div className="text-right">
                                <button className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Görüntüle</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            )}

            {/* Anket Cevapları - Yolcuların altında */}
            {surveyResponse && surveyResponse.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="p-4">
                  <h3 className="text-xs font-medium text-gray-900 mb-2">Anket Cevapları</h3>
                  <div className="bg-gray-50 p-2 rounded-md">
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {surveyResponse.map((item: any, index: number) => (
                        <span key={index}>
                          {item.answer}
                          {index < surveyResponse.length - 1 && ' • '}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => router.push('/kullanici')}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                <span>Kapat</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md ${
                  saving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      <PassengerEditModal
        open={showPassengerModal}
        passenger={selectedPassenger}
        onClose={() => setShowPassengerModal(false)}
        onChange={(patch: any) => setSelectedPassenger((prev: any) => ({ ...prev, ...patch }))}
        onSave={handlePassengerSave}
        saving={savingPassenger}
      />
    </div>
  )
} 

// Yolcu düzenleme modalı
// Not: Bu bileşen dosyanın sonunda render ediliyor
function PassengerEditModal({
  open,
  passenger,
  onClose,
  onChange,
  onSave,
  saving
}: any) {
  if (!open || !passenger) return null
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-xl w-full">
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Yolcu Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="admin-modal-content">
          <div className="grid grid-cols-2 gap-3">
            <input className="admin-form-input" placeholder="Ad" value={passenger.firstName || ''} onChange={(e) => onChange({ firstName: e.target.value })} />
            <input className="admin-form-input" placeholder="Soyad" value={passenger.lastName || ''} onChange={(e) => onChange({ lastName: e.target.value })} />
            <div className="flex gap-2">
              <input className="admin-form-input w-24" placeholder="Kod" value={passenger.countryCode || ''} onChange={(e) => onChange({ countryCode: e.target.value })} />
              <input className="admin-form-input flex-1" placeholder="Telefon" value={passenger.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} />
            </div>
            <input className="admin-form-input" placeholder="TC" value={passenger.identityNumber || ''} onChange={(e) => onChange({ identityNumber: e.target.value })} />
            <div className="col-span-2 flex items-center gap-2">
              <input className="admin-form-input w-16" placeholder="GG" value={passenger.birthDay || ''} onChange={(e) => onChange({ birthDay: e.target.value })} />
              <span className="text-gray-400">/</span>
              <input className="admin-form-input w-16" placeholder="AA" value={passenger.birthMonth || ''} onChange={(e) => onChange({ birthMonth: e.target.value })} />
              <span className="text-gray-400">/</span>
              <input className="admin-form-input w-20" placeholder="YYYY" value={passenger.birthYear || ''} onChange={(e) => onChange({ birthYear: e.target.value })} />
            </div>
            <select className="admin-form-select" value={passenger.gender || ''} onChange={(e) => onChange({ gender: e.target.value })}>
              <option value="">Cinsiyet</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
            <label className="flex items-center text-xs text-gray-600">
              <input type="checkbox" className="mr-2" checked={!!passenger.isForeigner} onChange={(e) => onChange({ isForeigner: e.target.checked })} />
              Yabancı Uyruklu
            </label>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={saving}>İptal</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      </div>
    </div>
  )
} 