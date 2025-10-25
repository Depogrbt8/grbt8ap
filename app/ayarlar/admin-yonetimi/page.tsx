'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import AdminList from '../../components/admin/AdminList'
import AdminForm from '../../components/admin/AdminForm'

export default function AdminYonetimiPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('ayarlar')
  const [activeAdminTab, setActiveAdminTab] = useState('liste')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)

  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Admin listesini yükle
  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin')
      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.data)
      } else {
        alert('Admin listesi yüklenemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Admin listesi yüklenemedi:', error)
      alert('Admin listesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  // Admin işlemleri
  const handleAddAdmin = async (adminData: any) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchAdmins() // Listeyi yenile
        setActiveAdminTab('liste')
        alert('Admin başarıyla eklendi!')
      } else {
        alert('Admin eklenemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Admin ekleme hatası:', error)
      alert('Admin eklenemedi')
    }
  }

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin)
    setShowEditModal(true)
  }

  const handleUpdateAdmin = async (updatedAdmin: any) => {
    try {
      const response = await fetch(`/api/admin/${updatedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedAdmin)
      })

      const data = await response.json()

      if (data.success) {
        await fetchAdmins() // Listeyi yenile
        setShowEditModal(false)
        setEditingAdmin(null)
        alert('Admin başarıyla güncellendi!')
      } else {
        alert('Admin güncellenemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Admin güncelleme hatası:', error)
      alert('Admin güncellenemedi')
    }
  }

  const handleDeleteAdmin = async (admin: any) => {
    if (confirm(`${admin.name} adlı admini silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/admin/${admin.id}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
          await fetchAdmins() // Listeyi yenile
          alert('Admin başarıyla silindi!')
        } else {
          alert('Admin silinemedi: ' + data.error)
        }
      } catch (error) {
        console.error('Admin silme hatası:', error)
        alert('Admin silinemedi')
      }
    }
  }

  const handleToggleStatus = async (admin: any) => {
    try {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/admin/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...admin,
          status: newStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchAdmins() // Listeyi yenile
        alert(`Admin durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı!`)
      } else {
        alert('Admin durumu değiştirilemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Admin durum değiştirme hatası:', error)
      alert('Admin durumu değiştirilemedi')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Yönetimi</h1>
            </div>

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Admin listesi yükleniyor...</div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveAdminTab('liste')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'liste'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Admin Listesi
                </button>
                <button
                  onClick={() => setActiveAdminTab('ekle')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'ekle'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Yeni Admin Ekle
                </button>
              </nav>
            </div>

            {/* Tab İçerikleri */}
            {!loading && activeAdminTab === 'liste' && (
              <AdminList 
                admins={admins} 
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
                onToggleStatus={handleToggleStatus}
              />
            )}

            {!loading && activeAdminTab === 'ekle' && (
              <AdminForm 
                onSubmit={handleAddAdmin}
                onCancel={() => setActiveAdminTab('liste')}
              />
            )}


          </div>
        </main>
      </div>

      {/* Admin Düzenleme Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Admin Düzenle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingAdmin(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <AdminForm
              onSubmit={handleUpdateAdmin}
              onCancel={() => {
                setShowEditModal(false)
                setEditingAdmin(null)
              }}
              editingAdmin={editingAdmin}
              isEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  )
} 