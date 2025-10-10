'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import AdminPanelStatus from '../components/dashboard/AdminPanelStatus'
import MainSiteStatus from '../components/dashboard/MainSiteStatus'
import DatabaseBackupSystem from '../components/system/DatabaseBackupSystem'
import SystemAlerts from '../components/system/SystemAlerts'

export default function SistemPage() {
  const [activeTab, setActiveTab] = useState('sistem')

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="admin-main-content">
          <div className="admin-content-wrapper">
            {/* Sistem Uyarıları */}
            <SystemAlerts className="flex justify-end" />
            
            <MainSiteStatus />
            <AdminPanelStatus />
            <DatabaseBackupSystem />
          </div>
        </main>
      </div>
    </div>
  )
} 