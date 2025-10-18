'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  category: string
}

interface ApiData {
  apis: ApiEndpoint[]
  totalApis: number
  categories: string[]
}

export default function ApilerPage() {
  const [activeTab, setActiveTab] = useState('apiler')
  const [apiData, setApiData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch('/api/apiler/stats')
        const data = await response.json()
        
        if (data.success) {
          setApiData(data.data)
        }
      } catch (err) {
        console.error('API verileri alınamadı:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApiData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-6 w-full overflow-y-auto">
            <div className="text-sm text-gray-500">Yükleniyor...</div>
          </main>
        </div>
      </div>
    )
  }

  if (!apiData) {
    return (
      <div className="flex h-screen bg-gray-100 w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-6 w-full overflow-y-auto">
            <div className="text-sm text-red-600">API listesi yüklenemedi</div>
          </main>
        </div>
      </div>
    )
  }

  const filteredApis = selectedCategory === 'Tümü' 
    ? apiData.apis 
    : apiData.apis.filter(api => api.category === selectedCategory)

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header />
        
        <main className="flex-1 p-6 w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Başlık */}
            <div className="mb-4">
              <h1 className="text-base font-semibold text-gray-800">API Endpoint'leri</h1>
              <p className="text-xs text-gray-500 mt-1">Toplam {apiData.totalApis} endpoint</p>
            </div>

            {/* Kategori Filtre */}
            <div className="mb-4 flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedCategory('Tümü')}
                className={`px-2 py-1 rounded ${
                  selectedCategory === 'Tümü'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Tümü ({apiData.totalApis})
              </button>
              {apiData.categories.map(cat => {
                const count = apiData.apis.filter(a => a.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded ${
                      selectedCategory === cat
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* Tablo */}
            <div className="bg-white border border-gray-200 rounded">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Metod</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Endpoint</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApis.map((api, index) => (
                    <tr 
                      key={`${api.endpoint}-${api.method}-${index}`} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${
                          api.method === 'GET' ? 'bg-blue-50 text-blue-700' :
                          api.method === 'POST' ? 'bg-green-50 text-green-700' :
                          api.method === 'PUT' ? 'bg-yellow-50 text-yellow-700' :
                          api.method === 'PATCH' ? 'bg-orange-50 text-orange-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {api.method}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700">
                        {api.endpoint}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {api.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
