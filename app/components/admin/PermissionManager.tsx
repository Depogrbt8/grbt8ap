'use client'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import React from 'react'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

interface PermissionManagerProps {
  onSave: (roles: Role[]) => void
}

export default function PermissionManager({ onSave }: PermissionManagerProps) {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'super-admin',
      name: 'Super Admin',
      description: 'Tüm yetkilere sahip',
      permissions: [
        'system', 'admin', 'settings', 'security', 'backup', 'country-restriction', 'announcement',
        'users', 'user-roles',
        'flights', 'reservations', 'flight-search',
        'payments', 'payment-gateway', 'refunds',
        'email-templates', 'email-settings', 'email-campaigns', 'email-logs',
        'api-management', 'external-apis', 'api-keys', 'api-logs',
        'campaigns', 'promotions', 'discounts',
        'agency-management', 'agency-commission',
        'reports', 'statistics', 'analytics', 'dashboard'
      ]
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Çoğu yetkiye sahip',
      permissions: [
        'users', 'user-roles',
        'flights', 'reservations', 'flight-search',
        'payments', 'payment-gateway', 'refunds',
        'email-templates', 'email-settings', 'email-campaigns',
        'api-management', 'external-apis',
        'campaigns', 'promotions', 'discounts',
        'agency-management',
        'reports', 'statistics', 'dashboard'
      ]
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Sınırlı yetkiye sahip',
      permissions: [
        'users',
        'flights', 'reservations',
        'email-templates',
        'campaigns',
        'reports', 'dashboard'
      ]
    },
    {
      id: 'sales',
      name: 'Satış',
      description: 'Satış işlemleri ve müşteri yönetimi',
      permissions: [
        'users',
        'flights', 'reservations', 'flight-search',
        'payments', 'refunds',
        'campaigns', 'promotions', 'discounts',
        'agency-management',
        'reports', 'statistics', 'dashboard'
      ]
    },
    {
      id: 'representative',
      name: 'Temsilci',
      description: 'Müşteri temsilcisi yetkileri',
      permissions: [
        'users',
        'flights', 'reservations',
        'email-templates',
        'reports', 'dashboard'
      ]
    },
    {
      id: 'email-manager',
      name: 'Email Yöneticisi',
      description: 'Email yönetimi uzmanı',
      permissions: [
        'email-templates', 'email-settings', 'email-campaigns', 'email-logs',
        'reports', 'dashboard'
      ]
    },
    {
      id: 'api-manager',
      name: 'API Yöneticisi',
      description: 'API entegrasyonları uzmanı',
      permissions: [
        'api-management', 'external-apis', 'api-keys', 'api-logs',
        'reports', 'dashboard'
      ]
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Sadece görüntüleme',
      permissions: ['reports', 'statistics', 'dashboard']
    }
  ])

  const permissions: Permission[] = [
    // Sistem Yönetimi
    { id: 'system', name: 'Sistem Yönetimi', description: 'Sistem genel ayarlarını yönetme', category: 'Sistem' },
    { id: 'admin', name: 'Admin Yönetimi', description: 'Admin kullanıcılarını yönetme', category: 'Sistem' },
    { id: 'settings', name: 'Sistem Ayarları', description: 'Site ayarlarını düzenleme', category: 'Sistem' },
    { id: 'security', name: 'Güvenlik Ayarları', description: 'Güvenlik politikalarını yönetme', category: 'Sistem' },
    { id: 'backup', name: 'Backup Yönetimi', description: 'Sistem yedekleme işlemleri', category: 'Sistem' },
    { id: 'country-restriction', name: 'Ülke Kısıtlaması', description: 'Hangi ülkelerde hizmet verileceğini belirleme', category: 'Sistem' },
    { id: 'announcement', name: 'Duyuru Yönetimi', description: 'Tüm adminlere duyuru gönderme', category: 'Sistem' },
    
    // Kullanıcı Yönetimi
    { id: 'users', name: 'Kullanıcı Yönetimi', description: 'Kullanıcıları görüntüleme, düzenleme, silme', category: 'Kullanıcı' },
    { id: 'user-roles', name: 'Kullanıcı Rolleri', description: 'Kullanıcı rollerini yönetme', category: 'Kullanıcı' },
    
    // Uçuş ve Rezervasyon
    { id: 'flights', name: 'Uçuş Yönetimi', description: 'Uçuşları görüntüleme, düzenleme, silme', category: 'Uçuş' },
    { id: 'reservations', name: 'Rezervasyon Yönetimi', description: 'Rezervasyonları görüntüleme, düzenleme', category: 'Uçuş' },
    { id: 'flight-search', name: 'Uçuş Arama', description: 'Uçuş arama işlemleri', category: 'Uçuş' },
    
    // Finans
    { id: 'payments', name: 'Ödeme Yönetimi', description: 'Ödemeleri görüntüleme, onaylama', category: 'Finans' },
    { id: 'payment-gateway', name: 'Ödeme Gateway', description: 'Ödeme gateway ayarlarını yönetme', category: 'Finans' },
    { id: 'refunds', name: 'İade Yönetimi', description: 'İade işlemlerini yönetme', category: 'Finans' },
    
    // Email Yönetimi
    { id: 'email-templates', name: 'Email Şablonları', description: 'Email şablonlarını yönetme', category: 'Email' },
    { id: 'email-settings', name: 'Email Ayarları', description: 'SMTP ve email gönderim ayarları', category: 'Email' },
    { id: 'email-campaigns', name: 'Email Kampanyaları', description: 'Toplu email gönderimi', category: 'Email' },
    { id: 'email-logs', name: 'Email Logları', description: 'Gönderilen emailleri görüntüleme', category: 'Email' },
    
    // API Yönetimi
    { id: 'api-management', name: 'API Yönetimi', description: 'İç API ayarlarını yönetme', category: 'API' },
    { id: 'external-apis', name: 'Dış API Yönetimi', description: 'Dış servislerle entegrasyonları yönetme', category: 'API' },
    { id: 'api-keys', name: 'API Anahtarları', description: 'API anahtarlarını güvenli şekilde yönetme', category: 'API' },
    { id: 'api-logs', name: 'API Logları', description: 'API kullanım loglarını görüntüleme', category: 'API' },
    
    // Kampanya Yönetimi
    { id: 'campaigns', name: 'Kampanya Yönetimi', description: 'Kampanyaları oluşturma ve yönetme', category: 'Kampanya' },
    { id: 'promotions', name: 'Promosyon Yönetimi', description: 'Promosyon kodlarını yönetme', category: 'Kampanya' },
    { id: 'discounts', name: 'İndirim Yönetimi', description: 'İndirim politikalarını yönetme', category: 'Kampanya' },
    
    // Ajans Yönetimi
    { id: 'agency-management', name: 'Ajans Yönetimi', description: 'Ajansları yönetme ve komisyon ayarları', category: 'Ajans' },
    { id: 'agency-commission', name: 'Ajans Komisyonu', description: 'Ajans komisyon oranlarını belirleme', category: 'Ajans' },
    
    // Raporlar ve Analiz
    { id: 'reports', name: 'Raporlar', description: 'Raporları görüntüleme, oluşturma', category: 'Analiz' },
    { id: 'statistics', name: 'İstatistikler', description: 'Sistem istatistiklerini görüntüleme', category: 'Analiz' },
    { id: 'analytics', name: 'Analitik', description: 'Detaylı analiz raporları', category: 'Analiz' },
    { id: 'dashboard', name: 'Dashboard', description: 'Ana dashboard görüntüleme', category: 'Analiz' }
  ]

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId)
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        }
      }
      return role
    }))
  }

  const getPermissionCategory = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category)
    return categoryPermissions
  }

  const categories = Array.from(new Set(permissions.map(p => p.category)))

  return (
    <div className="space-y-6">
      {/* Yetki Matrisi */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <div className="min-w-max">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                  Yetki
                </th>
                {roles.map(role => (
                  <th key={role.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <div className="truncate" title={role.name}>
                      {role.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <React.Fragment key={category}>
                  <tr className="bg-gray-50">
                    <td colSpan={roles.length + 1} className="px-4 py-2">
                      <h4 className="text-sm font-medium text-gray-900">{category}</h4>
                    </td>
                  </tr>
                  {getPermissionCategory(category).map(permission => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{permission.description}</div>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={role.id} className="px-2 py-3 text-center">
                          <button
                            onClick={() => handlePermissionToggle(role.id, permission.id)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                              role.permissions.includes(permission.id)
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {role.permissions.includes(permission.id) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={() => onSave(roles)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Yetkileri Kaydet
        </button>
      </div>
    </div>
  )
} 