'use client'
import { useState } from 'react'

interface AdminFormProps {
  onSubmit: (adminData: any) => void
  onCancel: () => void
  editingAdmin?: any
  isEdit?: boolean
}

export default function AdminForm({ onSubmit, onCancel, editingAdmin, isEdit = false }: AdminFormProps) {
  const [formData, setFormData] = useState({
    firstName: editingAdmin?.name?.split(' ')[0] || '',
    lastName: editingAdmin?.name?.split(' ').slice(1).join(' ') || '',
    email: editingAdmin?.email || '',
    password: '',
    confirmPassword: '',
    role: editingAdmin?.role || 'Admin',
    permissions: {
      // Sistem
      system: false,
      admin: false,
      settings: false,
      security: false,
      backup: false,
      'country-restriction': false,
      announcement: false,
      // Kullanıcı
      users: true,
      'user-roles': false,
      // Uçuş
      flights: false,
      reservations: false,
      'flight-search': false,
      // Finans
      payments: false,
      'payment-gateway': false,
      refunds: false,
      // Email
      'email-templates': false,
      'email-settings': false,
      'email-campaigns': false,
      'email-logs': false,
      // API
      'api-management': false,
      'external-apis': false,
      'api-keys': false,
      'api-logs': false,
      // Kampanya
      campaigns: false,
      promotions: false,
      discounts: false,
      // Ajans
      'agency-management': false,
      'agency-commission': false,
      // Analiz
      reports: false,
      statistics: false,
      analytics: false,
      dashboard: true
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEdit && formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!')
      return
    }
    if (isEdit && formData.password && formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!')
      return
    }
    
    const submitData = {
      ...formData,
      id: editingAdmin?.id,
      name: `${formData.firstName} ${formData.lastName}`.trim()
    }
    
    onSubmit(submitData)
  }

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission as keyof typeof prev.permissions]
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kişisel Bilgiler */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soyad
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Hesap Bilgileri */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          {isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Opsiyonel)
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Şifre değiştirmek istemiyorsanız boş bırakın"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Yeni şifre tekrarı"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rol ve Yetkiler */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rol ve Yetkiler</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Satış">Satış</option>
              <option value="Temsilci">Temsilci</option>
              <option value="Email Yöneticisi">Email Yöneticisi</option>
              <option value="API Yöneticisi">API Yöneticisi</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yetkiler
            </label>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {/* Sistem Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sistem Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.system}
                      onChange={() => handlePermissionChange('system')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sistem Yönetimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.admin}
                      onChange={() => handlePermissionChange('admin')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin Yönetimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.settings}
                      onChange={() => handlePermissionChange('settings')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sistem Ayarları</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.security}
                      onChange={() => handlePermissionChange('security')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Güvenlik Ayarları</span>
                  </label>
                </div>
              </div>

              {/* Kullanıcı Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Kullanıcı Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.users}
                      onChange={() => handlePermissionChange('users')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Kullanıcı Yönetimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions['user-roles']}
                      onChange={() => handlePermissionChange('user-roles')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Kullanıcı Rolleri</span>
                  </label>
                </div>
              </div>

              {/* Uçuş Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Uçuş Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.flights}
                      onChange={() => handlePermissionChange('flights')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Uçuş Yönetimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reservations}
                      onChange={() => handlePermissionChange('reservations')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Rezervasyon Yönetimi</span>
                  </label>
                </div>
              </div>

              {/* Email Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Email Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions['email-templates']}
                      onChange={() => handlePermissionChange('email-templates')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email Şablonları</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions['email-settings']}
                      onChange={() => handlePermissionChange('email-settings')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email Ayarları</span>
                  </label>
                </div>
              </div>

              {/* API Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">API Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions['api-management']}
                      onChange={() => handlePermissionChange('api-management')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">API Yönetimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions['external-apis']}
                      onChange={() => handlePermissionChange('external-apis')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Dış API Yönetimi</span>
                  </label>
                </div>
              </div>

              {/* Analiz Yetkileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Analiz Yetkileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports}
                      onChange={() => handlePermissionChange('reports')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Raporlar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.statistics}
                      onChange={() => handlePermissionChange('statistics')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">İstatistikler</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.dashboard}
                      onChange={() => handlePermissionChange('dashboard')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Dashboard</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Admin Güncelle' : 'Admin Ekle'}
        </button>
      </div>
    </form>
  )
} 