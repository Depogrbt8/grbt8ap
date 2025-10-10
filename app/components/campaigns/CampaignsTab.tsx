'use client'
import { useState, useEffect } from 'react'
import { Globe, Plus, Edit, Trash2, Monitor, Smartphone, Globe as GlobeIcon, Eye, Calendar, Link } from 'lucide-react'
import CampaignModal from './CampaignModal'

interface Campaign {
  id: string
  title: string
  description: string
  imageUrl: string
  altText: string
  linkUrl: string
  status: 'active' | 'inactive'
  position: number
  clickCount: number
  viewCount: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number | null>(null)
  
  // Cache duration: 2 dakika
  const CACHE_DURATION = 2 * 60 * 1000

  // Kampanyaları yükle - Cache ile
  const fetchCampaigns = async (forceRefresh = false) => {
    const now = Date.now()
    
    // Cache kontrolü - force refresh yoksa ve cache fresh ise, yükleme
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      console.log('📦 Cache\'den kampanyalar kullanılıyor')
      return
    }

    try {
      setLoading(campaigns.length === 0) // İlk yüklemede loading göster
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.data || [])
        setLastFetch(now) // Cache timestamp güncelle
        console.log('🔄 Kampanyalar API\'den yüklendi')
      } else {
        setError('Kampanyalar yüklenemedi')
      }
    } catch (error) {
      console.error('Campaign fetch error:', error)
      setError('Kampanyalar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Kampanya kaydetme - Modal'dan gelen veriyi direkt kullan (API çağrısı Modal'da yapılıyor)
  const handleSaveCampaign = (savedCampaign: Campaign) => {
    console.log('📥 Modal\'dan kampanya geldi:', savedCampaign)
    
    if (savedCampaign.id && !savedCampaign.id.startsWith('temp-')) {
      // Gerçek ID var - güncelleme veya yeni kayıt başarılı
      setCampaigns(prev => {
        const exists = prev.find(c => c.id === savedCampaign.id)
        if (exists) {
          // Güncelleme
          return prev.map(c => c.id === savedCampaign.id ? savedCampaign : c)
        } else {
          // Yeni ekleme
          return [...prev, savedCampaign]
        }
      })
      
      // Modal'ı kapat
      setIsModalOpen(false)
      setSelectedCampaign(null)
      
      console.log('✅ Kampanya başarıyla kaydedildi ve UI güncellendi')
    } else {
      console.error('❌ Geçersiz kampanya verisi:', savedCampaign)
    }
  }

  // Kampanya silme - Optimistic Update
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return

    try {
      // Optimistic update - UI'den hemen kaldır
      const originalCampaigns = campaigns
      setCampaigns(prev => prev.filter(c => c.id !== id))

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Hata durumunda geri al
        setCampaigns(originalCampaigns)
        alert('Kampanya silme hatası')
      }
    } catch (error) {
      console.error('Delete error:', error)
      await fetchCampaigns(true) // Force refresh
      alert('Kampanya silme hatası')
    }
  }

  // Kampanya düzenleme
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  // Yeni kampanya ekleme
  const handleAddCampaign = () => {
    setSelectedCampaign(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="w-full space-y-6 min-w-0">
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full space-y-6 min-w-0">
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={() => fetchCampaigns(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 min-w-0">
      {/* Kampanya Yönetimi */}
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">Kampanya Yönetimi</h3>
            <span className="text-sm text-gray-500">({campaigns.length} kampanya)</span>
          </div>
          <button
            onClick={handleAddCampaign}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>+ Yeni Kampanya</span>
          </button>
        </div>

        {/* Kampanya Kartları */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kampanya yok</h3>
            <p className="text-gray-500 mb-4">İlk kampanyanızı oluşturmak için "Yeni Kampanya" butonuna tıklayın.</p>
            <button
              onClick={handleAddCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              İlk Kampanyayı Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="relative p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {/* Tıklama Sayacı */}
                <div className="absolute top-2 left-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Link className="h-3 w-3" />
                    <span>{campaign.clickCount}</span>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Düzenle"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Sil"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Kampanya İçeriği */}
                <div className="mt-8">
                  <div className="text-sm font-medium mb-2">{campaign.title}</div>
                  {campaign.description && (
                    <div className="text-xs opacity-90 mb-2 line-clamp-2">{campaign.description}</div>
                  )}
                  
                  {/* Tarih Bilgisi */}
                  {(campaign.startDate || campaign.endDate) && (
                    <div className="text-xs opacity-90 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {campaign.startDate && new Date(campaign.startDate).toLocaleDateString('tr-TR')}
                          {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('tr-TR')}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Durum */}
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {campaign.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  {/* Pozisyon */}
                  <div className="text-xs opacity-90 mt-1">
                    Pozisyon: {campaign.position}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* İstatistikler */}
        {campaigns.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Genel İstatistikler</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>Toplam: {campaigns.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link className="h-4 w-4" />
                <span>Tıklama: {campaigns.reduce((sum, c) => sum + c.clickCount, 0)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Monitor className="h-4 w-4" />
                <span>Aktif: {campaigns.filter(c => c.status === 'active').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCampaign(null)
        }}
        campaign={selectedCampaign}
        onSave={handleSaveCampaign}
      />
    </div>
  )
} 