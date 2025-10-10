'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function KampanyalarPage() {
  const [activeTab, setActiveTab] = useState('kampanyalar')

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          <div className="admin-card">
            <div className="text-center py-12">
              <h3 className="admin-card-title mb-2">Kampanya Yönetimi</h3>
              <p className="admin-text-xs">Kampanyalar artık ana siteden yönetiliyor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 