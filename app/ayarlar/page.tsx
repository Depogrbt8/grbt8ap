'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ApiModal from '../components/settings/ApiModal'
import BackupModal from '../components/settings/BackupModal'
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
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 w-full">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Site Ayarları Butonu */}
              <button
                onClick={() => setIsSiteModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Site Ayarları</h2>
                <p className="text-sm text-gray-600">Site başlığı, iletişim bilgileri</p>
              </button>

              {/* SEO Ayarları Butonu */}
              <button
                onClick={() => setIsSeoModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">SEO Ayarları</h2>
                <p className="text-sm text-gray-600">Meta tags, sosyal medya, güvenlik</p>
              </button>

              {/* Güvenlik Ayarları Butonu */}
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Güvenlik</h2>
                <p className="text-sm text-gray-600">Şifre politikası, oturum süresi</p>
              </button>

              {/* Email Ayarları Butonu */}
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Email Ayarları</h2>
                <p className="text-sm text-gray-600">SMTP ayarları, email türleri</p>
              </button>

              {/* Ajans Ayarları Butonu */}
              <button
                onClick={() => setIsAgencyModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Ajans Ayarları</h2>
                <p className="text-sm text-gray-600">Ajans yönetimi ve komisyon ayarları</p>
              </button>

              {/* Admin Yönetimi Butonu */}
              <a
                href="/ayarlar/admin-yonetimi"
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors block"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Admin Yönetimi</h2>
                <p className="text-sm text-gray-600">Admin listesi, yetki yönetimi</p>
              </a>

              {/* API Yönetimi Butonu */}
              <button
                onClick={() => setIsApiModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">API Yönetimi</h2>
                <p className="text-sm text-gray-600">API ayarlarını yönetin</p>
              </button>

              {/* Backup Butonu */}
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Backup</h2>
                <p className="text-sm text-gray-600">Backup ayarlarını yönetin</p>
              </button>

              {/* Ülke Kısıtlaması Butonu */}
              <button
                onClick={() => setIsCountryModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Ülke Kısıtlaması</h2>
                <p className="text-sm text-gray-600">Hangi ülkelerde hizmet verileceğini belirleyin</p>
              </button>

              {/* Duyuru Yönetimi Butonu */}
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">Duyuru Yönetimi</h2>
                <p className="text-sm text-gray-600">Tüm adminlere duyuru gönderin</p>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ApiModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
      />
      <BackupModal 
        isOpen={isBackupModalOpen} 
        onClose={() => setIsBackupModalOpen(false)} 
      />
      <CountryRestrictionModal 
        isOpen={isCountryModalOpen} 
        onClose={() => setIsCountryModalOpen(false)} 
      />
      <SiteSettingsModal 
        isOpen={isSiteModalOpen} 
        onClose={() => setIsSiteModalOpen(false)} 
      />
      <SecurityModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)} 
      />
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />
      <AgencyModal 
        isOpen={isAgencyModalOpen} 
        onClose={() => setIsAgencyModalOpen(false)} 
      />
      <AnnouncementModal 
        isOpen={isAnnouncementModalOpen} 
        onClose={() => setIsAnnouncementModalOpen(false)} 
      />
      <SeoModal 
        isOpen={isSeoModalOpen} 
        onClose={() => setIsSeoModalOpen(false)} 
      />
    </div>
  )
} 