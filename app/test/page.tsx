'use client'
import { useState, useEffect } from 'react'

export default function TestPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/external/list?action=list')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data)
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('API Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="admin-page-container">
      <div className="admin-main-content">
        <div className="admin-content-wrapper">
          <div className="admin-card">
            <h1 className="admin-card-title">Test Page</h1>
            <pre className="admin-text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
