'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Users, CheckCircle, Clock, Filter, Download, Eye } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

interface SurveyResponse {
  id: string
  userId: string
  answers: string
  completedAt: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface SurveyStats {
  totalResponses: number
  todayResponses: number
  thisWeekResponses: number
  completionRate: number
}

export default function AnketlerPage() {
  const [activeTab, setActiveTab] = useState('anketler')
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [stats, setStats] = useState<SurveyStats>({
    totalResponses: 0,
    todayResponses: 0,
    thisWeekResponses: 0,
    completionRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null)

  useEffect(() => {
    fetchSurveyData()
  }, [])

  const fetchSurveyData = async () => {
    try {
      // Ana siteden anket verilerini çek
      const response = await fetch('/api/surveys/responses')
      if (response.ok) {
        const data = await response.json()
        setResponses(data.data || [])
        
        // İstatistikleri hesapla
        const total = data.data?.length || 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayCount = data.data?.filter((r: SurveyResponse) => 
          new Date(r.completedAt) >= today
        ).length || 0
        
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekCount = data.data?.filter((r: SurveyResponse) => 
          new Date(r.completedAt) >= weekAgo
        ).length || 0

        setStats({
          totalResponses: total,
          todayResponses: todayCount,
          thisWeekResponses: weekCount,
          completionRate: 78.5 // Demo veri
        })
      } else {
        // Demo veri
        setResponses([
          {
            id: '1',
            userId: 'user1',
            answers: JSON.stringify({
              satisfaction: 'Çok Memnun',
              recommendation: 'Evet',
              improvements: 'Daha hızlı arama',
              experience: 'Mükemmel'
            }),
            completedAt: '2024-01-15T10:30:00Z',
            userAgent: 'Mozilla/5.0...',
            ipAddress: '192.168.1.1',
            createdAt: '2024-01-15T10:30:00Z',
            user: {
              firstName: 'Ahmet',
              lastName: 'Yılmaz',
              email: 'ahmet@example.com'
            }
          },
          {
            id: '2',
            userId: 'user2',
            answers: JSON.stringify({
              satisfaction: 'Memnun',
              recommendation: 'Evet',
              improvements: 'Mobil uygulama',
              experience: 'İyi'
            }),
            completedAt: '2024-01-14T15:45:00Z',
            userAgent: 'Mozilla/5.0...',
            ipAddress: '192.168.1.2',
            createdAt: '2024-01-14T15:45:00Z',
            user: {
              firstName: 'Fatma',
              lastName: 'Demir',
              email: 'fatma@example.com'
            }
          },
          {
            id: '3',
            userId: 'user3',
            answers: JSON.stringify({
              satisfaction: 'Orta',
              recommendation: 'Belki',
              improvements: 'Fiyat şeffaflığı',
              experience: 'Orta'
            }),
            completedAt: '2024-01-13T09:15:00Z',
            userAgent: 'Mozilla/5.0...',
            ipAddress: '192.168.1.3',
            createdAt: '2024-01-13T09:15:00Z',
            user: {
              firstName: 'Mehmet',
              lastName: 'Kaya',
              email: 'mehmet@example.com'
            }
          }
        ])

        setStats({
          totalResponses: 3,
          todayResponses: 1,
          thisWeekResponses: 3,
          completionRate: 78.5
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Anket verileri alınamadı:', error)
      setIsLoading(false)
    }
  }

  const parseAnswers = (answersString: string) => {
    try {
      return JSON.parse(answersString)
    } catch {
      return {}
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
        <main className="flex-1 p-4 w-full overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Anket Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">Kullanıcı anketleri ve geri bildirimler</p>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Yanıt</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bugünkü Yanıtlar</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.todayResponses}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bu Hafta</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.thisWeekResponses}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tamamlama Oranı</p>
                    <p className="text-2xl font-bold text-green-600">%{stats.completionRate}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Anket Yanıtları Tablosu */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Anket Yanıtları</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1">
                      <Filter className="h-4 w-4" />
                      <span>Filtrele</span>
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>Dışa Aktar</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Memnuniyet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tavsiye
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tamamlanma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {responses.map((response) => {
                      const answers = parseAnswers(response.answers)
                      return (
                        <tr key={response.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {response.user.firstName} {response.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{response.user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              answers.satisfaction === 'Çok Memnun' ? 'bg-green-100 text-green-800' :
                              answers.satisfaction === 'Memnun' ? 'bg-blue-100 text-blue-800' :
                              answers.satisfaction === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {answers.satisfaction || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              answers.recommendation === 'Evet' ? 'bg-green-100 text-green-800' :
                              answers.recommendation === 'Belki' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {answers.recommendation || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(response.completedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedResponse(response)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Detay</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detay Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Anket Detayları</h3>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Kullanıcı Bilgileri</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>Ad:</strong> {selectedResponse.user.firstName} {selectedResponse.user.lastName}</p>
                    <p><strong>Email:</strong> {selectedResponse.user.email}</p>
                    <p><strong>IP Adresi:</strong> {selectedResponse.ipAddress}</p>
                    <p><strong>Tarih:</strong> {formatDate(selectedResponse.completedAt)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Anket Yanıtları</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {Object.entries(parseAnswers(selectedResponse.answers)).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Teknik Bilgiler</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>User Agent:</strong> {selectedResponse.userAgent}</p>
                    <p><strong>Oluşturulma:</strong> {formatDate(selectedResponse.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

