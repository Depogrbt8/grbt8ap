'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { Plus, Settings, Play, Pause, ExternalLink, Code, Key, Globe, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'

interface ExternalApi {
  id: string
  name: string
  baseUrl: string
  enabled: boolean
  lastTest?: string
  status?: 'online' | 'offline' | 'error'
  responseTime?: number
}

export default function ExternalApisPage() {
  const [activeTab, setActiveTab] = useState('external-apis')
  const [apis, setApis] = useState<ExternalApi[]>([
    {
      id: 'biletdukkani',
      name: 'BiletDukkani API',
      baseUrl: 'https://api.biletdukkani.com',
      enabled: true,
      status: 'online',
      responseTime: 150,
      lastTest: new Date().toISOString()
    },
    {
      id: 'thy',
      name: 'THY API',
      baseUrl: 'https://api.thy.com',
      enabled: true,
      status: 'online',
      responseTime: 200,
      lastTest: new Date().toISOString()
    },
    {
      id: 'pegasus',
      name: 'Pegasus API',
      baseUrl: 'https://api.pegasus.com.tr',
      enabled: false,
      status: 'offline',
      responseTime: 0,
      lastTest: new Date().toISOString()
    }
  ])
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingApi, setEditingApi] = useState<ExternalApi | null>(null)
  const [newApi, setNewApi] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    timeout: 10000
  })
  const [editApi, setEditApi] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    timeout: 10000
  })

  const fetchApis = async () => {
    try {
      const response = await fetch('/api/external/list?action=list')
      const data = await response.json()
      console.log('API Response:', data)
      if (data.success) {
        setApis(data.data)
      }
    } catch (error) {
      console.error('API listesi alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApis()
  }, [])

  const testApi = async (apiId: string) => {
    setTesting(apiId)
    try {
      const response = await fetch(`/api/external/list?action=test&id=${apiId}`)
      const data = await response.json()
      
      if (data.success) {
        // API durumunu güncelle
        setApis(prev => prev.map(api => 
          api.id === apiId 
            ? { ...api, status: 'online', lastTest: new Date().toISOString(), responseTime: data.responseTime }
            : api
        ))
      } else {
        setApis(prev => prev.map(api => 
          api.id === apiId 
            ? { ...api, status: 'error', lastTest: new Date().toISOString() }
            : api
        ))
      }
    } catch (error) {
      setApis(prev => prev.map(api => 
        api.id === apiId 
          ? { ...api, status: 'error', lastTest: new Date().toISOString() }
          : api
      ))
    } finally {
      setTesting(null)
    }
  }

  const toggleApi = async (apiId: string) => {
    try {
      const response = await fetch(`/api/external/list?action=toggle&id=${apiId}`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setApis(prev => prev.map(api => 
          api.id === apiId 
            ? { ...api, enabled: !api.enabled }
            : api
        ))
      }
    } catch (error) {
      console.error('API durumu değiştirilemedi:', error)
    }
  }

  const addApi = async () => {
    try {
      // Yeni API'yi statik listeye ekle
      const newApiData: ExternalApi = {
        id: newApi.name.toLowerCase().replace(/\s+/g, '-'),
        name: newApi.name,
        baseUrl: newApi.baseUrl,
        enabled: true,
        status: 'offline',
        responseTime: 0,
        lastTest: new Date().toISOString()
      }
      
      setApis(prev => [...prev, newApiData])
      setShowAddModal(false)
      setNewApi({ name: '', baseUrl: '', apiKey: '', timeout: 10000 })
      
      console.log('API eklendi:', newApiData)
    } catch (error) {
      console.error('API eklenemedi:', error)
    }
  }

  const openEditModal = (api: ExternalApi) => {
    setEditingApi(api)
    setEditApi({
      name: api.name,
      baseUrl: api.baseUrl,
      apiKey: '', // API key'i güvenlik için boş bırakıyoruz
      timeout: 10000
    })
    setShowEditModal(true)
  }

  const updateApi = async () => {
    if (!editingApi) return
    
    try {
      setApis(prev => prev.map(api => 
        api.id === editingApi.id 
          ? { 
              ...api, 
              name: editApi.name,
              baseUrl: editApi.baseUrl,
              // API key güncellenmişse ekle
              ...(editApi.apiKey && { apiKey: editApi.apiKey })
            }
          : api
      ))
      
      setShowEditModal(false)
      setEditingApi(null)
      setEditApi({ name: '', baseUrl: '', apiKey: '', timeout: 10000 })
      
      console.log('API güncellendi:', editingApi.id)
    } catch (error) {
      console.error('API güncellenemedi:', error)
    }
  }

  const deleteApi = async (apiId: string) => {
    if (confirm('Bu API\'yi silmek istediğinizden emin misiniz?')) {
      try {
        setApis(prev => prev.filter(api => api.id !== apiId))
        console.log('API silindi:', apiId)
      } catch (error) {
        console.error('API silinemedi:', error)
      }
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'offline': return <XCircle className="h-4 w-4 text-red-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi'
      case 'offline': return 'Çevrimdışı'
      case 'error': return 'Hata'
      default: return 'Test Edilmedi'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-4 w-full overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">Dış API'ler yükleniyor...</p>
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
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dış API'ler</h1>
                  <p className="text-gray-600">Harici servis entegrasyonları</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>API Ekle</span>
              </button>
            </div>

            {/* API Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apis.map((api) => (
                <div key={api.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(api.status)}
                      <span className={`text-sm font-medium ${
                        api.status === 'online' ? 'text-green-600' :
                        api.status === 'offline' ? 'text-red-600' :
                        api.status === 'error' ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {getStatusText(api.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Code className="h-4 w-4" />
                      <span className="font-medium">URL:</span>
                      <span className="text-gray-500">{api.baseUrl}</span>
                    </div>
                    
                    {api.responseTime && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Yanıt Süresi:</span>
                        <span className="text-gray-500">{api.responseTime}ms</span>
                      </div>
                    )}

                    {api.lastTest && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Son Test:</span>
                        <span className="text-gray-500">
                          {new Date(api.lastTest).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleApi(api.id)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          api.enabled 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {api.enabled ? (
                          <>
                            <Pause className="h-3 w-3 inline mr-1" />
                            Devre Dışı
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 inline mr-1" />
                            Etkinleştir
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testApi(api.id)}
                        disabled={testing === api.id}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
                      >
                        {testing === api.id ? (
                          <Clock className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <ExternalLink className="h-3 w-3 inline mr-1" />
                            Test Et
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => openEditModal(api)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                        title="API Düzenle"
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Ekleme Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni API Ekle</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Adı
                      </label>
                      <input
                        type="text"
                        value={newApi.name}
                        onChange={(e) => setNewApi({...newApi, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Örn: BiletDukkani API"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={newApi.baseUrl}
                        onChange={(e) => setNewApi({...newApi, baseUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://api.example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key (Opsiyonel)
                      </label>
                      <input
                        type="password"
                        value={newApi.apiKey}
                        onChange={(e) => setNewApi({...newApi, apiKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="API anahtarı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={newApi.timeout}
                        onChange={(e) => setNewApi({...newApi, timeout: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={addApi}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Düzenleme Modal */}
            {showEditModal && editingApi && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">API Düzenle</h3>
                    <button
                      onClick={() => deleteApi(editingApi.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="API'yi Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Adı
                      </label>
                      <input
                        type="text"
                        value={editApi.name}
                        onChange={(e) => setEditApi({...editApi, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Örn: BiletDukkani API"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={editApi.baseUrl}
                        onChange={(e) => setEditApi({...editApi, baseUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://api.example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key (Yeni anahtar girin)
                      </label>
                      <input
                        type="password"
                        value={editApi.apiKey}
                        onChange={(e) => setEditApi({...editApi, apiKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Yeni API anahtarı (boş bırakırsanız değişmez)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={editApi.timeout}
                        onChange={(e) => setEditApi({...editApi, timeout: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                      />
                    </div>

                    {/* Mevcut API Bilgileri */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Mevcut Durum</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Durum: <span className={`font-medium ${
                          editingApi.status === 'online' ? 'text-green-600' :
                          editingApi.status === 'offline' ? 'text-red-600' :
                          editingApi.status === 'error' ? 'text-yellow-600' : 'text-gray-500'
                        }`}>{getStatusText(editingApi.status)}</span></div>
                        <div>Aktif: <span className={`font-medium ${editingApi.enabled ? 'text-green-600' : 'text-red-600'}`}>
                          {editingApi.enabled ? 'Evet' : 'Hayır'}
                        </span></div>
                        {editingApi.responseTime && (
                          <div>Yanıt Süresi: <span className="font-medium">{editingApi.responseTime}ms</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingApi(null)
                        setEditApi({ name: '', baseUrl: '', apiKey: '', timeout: 10000 })
                      }}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={updateApi}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Güncelle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
