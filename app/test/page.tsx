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
    <div>
      <h1>Test Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
