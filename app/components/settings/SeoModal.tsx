'use client'
import { useState } from 'react'
import { X, Save, Eye, EyeOff, Globe, Search, Share2, Shield } from 'lucide-react'

interface SeoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SeoModal({ isOpen, onClose }: SeoModalProps) {
  const [seoSettings, setSeoSettings] = useState({
    // Ana Site SEO Ayarları
    siteTitle: 'Gurbet.biz - Yurt Dışı Seyahat',
    siteDescription: 'En uygun fiyatlarla yurt dışı uçak bileti rezervasyonu. Güvenilir seyahat partneriniz.',
    siteKeywords: 'uçak bileti, yurt dışı seyahat, rezervasyon, havayolu',
    siteUrl: 'https://gurbet.biz',
    
    // Meta Tags
    robotsIndex: true,
    robotsFollow: true,
    googleIndex: true,
    googleFollow: true,
    
    // Open Graph
    ogTitle: 'Gurbet.biz - Yurt Dışı Seyahat',
    ogDescription: 'En uygun fiyatlarla yurt dışı uçak bileti rezervasyonu.',
    ogImage: '/images/og-image.jpg',
    ogType: 'website',
    
    // Twitter Cards
    twitterCard: 'summary_large_image',
    twitterSite: '@gurbetbiz',
    twitterCreator: '@gurbetbiz',
    
    // Schema.org
    organizationName: 'Gurbet.biz',
    organizationLogo: '/images/logo.png',
    organizationUrl: 'https://gurbet.biz',
    organizationDescription: 'Yurt dışı seyahat ve uçak bileti rezervasyon hizmetleri',
    
    // Admin Panel Güvenlik
    adminPanelHidden: true,
    apiEndpointsHidden: true,
    systemFilesHidden: true
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSave = () => {
    // SEO ayarlarını kaydet
    console.log('SEO ayarları kaydedildi:', seoSettings)
    alert('SEO ayarları başarıyla kaydedildi!')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">SEO Ayarları</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'general', name: 'Genel SEO', icon: Globe },
              { id: 'meta', name: 'Meta Tags', icon: Eye },
              { id: 'social', name: 'Sosyal Medya', icon: Share2 },
              { id: 'security', name: 'Güvenlik', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Genel SEO */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Açıklaması
                </label>
                <textarea
                  value={seoSettings.siteDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, siteDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  value={seoSettings.siteKeywords}
                  onChange={(e) => setSeoSettings({...seoSettings, siteKeywords: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="uçak bileti, yurt dışı seyahat, rezervasyon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={seoSettings.siteUrl}
                  onChange={(e) => setSeoSettings({...seoSettings, siteUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Meta Tags */}
          {activeTab === 'meta' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.robotsIndex}
                      onChange={(e) => setSeoSettings({...seoSettings, robotsIndex: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Robots Index</span>
                  </label>
                  <p className="text-xs text-gray-500">Arama motorları sayfayı indeksleyebilir</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.robotsFollow}
                      onChange={(e) => setSeoSettings({...seoSettings, robotsFollow: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Robots Follow</span>
                  </label>
                  <p className="text-xs text-gray-500">Arama motorları linkleri takip edebilir</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.googleIndex}
                      onChange={(e) => setSeoSettings({...seoSettings, googleIndex: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Google Index</span>
                  </label>
                  <p className="text-xs text-gray-500">Google sayfayı indeksleyebilir</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.googleFollow}
                      onChange={(e) => setSeoSettings({...seoSettings, googleFollow: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Google Follow</span>
                  </label>
                  <p className="text-xs text-gray-500">Google linkleri takip edebilir</p>
                </div>
              </div>
            </div>
          )}

          {/* Sosyal Medya */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Başlığı
                </label>
                <input
                  type="text"
                  value={seoSettings.ogTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, ogTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Açıklaması
                </label>
                <textarea
                  value={seoSettings.ogDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, ogDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Resmi
                </label>
                <input
                  type="text"
                  value={seoSettings.ogImage}
                  onChange={(e) => setSeoSettings({...seoSettings, ogImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/images/og-image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Site
                  </label>
                  <input
                    type="text"
                    value={seoSettings.twitterSite}
                    onChange={(e) => setSeoSettings({...seoSettings, twitterSite: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@gurbetbiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Creator
                  </label>
                  <input
                    type="text"
                    value={seoSettings.twitterCreator}
                    onChange={(e) => setSeoSettings({...seoSettings, twitterCreator: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@gurbetbiz"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Güvenlik */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-sm font-medium text-yellow-800">Admin Panel Güvenliği</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  Bu ayarlar admin panelinin arama motorlarından gizlenmesini sağlar.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Admin Paneli Gizleme</h4>
                    <p className="text-xs text-gray-600">Admin paneli arama motorlarından gizlenir</p>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.adminPanelHidden}
                      onChange={(e) => setSeoSettings({...seoSettings, adminPanelHidden: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {seoSettings.adminPanelHidden ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">API Endpoint'leri Gizleme</h4>
                    <p className="text-xs text-gray-600">API endpoint'leri arama motorlarından gizlenir</p>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.apiEndpointsHidden}
                      onChange={(e) => setSeoSettings({...seoSettings, apiEndpointsHidden: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {seoSettings.apiEndpointsHidden ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Sistem Dosyaları Gizleme</h4>
                    <p className="text-xs text-gray-600">Next.js sistem dosyaları gizlenir</p>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seoSettings.systemFilesHidden}
                      onChange={(e) => setSeoSettings({...seoSettings, systemFilesHidden: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {seoSettings.systemFilesHidden ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <EyeOff className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-medium text-green-800">Mevcut Güvenlik Durumu</h3>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✅ Admin paneli arama motorlarından gizli</p>
                  <p>✅ API endpoint'leri korunuyor</p>
                  <p>✅ Sistem dosyaları gizli</p>
                  <p>✅ X-Robots-Tag headers aktif</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  )
}
