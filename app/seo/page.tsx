'use client'
import { useState, useEffect } from 'react'
import { Search, Save, Eye, Globe, Twitter, Facebook, Instagram, Settings, Shield, Code, BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState('seo')
  const [currentTab, setCurrentTab] = useState('general')
  const [loading, setLoading] = useState(true)

  // SEO Ayarları State
  const [seoSettings, setSeoSettings] = useState({
    // Genel SEO
    siteTitle: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
    siteDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri. Güvenli ödeme, 7/24 destek.',
    keywords: 'uçak bileti, yurt dışı seyahat, otel rezervasyonu, araç kiralama, gurbet, seyahat platformu, ucuz uçak bileti, havayolu bileti',
    canonicalUrl: 'https://gurbet.biz',
    
    // Meta Tags
    ogTitle: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
    ogDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    ogImage: '/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    
    // Sosyal Medya
    facebookUrl: 'https://www.facebook.com/gurbetbiz',
    twitterUrl: 'https://www.twitter.com/gurbetbiz',
    instagramUrl: 'https://www.instagram.com/gurbetbiz',
    
    // Güvenlik
    robotsIndex: true,
    robotsFollow: true,
    googleVerification: 'google-site-verification-code-here',
    yandexVerification: 'yandex-verification-code-here',
    
    // Schema.org
    organizationName: 'Gurbet.biz',
    organizationDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    organizationLogo: 'https://gurbet.biz/images/logo.png',
    organizationUrl: 'https://gurbet.biz',
    organizationPhone: '+90-XXX-XXX-XXXX',
    organizationFounded: '2024'
  })

  // SEO ayarlarını yükle
  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const response = await fetch('/api/seo')
        const data = await response.json()
        
        if (response.ok && data.success) {
          setSeoSettings(data.data)
        }
      } catch (error) {
        console.error('SEO ayarları yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeoSettings()
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seoSettings)
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        alert('SEO ayarları başarıyla kaydedildi!')
      } else {
        alert(data.error || 'SEO ayarları kaydetme hatası')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('SEO ayarları kaydetme hatası')
    }
  }

  const handlePreview = () => {
    console.log('SEO önizleme:', seoSettings)
    alert('Önizleme özelliği yakında eklenecek!')
  }

  const tabs = [
    { id: 'general', label: 'Genel SEO', icon: Globe },
    { id: 'meta', label: 'Meta Tags', icon: Code },
    { id: 'social', label: 'Sosyal Medya', icon: Facebook },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'schema', label: 'Schema.org', icon: Settings },
    { id: 'analysis', label: 'Analiz', icon: BarChart3 }
  ]

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="admin-text-lg flex items-center space-x-1">
              <Search className="h-4 w-4" />
              <span>SEO Yönetimi</span>
            </h1>
            <p className="admin-text-xs">Site SEO ayarlarını yönetin ve optimize edin</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex justify-end space-x-2">
            <button
              onClick={handlePreview}
              className="admin-btn admin-btn-secondary flex items-center space-x-1"
            >
              <Eye className="h-3 w-3" />
              <span>Önizleme</span>
            </button>
            <button
              onClick={handleSave}
              className="admin-btn admin-btn-primary flex items-center space-x-1"
            >
              <Save className="h-3 w-3" />
              <span>Kaydet</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="admin-card">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        currentTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Genel SEO Tab */}
              {currentTab === 'general' && (
                <div className="admin-space-y-3">
                  <h3 className="admin-text-sm">Genel SEO Ayarları</h3>
                  
                  <div className="admin-space-y-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Site Başlığı</label>
                      <input
                        type="text"
                        value={seoSettings.siteTitle}
                        onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Site Açıklaması</label>
                      <textarea
                        value={seoSettings.siteDescription}
                        onChange={(e) => setSeoSettings({...seoSettings, siteDescription: e.target.value})}
                        rows={3}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Anahtar Kelimeler</label>
                      <input
                        type="text"
                        value={seoSettings.keywords}
                        onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                        className="admin-form-input"
                        placeholder="virgülle ayırın"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Canonical URL</label>
                      <input
                        type="url"
                        value={seoSettings.canonicalUrl}
                        onChange={(e) => setSeoSettings({...seoSettings, canonicalUrl: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Tags Tab */}
              {currentTab === 'meta' && (
                <div className="admin-space-y-3">
                  <h3 className="admin-text-sm">Meta Tags Ayarları</h3>
                  
                  <div className="admin-space-y-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Open Graph Başlığı</label>
                      <input
                        type="text"
                        value={seoSettings.ogTitle}
                        onChange={(e) => setSeoSettings({...seoSettings, ogTitle: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Open Graph Açıklaması</label>
                      <textarea
                        value={seoSettings.ogDescription}
                        onChange={(e) => setSeoSettings({...seoSettings, ogDescription: e.target.value})}
                        rows={3}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Open Graph Resmi</label>
                      <input
                        type="text"
                        value={seoSettings.ogImage}
                        onChange={(e) => setSeoSettings({...seoSettings, ogImage: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Twitter Card Tipi</label>
                      <select
                        value={seoSettings.twitterCard}
                        onChange={(e) => setSeoSettings({...seoSettings, twitterCard: e.target.value})}
                        className="admin-form-select"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Sosyal Medya Tab */}
              {currentTab === 'social' && (
                <div className="admin-space-y-3">
                  <h3 className="admin-text-sm">Sosyal Medya Ayarları</h3>
                  
                  <div className="admin-space-y-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label flex items-center space-x-1">
                        <Facebook className="h-3 w-3" />
                        <span>Facebook URL</span>
                      </label>
                      <input
                        type="url"
                        value={seoSettings.facebookUrl}
                        onChange={(e) => setSeoSettings({...seoSettings, facebookUrl: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label flex items-center space-x-1">
                        <Twitter className="h-3 w-3" />
                        <span>Twitter URL</span>
                      </label>
                      <input
                        type="url"
                        value={seoSettings.twitterUrl}
                        onChange={(e) => setSeoSettings({...seoSettings, twitterUrl: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label flex items-center space-x-1">
                        <Instagram className="h-3 w-3" />
                        <span>Instagram URL</span>
                      </label>
                      <input
                        type="url"
                        value={seoSettings.instagramUrl}
                        onChange={(e) => setSeoSettings({...seoSettings, instagramUrl: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Güvenlik Tab */}
              {currentTab === 'security' && (
                <div className="admin-space-y-3">
                  <h3 className="admin-text-sm">Güvenlik ve Robots Ayarları</h3>
                  
                  <div className="admin-space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={seoSettings.robotsIndex}
                        onChange={(e) => setSeoSettings({...seoSettings, robotsIndex: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="admin-text-xs">
                        Robots Index (Arama motorları tarafından indekslensin)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={seoSettings.robotsFollow}
                        onChange={(e) => setSeoSettings({...seoSettings, robotsFollow: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="admin-text-xs">
                        Robots Follow (Linkleri takip etsin)
                      </label>
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Google Verification Code</label>
                      <input
                        type="text"
                        value={seoSettings.googleVerification}
                        onChange={(e) => setSeoSettings({...seoSettings, googleVerification: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Yandex Verification Code</label>
                      <input
                        type="text"
                        value={seoSettings.yandexVerification}
                        onChange={(e) => setSeoSettings({...seoSettings, yandexVerification: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Schema.org Tab */}
              {currentTab === 'schema' && (
                <div className="admin-space-y-3">
                  <h3 className="admin-text-sm">Schema.org Ayarları</h3>
                  
                  <div className="admin-space-y-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Organizasyon Adı</label>
                      <input
                        type="text"
                        value={seoSettings.organizationName}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationName: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Organizasyon Açıklaması</label>
                      <textarea
                        value={seoSettings.organizationDescription}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationDescription: e.target.value})}
                        rows={3}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Logo URL</label>
                      <input
                        type="url"
                        value={seoSettings.organizationLogo}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationLogo: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Website URL</label>
                      <input
                        type="url"
                        value={seoSettings.organizationUrl}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationUrl: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Telefon</label>
                      <input
                        type="tel"
                        value={seoSettings.organizationPhone}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationPhone: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="admin-form-label">Kuruluş Yılı</label>
                      <input
                        type="number"
                        value={seoSettings.organizationFounded}
                        onChange={(e) => setSeoSettings({...seoSettings, organizationFounded: e.target.value})}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Analiz Tab */}
              {currentTab === 'analysis' && (
                <div className="admin-space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="admin-text-sm">SEO Analizi</h3>
                    <button
                      onClick={() => alert('SEO analizi özelliği yakında eklenecek!')}
                      className="admin-btn admin-btn-primary flex items-center space-x-1"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Analiz Et</span>
                    </button>
                  </div>

                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="admin-text-sm mb-2">SEO Analizi</h4>
                    <p className="admin-text-xs mb-4">Mevcut SEO ayarlarınızı analiz etmek için "Analiz Et" butonuna tıklayın.</p>
                    <button
                      onClick={() => alert('SEO analizi özelliği yakında eklenecek!')}
                      className="admin-btn admin-btn-primary flex items-center space-x-1 mx-auto"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Analiz Başlat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}