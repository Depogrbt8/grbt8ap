'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function UcuslarPage() {
  const [activeTab, setActiveTab] = useState('ucuslar')

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="admin-main-content">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <div className="admin-content-wrapper">
          <div className="admin-card">
            <h3 className="admin-text-sm mb-2">Uçuş Yönetimi</h3>
            <p className="admin-text-xs">Bu özellik henüz geliştiriliyor...</p>
          </div>
        </div>
      </div>
    </div>
  )
}