'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { Code, ExternalLink, Copy, CheckCircle, XCircle, Clock, Activity, Server, Database, Mail, CreditCard, Users, BarChart3, Settings, Shield, Globe, RefreshCw } from 'lucide-react'

interface ApiEndpoint {
  id: string
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  status: 'active' | 'inactive' | 'maintenance'
  category: string
  lastUsed?: string
  usage?: number
  responseTime?: number
}

interface CategoryStats {
  category: string
  totalApis: number
  activeApis: number
  totalUsage: number
  avgResponseTime: number
}

interface ApiStats {
  totalApis: number
  activeApis: number
  totalUsage: number
  avgResponseTime: number
  categories: number
}

interface ApiData {
  apis: ApiEndpoint[]
  categories: CategoryStats[]
  stats: ApiStats
}

export default function ApilerPage() {
  const [activeTab, setActiveTab] = useState('apiler')
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApiData = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await fetch('/api/apiler/stats')
      const data = await response.json()
      
      if (data.success) {
        setApiData(data.data)
      } else {
        setError(data.error || 'API verileri alınamadı')
      }
    } catch (err) {
      console.error('API verileri alınamadı:', err)
      setError('API verileri alınamadı')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchApiData()
    // Her 30 saniyede bir yenile
    const interval = setInterval(fetchApiData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchApiData()
  }

  // Loading durumu
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-4 w-full overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-lg text-gray-600">API verileri yükleniyor...</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Pasif'
      case 'maintenance': return 'Bakımda'
      default: return 'Bilinmiyor'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = async (text: string, endpointId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEndpoint(endpointId)
      setTimeout(() => setCopiedEndpoint(null), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sistem': return Server
      case 'Kullanıcılar': return Users
      case 'Email': return Mail
      case 'Ödeme': return CreditCard
      case 'Güvenlik': return Shield
      case 'Kampanyalar': return Globe
      default: return Code
    }
  }

  if (!apiData) {
    return (
      <div className="flex h-screen bg-gray-100 w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-4 w-full overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">API verileri yüklenemedi</p>
                  <p className="text-sm text-gray-500 mt-2">{error}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
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
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Code className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">API'ler</h1>
                  <p className="text-gray-600">Sistem API endpoint'leri ve durumları</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Yenile</span>
                </button>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{apiData.stats.totalApis}</span> API Endpoint
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{apiData.stats.activeApis}</span> Aktif
                </div>
              </div>
            </div>

            {/* Kategoriler */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {apiData.categories.map(categoryStat => {
                const Icon = getCategoryIcon(categoryStat.category)
                
                return (
                  <div key={categoryStat.category} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{categoryStat.category}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{categoryStat.activeApis}/{categoryStat.totalApis} Aktif</div>
                      <div className="text-xs text-gray-500">{categoryStat.totalApis} Endpoint</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {categoryStat.totalUsage} istek/saat
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* API Listesi */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">API Endpoint'leri</h2>
                <p className="text-sm text-gray-600 mt-1">Tüm sistem API'leri ve durumları</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yanıt Süresi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Kullanım</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiData.apis.map((api) => {
                      const Icon = getCategoryIcon(api.category)
                      return (
                        <tr key={api.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Icon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{api.name}</div>
                                <div className="text-sm text-gray-500">{api.description}</div>
                                <div className="text-xs text-gray-400">{api.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(api.method)}`}>
                              {api.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {api.endpoint}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(api.status)}`}>
                              {getStatusText(api.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {api.usage || 0} istek/saat
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {api.responseTime || 0}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {api.lastUsed || 'Bilinmiyor'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(api.endpoint, api.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Endpoint'i kopyala"
                              >
                                {copiedEndpoint === api.id ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                              <a
                                href={`http://localhost:3004${api.endpoint}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                                title="API'yi test et"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API İstatistikleri */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Aktif API'ler</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {apiData.stats.activeApis}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Toplam İstek</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {apiData.stats.totalUsage}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Ortalama Yanıt</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {apiData.stats.avgResponseTime}ms
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Server className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Kategoriler</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {apiData.stats.categories}
                    </div>
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
