'use client'
import { Edit, Trash2, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'


interface User {
  id: string
  name: string
  customerNo: string
  email: string
  phone: string
  status: string
  city: string
  address: string
  joinDate: string
  lastLogin: string
  role?: string
  isForeigner?: string
  emailVerified?: string
  passengerCount?: number
  alertCount?: number
  favoriteCount?: number
  reservationCount?: number
  paymentCount?: number
  birthDay?: string
  birthMonth?: string
  birthYear?: string
  gender?: string
  identityNumber?: string
}

interface UserListProps {
  users: User[]
  onUserClick?: (user: User) => void
  onUserDelete?: (userId: string) => void
  onBulkAction?: (action: string, userIds: string[]) => void
}

export default function UserList({ users, onUserClick, onUserDelete, onBulkAction }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tümü')
  const [ageFilter, setAgeFilter] = useState('Tümü')
  const [countryFilter, setCountryFilter] = useState('Tümü')
  const [hometownFilter, setHometownFilter] = useState('Tümü')
  const [sortBy, setSortBy] = useState('En Yeni')
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDay: string, birthMonth: string, birthYear: string): number | null => {
    if (!birthDay || !birthMonth || !birthYear) return null
    
    try {
      const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay))
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age
    } catch (error) {
      return null
    }
  }

  // Yaş aralığı kontrolü
  const isInAgeRange = (user: User, ageRange: string): boolean => {
    if (ageRange === 'Tümü') return true
    
    const age = calculateAge(user.birthDay || '', user.birthMonth || '', user.birthYear || '')
    if (age === null) return false
    
    switch (ageRange) {
      case '18-25':
        return age >= 18 && age <= 25
      case '26-35':
        return age >= 26 && age <= 35
      case '36-45':
        return age >= 36 && age <= 45
      case '46+':
        return age >= 46
      default:
        return true
    }
  }



  // Kullanıcı silme fonksiyonu
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    try {
      setDeletingUsers(prev => new Set(prev).add(userId))
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Kullanıcı listesini yenile
        if (onUserDelete) {
          onUserDelete(userId)
        }
        alert('Kullanıcı başarıyla silindi!')
      } else {
        alert(data.error || 'Kullanıcı silinemedi')
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error)
      alert('Kullanıcı silinirken hata oluştu')
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  // Toplu işlem fonksiyonları
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return

    const selectedUserIds = Array.from(selectedUsers)
    
    if (bulkAction === 'delete') {
      if (!confirm(`${selectedUserIds.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) {
        return
      }
    }

    try {
      if (bulkAction === 'export-csv') {
        // CSV dışa aktarma işlemi
        const userIdsParam = selectedUserIds.join(',')
        const response = await fetch(`/api/users/export?userIds=${userIdsParam}`)
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
          alert(`${selectedUserIds.length} kullanıcı CSV olarak dışa aktarıldı!`)
        } else {
          alert('CSV dışa aktarma başarısız')
        }
      } else if (onBulkAction) {
        onBulkAction(bulkAction, selectedUserIds)
      }
      
      // Başarılı işlem sonrası seçimleri temizle
      setSelectedUsers(new Set())
      setBulkAction('')
    } catch (error) {
      console.error('Toplu işlem hatası:', error)
      alert('Toplu işlem sırasında hata oluştu')
    }
  }

  // Filtrelenmiş ve sıralanmış kullanıcılar
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Arama filtresi
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.toLowerCase().includes(searchLower) ||
        user.customerNo.toLowerCase().includes(searchLower)

      // Durum filtresi
      const matchesStatus = statusFilter === 'Tümü' || user.status === statusFilter

      // Yaş filtresi
      const matchesAge = isInAgeRange(user, ageFilter)

      return matchesSearch && matchesStatus && matchesAge
    })

    // Sıralama
    switch (sortBy) {
      case 'En Yeni':
        filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
        break
      case 'En Eski':
        filtered.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime())
        break
      case 'İsim A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'İsim Z-A':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return filtered
  }, [users, searchTerm, statusFilter, ageFilter, countryFilter, hometownFilter, sortBy])

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Filtreleme ve Arama */}
      <div className="bg-white rounded-lg shadow p-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Arama */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Kullanıcı adı, email veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filtreleme */}
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Tümü</option>
                <option>Aktif</option>
                <option>Pasif</option>
                <option>Beklemede</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yaş</label>
              <select 
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Tümü</option>
                <option>18-25</option>
                <option>26-35</option>
                <option>36-45</option>
                <option>46+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ülke</label>
              <select 
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Tümü</option>
                <option>Türkiye</option>
                <option>Almanya</option>
                <option>Hollanda</option>
                <option>Belçika</option>
                <option>İsviçre</option>
                <option>Danimarka</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Memleket</label>
              <select 
                value={hometownFilter}
                onChange={(e) => setHometownFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Tümü</option>
                <option>İstanbul</option>
                <option>Ankara</option>
                <option>İzmir</option>
                <option>Bursa</option>
                <option>Antalya</option>
                <option>Adana</option>
                <option>Konya</option>
                <option>Gaziantep</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>En Yeni</option>
                <option>En Eski</option>
                <option>İsim A-Z</option>
                <option>İsim Z-A</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Arama Sonuçları Bilgisi */}
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            "{searchTerm}" için {filteredUsers.length} sonuç bulundu
          </div>
        )}
      </div>

      {/* Toplu İşlemler */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.size} kullanıcı seçildi
              </span>
              <select 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">İşlem seçin</option>
                <option value="activate">Aktif Yap</option>
                <option value="deactivate">Pasif Yap</option>
                <option value="delete">Sil</option>
                <option value="export-csv">CSV Dışa Aktar</option>
              </select>
              <button 
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className={`px-3 py-1 text-sm rounded-md ${
                  bulkAction 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Uygula
              </button>
            </div>
            <button 
              onClick={() => setSelectedUsers(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Seçimi Temizle
            </button>
          </div>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Kullanıcı Listesi</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSelectAll}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {selectedUsers.size === filteredUsers.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Tümünü Seç</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tablo Başlıkları */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-4 text-[10px] font-medium text-gray-700">
            <div className="w-4"></div>
            <div className="w-24">Ad Soyad</div>
            <div className="w-16">Müşteri No</div>
            <div className="w-32">Email</div>
            <div className="w-28">Telefon</div>
            <div className="w-8">Yaş</div>
            <div className="w-12">Cinsiyet</div>
            <div className="w-20">TC No</div>
            <div className="w-16">Durum</div>
            <div className="w-8">İşlem</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500 text-sm">
                  {searchTerm ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' : 'Kullanıcı bulunamadı.'}
                </div>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const age = calculateAge(user.birthDay || '', user.birthMonth || '', user.birthYear || '')
                const isDeleting = deletingUsers.has(user.id)
                const isSelected = selectedUsers.has(user.id)
                return (
                  <div key={user.id} className="px-4 py-2 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-[10px] min-w-0">
                        <button 
                          onClick={() => handleSelectUser(user.id)}
                          className="flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <Link 
                          href={`/kullanici/${user.id}`}
                          className="font-medium text-gray-900 text-[12px] w-24 cursor-pointer hover:text-blue-600 hover:underline truncate"
                        >
                          {user.name}
                        </Link>
                        <span className="text-blue-600 font-medium w-16 flex-shrink-0">{user.customerNo}</span>
                        <span className="text-gray-500 w-32 truncate">{user.email}</span>
                        <span className="text-gray-500 w-28 truncate">{user.phone}</span>
                        {age && <span className="text-gray-500 w-8 flex-shrink-0">{age}</span>}
                        {user.gender && <span className="text-gray-500 w-12 flex-shrink-0">{user.gender}</span>}
                        {user.identityNumber && <span className="text-gray-500 w-20 flex-shrink-0">{user.identityNumber}</span>}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-[10px] rounded-full ${
                          user.status === 'Aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'Beklemede'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                        <Link 
                          href={`/kullanici/${user.id}`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={isDeleting}
                          className={`p-1 ${
                            isDeleting 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Sayfalama */}
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredUsers.length} kullanıcı gösteriliyor
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Önceki</button>
              <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</span>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Sonraki</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 