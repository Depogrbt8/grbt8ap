'use client'
import { User, Calendar, Clock, Edit, Save, CreditCard, X, Mail, Phone, MapPin } from 'lucide-react'

interface User {
  id: number
  name: string
  customerNo: string
  email: string
  phone: string
  status: string
  city: string
  address: string
  joinDate: string
  lastLogin: string
}

interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export default function UserModal({ user, isOpen, onClose }: UserModalProps) {
  if (!isOpen || !user) return null

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Modal Content */}
        <div className="admin-modal-content">

          <div className="space-y-6">
            {/* Hesap Bilgileri - Başta */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">Hesap Bilgileri</h3>
              <div className="flex">
                <div className="p-2 bg-gray-50 rounded-l-md border-r border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Numara</p>
                  <p className="text-xs text-gray-500">{user.customerNo}</p>
                </div>
                <div className="p-2 bg-gray-50 border-r border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Durum</p>
                  <p className="text-xs text-gray-500">{user.status}</p>
                </div>
                <div className="p-2 bg-gray-50 border-r border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Kayıt Tarihi</p>
                  <p className="text-xs text-gray-500">{user.joinDate}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-r-md">
                  <p className="text-sm font-medium text-gray-900">Son Giriş</p>
                  <p className="text-xs text-gray-500">{user.lastLogin}</p>
                </div>
              </div>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">Kullanıcı Bilgileri</h3>
              <div className="grid grid-cols-6 gap-2 mb-3">
                <div>
                  <input 
                    type="text" 
                    placeholder="Ad"
                    defaultValue={user.name?.split(' ')[0] || ''}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Soyad"
                    defaultValue={user.name?.split(' ')[1] || ''}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="TC Kimlik No"
                    defaultValue=""
                    maxLength={11}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select 
                    defaultValue=""
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Cinsiyet</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="date" 
                    defaultValue=""
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="E-posta"
                    defaultValue={user.email}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-28">
                  <select 
                    defaultValue="+90"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="+90">🇹🇷 TR (+90)</option>
                    <option value="+49">🇩🇪 DE (+49)</option>
                    <option value="+44">🇬🇧 UK (+44)</option>
                    <option value="+33">🇫🇷 FR (+33)</option>
                  </select>
                </div>
                <div className="w-36">
                  <input 
                    type="tel" 
                    placeholder="Telefon"
                    defaultValue={user.phone}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Adres"
                    defaultValue={user.address}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* İşlemler */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">İşlemler</h3>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="admin-modal-footer">
          <button 
            onClick={onClose}
            className="admin-btn admin-btn-secondary flex items-center space-x-1"
          >
            <X className="h-3 w-3" />
            <span>Kapat</span>
          </button>
          <button className="admin-btn admin-btn-primary flex items-center space-x-1">
            <Save className="h-3 w-3" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  )
} 