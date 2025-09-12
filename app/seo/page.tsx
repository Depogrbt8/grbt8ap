'use client'

import { useState } from 'react'
import { Search, Save, Eye, Globe, Twitter, Facebook, Instagram, Settings, Shield, Code, BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState('seo')
  const [currentTab, setCurrentTab] = useState('general')

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

  const handleSave = () => {
    // Burada API çağrısı yapılacak
    console.log('SEO ayarları kaydediliyor:', seoSettings)
    alert('SEO ayarları başarıyla kaydedildi!')
  }

  const handlePreview = () => {
    // Önizleme fonksiyonu
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

  // SEO Analiz Fonksiyonu
  const analyzeSEO = () => {
    const analysis: {
      score: number
      issues: Array<{type: string, message: string}>
      recommendations: Array<{type: string, message: string}>
      status: string
    } = {
      score: 0,
      issues: [],
      recommendations: [],
      status: 'checking'
    }

    // Genel SEO Kontrolleri
    if (seoSettings.siteTitle && seoSettings.siteTitle.length > 10 && seoSettings.siteTitle.length < 60) {
      analysis.score += 15
      analysis.recommendations.push({ type: 'success', message: 'Site başlığı optimal uzunlukta (10-60 karakter)' })
    } else {
      analysis.score += 5
      analysis.issues.push({ type: 'warning', message: 'Site başlığı 10-60 karakter arasında olmalı' })
    }

    if (seoSettings.siteDescription && seoSettings.siteDescription.length > 120 && seoSettings.siteDescription.length < 160) {
      analysis.score += 15
      analysis.recommendations.push({ type: 'success', message: 'Site açıklaması optimal uzunlukta (120-160 karakter)' })
    } else {
      analysis.score += 5
      analysis.issues.push({ type: 'warning', message: 'Site açıklaması 120-160 karakter arasında olmalı' })
    }

    if (seoSettings.keywords && seoSettings.keywords.split(',').length >= 3) {
      analysis.score += 10
      analysis.recommendations.push({ type: 'success', message: 'Yeterli anahtar kelime tanımlanmış' })
    } else {
      analysis.score += 3
      analysis.issues.push({ type: 'warning', message: 'En az 3 anahtar kelime tanımlayın' })
    }

    // Meta Tags Kontrolleri
    if (seoSettings.ogTitle && seoSettings.ogTitle.length > 10) {
      analysis.score += 10
      analysis.recommendations.push({ type: 'success', message: 'Open Graph başlığı tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'error', message: 'Open Graph başlığı eksik' })
    }

    if (seoSettings.ogDescription && seoSettings.ogDescription.length > 20) {
      analysis.score += 10
      analysis.recommendations.push({ type: 'success', message: 'Open Graph açıklaması tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'error', message: 'Open Graph açıklaması eksik' })
    }

    if (seoSettings.ogImage && seoSettings.ogImage.includes('/')) {
      analysis.score += 10
      analysis.recommendations.push({ type: 'success', message: 'Open Graph resmi tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'error', message: 'Open Graph resmi eksik' })
    }

    // Sosyal Medya Kontrolleri
    if (seoSettings.facebookUrl && seoSettings.facebookUrl.includes('facebook.com')) {
      analysis.score += 5
      analysis.recommendations.push({ type: 'success', message: 'Facebook URL tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'warning', message: 'Facebook URL eksik' })
    }

    if (seoSettings.twitterUrl && seoSettings.twitterUrl.includes('twitter.com')) {
      analysis.score += 5
      analysis.recommendations.push({ type: 'success', message: 'Twitter URL tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'warning', message: 'Twitter URL eksik' })
    }

    // Güvenlik Kontrolleri
    if (seoSettings.robotsIndex && seoSettings.robotsFollow) {
      analysis.score += 10
      analysis.recommendations.push({ type: 'success', message: 'Robots direktifleri doğru ayarlanmış' })
    } else {
      analysis.issues.push({ type: 'error', message: 'Robots direktifleri kontrol edilmeli' })
    }

    if (seoSettings.googleVerification && !seoSettings.googleVerification.includes('placeholder')) {
      analysis.score += 5
      analysis.recommendations.push({ type: 'success', message: 'Google verification kodu tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'warning', message: 'Google verification kodu eksik' })
    }

    // Schema.org Kontrolleri
    if (seoSettings.organizationName && seoSettings.organizationName.length > 3) {
      analysis.score += 5
      analysis.recommendations.push({ type: 'success', message: 'Organizasyon adı tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'warning', message: 'Organizasyon adı eksik' })
    }

    if (seoSettings.organizationLogo && seoSettings.organizationLogo.includes('http')) {
      analysis.score += 5
      analysis.recommendations.push({ type: 'success', message: 'Organizasyon logosu tanımlanmış' })
    } else {
      analysis.issues.push({ type: 'warning', message: 'Organizasyon logosu eksik' })
    }

    return analysis
  }

  const [analysisResult, setAnalysisResult] = useState(null)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Search className="h-6 w-6 mr-2" />
                  SEO Yönetimi
                </h1>
                <p className="text-gray-600 mt-1">Site SEO ayarlarını yönetin ve optimize edin</p>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex justify-end space-x-3">
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Önizleme
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-white border border-gray-200 rounded-lg">
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
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Genel SEO Ayarları</h3>
                      
                      <div className="grid grid-cols-1 gap-6">
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
                            value={seoSettings.keywords}
                            onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="virgülle ayırın"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Canonical URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.canonicalUrl}
                            onChange={(e) => setSeoSettings({...seoSettings, canonicalUrl: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta Tags Tab */}
                  {currentTab === 'meta' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Meta Tags Ayarları</h3>
                      
                      <div className="grid grid-cols-1 gap-6">
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
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Twitter Card Tipi
                          </label>
                          <select
                            value={seoSettings.twitterCard}
                            onChange={(e) => setSeoSettings({...seoSettings, twitterCard: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Sosyal Medya Ayarları</h3>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Facebook className="h-4 w-4 inline mr-2" />
                            Facebook URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.facebookUrl}
                            onChange={(e) => setSeoSettings({...seoSettings, facebookUrl: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Twitter className="h-4 w-4 inline mr-2" />
                            Twitter URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.twitterUrl}
                            onChange={(e) => setSeoSettings({...seoSettings, twitterUrl: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Instagram className="h-4 w-4 inline mr-2" />
                            Instagram URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.instagramUrl}
                            onChange={(e) => setSeoSettings({...seoSettings, instagramUrl: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Güvenlik Tab */}
                  {currentTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Güvenlik ve Robots Ayarları</h3>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={seoSettings.robotsIndex}
                            onChange={(e) => setSeoSettings({...seoSettings, robotsIndex: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="text-sm font-medium text-gray-700">
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
                          <label className="text-sm font-medium text-gray-700">
                            Robots Follow (Linkleri takip etsin)
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Google Verification Code
                          </label>
                          <input
                            type="text"
                            value={seoSettings.googleVerification}
                            onChange={(e) => setSeoSettings({...seoSettings, googleVerification: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yandex Verification Code
                          </label>
                          <input
                            type="text"
                            value={seoSettings.yandexVerification}
                            onChange={(e) => setSeoSettings({...seoSettings, yandexVerification: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schema.org Tab */}
                  {currentTab === 'schema' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Schema.org Ayarları</h3>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organizasyon Adı
                          </label>
                          <input
                            type="text"
                            value={seoSettings.organizationName}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organizasyon Açıklaması
                          </label>
                          <textarea
                            value={seoSettings.organizationDescription}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationDescription: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.organizationLogo}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationLogo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website URL
                          </label>
                          <input
                            type="url"
                            value={seoSettings.organizationUrl}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationUrl: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={seoSettings.organizationPhone}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationPhone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kuruluş Yılı
                          </label>
                          <input
                            type="number"
                            value={seoSettings.organizationFounded}
                            onChange={(e) => setSeoSettings({...seoSettings, organizationFounded: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analiz Tab */}
                  {currentTab === 'analysis' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">SEO Analizi</h3>
                        <button
                          onClick={() => setAnalysisResult(analyzeSEO())}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analiz Et
                        </button>
                      </div>

                      {analysisResult && (
                        <div className="space-y-6">
                          {/* SEO Skor Kartı */}
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-semibold mb-2">SEO Skoru</h4>
                                <div className="text-4xl font-bold">{analysisResult.score}/100</div>
                                <p className="text-blue-100 mt-2">
                                  {analysisResult.score >= 80 ? 'Mükemmel!' : 
                                   analysisResult.score >= 60 ? 'İyi' : 
                                   analysisResult.score >= 40 ? 'Orta' : 'İyileştirme Gerekli'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-6xl font-bold opacity-20">
                                  {analysisResult.score >= 80 ? '🎉' : 
                                   analysisResult.score >= 60 ? '👍' : 
                                   analysisResult.score >= 40 ? '⚠️' : '🔧'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sorunlar ve Öneriler */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sorunlar */}
                            <div className="bg-white border border-red-200 rounded-lg p-4">
                              <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                                <XCircle className="h-5 w-5 mr-2" />
                                Düzeltilmesi Gerekenler ({analysisResult.issues.length})
                              </h5>
                              <div className="space-y-2">
                                {analysisResult.issues.map((issue, index) => (
                                  <div key={index} className={`p-3 rounded-md flex items-start ${
                                    issue.type === 'error' ? 'bg-red-50 border border-red-200' :
                                    issue.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                                    'bg-gray-50 border border-gray-200'
                                  }`}>
                                    {issue.type === 'error' ? (
                                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm ${
                                      issue.type === 'error' ? 'text-red-700' :
                                      issue.type === 'warning' ? 'text-yellow-700' :
                                      'text-gray-700'
                                    }`}>
                                      {issue.message}
                                    </span>
                                  </div>
                                ))}
                                {analysisResult.issues.length === 0 && (
                                  <p className="text-green-600 text-sm">Tüm kontroller başarılı! 🎉</p>
                                )}
                              </div>
                            </div>

                            {/* Öneriler */}
                            <div className="bg-white border border-green-200 rounded-lg p-4">
                              <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Başarılı Özellikler ({analysisResult.recommendations.length})
                              </h5>
                              <div className="space-y-2">
                                {analysisResult.recommendations.map((rec, index) => (
                                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-700">{rec.message}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Detaylı İstatistikler */}
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h5 className="font-semibold text-gray-800 mb-4">Detaylı İstatistikler</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{analysisResult.score}</div>
                                <div className="text-sm text-gray-600">Toplam Skor</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{analysisResult.issues.length}</div>
                                <div className="text-sm text-gray-600">Sorun</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{analysisResult.recommendations.length}</div>
                                <div className="text-sm text-gray-600">Başarılı</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {Math.round((analysisResult.recommendations.length / (analysisResult.issues.length + analysisResult.recommendations.length)) * 100)}%
                                </div>
                                <div className="text-sm text-gray-600">Başarı Oranı</div>
                              </div>
                            </div>
                          </div>

                          {/* Hızlı İyileştirme Önerileri */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-semibold text-blue-800 mb-3">Hızlı İyileştirme Önerileri</h5>
                            <div className="space-y-2">
                              <div className="text-sm text-blue-700">
                                • Site başlığınızı 10-60 karakter arasında tutun
                              </div>
                              <div className="text-sm text-blue-700">
                                • Meta açıklamanızı 120-160 karakter arasında yazın
                              </div>
                              <div className="text-sm text-blue-700">
                                • En az 3 anahtar kelime tanımlayın
                              </div>
                              <div className="text-sm text-blue-700">
                                • Open Graph resmi ekleyin (1200x630px önerilen)
                              </div>
                              <div className="text-sm text-blue-700">
                                • Sosyal medya hesaplarınızı bağlayın
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!analysisResult && (
                        <div className="text-center py-12">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">SEO Analizi</h4>
                          <p className="text-gray-500 mb-4">Mevcut SEO ayarlarınızı analiz etmek için "Analiz Et" butonuna tıklayın.</p>
                          <button
                            onClick={() => setAnalysisResult(analyzeSEO())}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Analiz Başlat
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}