'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { User, Calendar, Clock, Edit, Save, CreditCard, X, Mail, Phone, MapPin } from 'lucide-react'

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
    address: ''
  })

  useEffect(() => {
    fetchUser()
    fetchSurveyResponse()
  }, [params.id])

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
          address: data.data.address || ''
        })
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
          role: formData.role
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
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{user?.passengerCount || 0}</div>
                      <div className="text-xs text-gray-600">Yolcu</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{user?.alertCount || 0}</div>
                      <div className="text-xs text-gray-600">Fiyat Alarmı</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{user?.favoriteCount || 0}</div>
                      <div className="text-xs text-gray-600">Favori Arama</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
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
                </div>

                {/* Anket Cevapları */}
                {surveyResponse && surveyResponse.length > 0 && (
                  <div>
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
                )}

                {/* İşlemler */}
                <div>
                  <h3 className="text-xs font-medium text-gray-900 mb-2">İşlemler</h3>
                </div>
              </div>
            </div>

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
    </div>
  )
} 