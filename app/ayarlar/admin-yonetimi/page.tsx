'use client'
import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import AdminList from '../../components/admin/AdminList'
import AdminForm from '../../components/admin/AdminForm'
import PermissionManager from '../../components/admin/PermissionManager'

export default function AdminYonetimiPage() {
  const [activeTab, setActiveTab] = useState('ayarlar')
  const [activeAdminTab, setActiveAdminTab] = useState('liste')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)

  // Örnek admin verileri
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@gurbet.biz',
      role: 'Super Admin',
      status: 'active' as const,
      lastLogin: '2 saat önce',
      createdAt: '15.03.2024'
    },
    {
      id: 2,
      name: 'Fatma Demir',
      email: 'fatma@gurbet.biz',
      role: 'Admin',
      status: 'active' as const,
      lastLogin: '1 gün önce',
      createdAt: '10.02.2024'
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      email: 'mehmet@gurbet.biz',
      role: 'Moderator',
      status: 'inactive' as const,
      lastLogin: '3 gün önce',
      createdAt: '05.01.2024'
    },
    {
      id: 4,
      name: 'Ayşe Özkan',
      email: 'ayse@gurbet.biz',
      role: 'Satış',
      status: 'active' as const,
      lastLogin: '5 saat önce',
      createdAt: '20.06.2024'
    },
    {
      id: 5,
      name: 'Can Yıldız',
      email: 'can@gurbet.biz',
      role: 'Temsilci',
      status: 'active' as const,
      lastLogin: '1 saat önce',
      createdAt: '25.06.2024'
    }
  ])

  // Admin işlemleri
  const handleAddAdmin = (adminData: any) => {
    const newAdmin = {
      id: Math.max(...admins.map(a => a.id)) + 1,
      name: `${adminData.firstName} ${adminData.lastName}`,
      email: adminData.email,
      role: adminData.role,
      status: 'active' as const,
      lastLogin: 'Henüz giriş yapmadı',
      createdAt: new Date().toLocaleDateString('tr-TR')
    }
    setAdmins([...admins, newAdmin])
    setActiveAdminTab('liste')
    alert('Admin başarıyla eklendi!')
  }

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin)
    setShowEditModal(true)
  }

  const handleUpdateAdmin = (updatedAdmin: any) => {
    setAdmins(admins.map(admin => 
      admin.id === updatedAdmin.id 
        ? { ...admin, ...updatedAdmin }
        : admin
    ))
    setShowEditModal(false)
    setEditingAdmin(null)
    alert('Admin başarıyla güncellendi!')
  }

  const handleDeleteAdmin = (admin: any) => {
    if (confirm(`${admin.name} adlı admini silmek istediğinizden emin misiniz?`)) {
      setAdmins(admins.filter(a => a.id !== admin.id))
      alert('Admin başarıyla silindi!')
    }
  }

  const handleToggleStatus = (admin: any) => {
    setAdmins(admins.map(a => 
      a.id === admin.id 
        ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
        : a
    ))
    alert(`Admin durumu ${admin.status === 'active' ? 'pasif' : 'aktif'} yapıldı!`)
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
                <button
                  onClick={() => setActiveAdminTab('yetkiler')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'yetkiler'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Yetki Yönetimi
                </button>
              </nav>
            </div>

            {/* Tab İçerikleri */}
            {activeAdminTab === 'liste' && (
              <AdminList 
                admins={admins} 
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
                onToggleStatus={handleToggleStatus}
              />
            )}

            {activeAdminTab === 'ekle' && (
              <AdminForm 
                onSubmit={handleAddAdmin}
                onCancel={() => setActiveAdminTab('liste')}
              />
            )}

            {activeAdminTab === 'yetkiler' && (
              <PermissionManager onSave={(roles) => console.log('Yetkiler kaydedildi:', roles)} />
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