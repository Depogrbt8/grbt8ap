'use client'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface Admin {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
}

interface AdminListProps {
  admins: Admin[]
  onEdit: (admin: Admin) => void
  onDelete: (admin: Admin) => void
  onToggleStatus: (admin: Admin) => void
}

export default function AdminList({ admins, onEdit, onDelete, onToggleStatus }: AdminListProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800'
      case 'Admin':
        return 'bg-blue-100 text-blue-800'
      case 'Moderator':
        return 'bg-green-100 text-green-800'
      case 'Satış':
        return 'bg-purple-100 text-purple-800'
      case 'Temsilci':
        return 'bg-yellow-100 text-yellow-800'
      case 'Email Yöneticisi':
        return 'bg-indigo-100 text-indigo-800'
      case 'API Yöneticisi':
        return 'bg-orange-100 text-orange-800'
      case 'Viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Son Giriş
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kayıt Tarihi
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin) => (
            <tr key={admin.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {admin.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                  {admin.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                  {admin.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.lastLogin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.createdAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onToggleStatus(admin)}
                    className="text-gray-400 hover:text-gray-600"
                    title={admin.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                  >
                    {admin.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => onEdit(admin)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(admin)}
                    className="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 