'use client'
import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface SentryWidgetProps {
  className?: string
}

export default function SentryWidget({ className = '' }: SentryWidgetProps) {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Sentry API'den bugünkü hataları getir
    const fetchRecentIssues = async () => {
      setLoading(true)
      try {
        // Sentry API token gerekli
        const response = await fetch('/api/system/sentry-issues')
        if (response.ok) {
          const data = await response.json()
          setIssues(data.issues || [])
        }
      } catch (error) {
        // Sentry yoksa sessizce devam et
        setIssues([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentIssues()
    const interval = setInterval(fetchRecentIssues, 60000) // Her 1 dakikada bir güncelle
    return () => clearInterval(interval)
  }, [])

  if (!issues.length) return null

  const criticalCount = issues.filter((i: any) => i.severity === 'error').length
  const warningCount = issues.filter((i: any) => i.severity === 'warning').length

  return (
    <div className={`${className} bg-white rounded-lg shadow p-4 border-l-4 ${criticalCount > 0 ? 'border-red-500' : 'border-yellow-500'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className={`h-4 w-4 ${criticalCount > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
          <span className="text-sm font-medium">Sentry</span>
          <span className="text-xs text-gray-500">({issues.length} issue)</span>
        </div>
        <div className="flex items-center space-x-3">
          {criticalCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
              {criticalCount} kritik
            </span>
          )}
          {warningCount > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
              {warningCount} uyarı
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

