'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ApiModal from '../components/settings/ApiModal'
import CountryRestrictionModal from '../components/settings/CountryRestrictionModal'
import SiteSettingsModal from '../components/settings/SiteSettingsModal'
import SecurityModal from '../components/settings/SecurityModal'
import EmailModal from '../components/settings/EmailModal'
import AgencyModal from '../components/settings/AgencyModal'
import AnnouncementModal from '../components/settings/AnnouncementModal'
import SeoModal from '../components/settings/SeoModal'

export default function AyarlarPage() {
  const [activeTab, setActiveTab] = useState('ayarlar')
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false)

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          <div className="admin-grid-3">
              {/* Site Ayarları Butonu */}
              <button
                onClick={() => setIsSiteModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Site Ayarları</h2>
                <p className="admin-text-xs">Genel site ayarları ve konfigürasyon</p>
              </button>

              {/* Güvenlik Ayarları Butonu */}
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Güvenlik</h2>
                <p className="admin-text-xs">Güvenlik ayarları ve erişim kontrolü</p>
              </button>

              {/* Email Ayarları Butonu */}
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Email</h2>
                <p className="admin-text-xs">Email gönderimi ve template ayarları</p>
              </button>

              {/* API Ayarları Butonu */}
              <button
                onClick={() => setIsApiModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">API</h2>
                <p className="admin-text-xs">API anahtarları ve entegrasyonlar</p>
              </button>

              {/* Ülke Kısıtlamaları Butonu */}
              <button
                onClick={() => setIsCountryModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Ülke Kısıtlamaları</h2>
                <p className="admin-text-xs">Erişim kısıtlamaları ve coğrafi engellemeler</p>
              </button>

              {/* Ajans Ayarları Butonu */}
              <button
                onClick={() => setIsAgencyModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Ajans</h2>
                <p className="admin-text-xs">Ajans bilgileri ve komisyon ayarları</p>
              </button>

              {/* Duyuru Ayarları Butonu */}
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">Duyurular</h2>
                <p className="admin-text-xs">Sistem duyuruları ve bildirimler</p>
              </button>

              {/* SEO Ayarları Butonu */}
              <button
                onClick={() => setIsSeoModalOpen(true)}
                className="admin-card hover:bg-gray-50 transition-colors"
              >
                <h2 className="admin-card-title mb-2">SEO</h2>
                <p className="admin-text-xs">Arama motoru optimizasyonu</p>
              </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApiModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
      <CountryRestrictionModal isOpen={isCountryModalOpen} onClose={() => setIsCountryModalOpen(false)} />
      <SiteSettingsModal isOpen={isSiteModalOpen} onClose={() => setIsSiteModalOpen(false)} />
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
      <AgencyModal isOpen={isAgencyModalOpen} onClose={() => setIsAgencyModalOpen(false)} />
      <AnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} />
      <SeoModal isOpen={isSeoModalOpen} onClose={() => setIsSeoModalOpen(false)} />
    </div>
  )
}