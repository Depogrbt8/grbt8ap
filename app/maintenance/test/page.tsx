'use client'
import { useState } from 'react'

export default function TestPage() {
  const [apiResponse, setApiResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/system/maintenance-mode')
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse('Hata: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Sayfası</h1>
        
        <button 
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Test Ediliyor...' : 'API Test Et'}
        </button>

        {apiResponse && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">API Yanıtı:</h2>
            <pre className="bg-white p-4 rounded-md border text-sm overflow-auto">
              {apiResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
