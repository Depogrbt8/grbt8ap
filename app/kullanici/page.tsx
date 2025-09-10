'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import UserList from '../components/users/UserList'
import { Users, UserCheck, UserX, Clock, RefreshCw } from 'lucide-react'

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

export default function KullaniciPage() {
  const [activeTab, setActiveTab] = useState('users')

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string>('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
        setLastUpdate(new Date().toLocaleTimeString('tr-TR'))
      } else {
        setError(data.error || 'Kullanıcı listesi getirilemedi')
      }
    } catch (err) {
      setError('Kullanıcı listesi yüklenirken hata oluştu')
      console.error('Kullanıcı yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserDelete = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
  }

  const handleSyncUsers = async () => {
    try {
      setSyncing(true)
      setSyncMessage('Ana sitedeki kullanıcılar senkronize ediliyor...')
      
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceDbPath: '/Users/incesu/Desktop/grbt8/prisma/dev.db'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSyncMessage(`Senkronizasyon tamamlandı! ${data.stats.syncedCount} yeni kullanıcı eklendi, ${data.stats.skippedCount} kullanıcı güncellendi.`)
        // Kullanıcı listesini yenile
        await fetchUsers()
      } else {
        setSyncMessage(`Senkronizasyon hatası: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncMessage('Senkronizasyon sırasında hata oluştu!')
    } finally {
      setSyncing(false)
      // 3 saniye sonra mesajı temizle
      setTimeout(() => {
        setSyncMessage('')
      }, 3000)
    }
  }

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          // Kullanıcıları aktif yap
          setUsers(prevUsers => 
            prevUsers.map(user => 
              userIds.includes(user.id) 
                ? { ...user, status: 'Aktif' }
                : user
            )
          )
          alert(`${userIds.length} kullanıcı aktif yapıldı!`)
          break
          
        case 'deactivate':
          // Kullanıcıları pasif yap
          setUsers(prevUsers => 
            prevUsers.map(user => 
              userIds.includes(user.id) 
                ? { ...user, status: 'Pasif' }
                : user
            )
          )
          alert(`${userIds.length} kullanıcı pasif yapıldı!`)
          break
          
        case 'delete':
          // Kullanıcıları sil
          setUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)))
          alert(`${userIds.length} kullanıcı silindi!`)
          break
          
        case 'export-csv':
          // Kullanıcıları CSV dışa aktar
          try {
            const response = await fetch(`/api/users/export?userIds=${userIds.join(',')}`)
            
            if (response.ok) {
              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              window.URL.revokeObjectURL(url)
              alert(`${userIds.length} kullanıcı CSV olarak dışa aktarıldı!`)
            } else {
              alert('CSV dışa aktarma başarısız!')
            }
          } catch (error) {
            console.error('Export hatası:', error)
            alert('CSV dışa aktarma sırasında hata oluştu!')
          }
          break
          

          
        default:
          alert('Geçersiz işlem!')
      }
    } catch (error) {
      console.error('Toplu işlem hatası:', error)
      alert('Toplu işlem sırasında hata oluştu')
    }
  }

  // İstatistikler
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'Aktif').length
  const inactiveUsers = users.filter(user => user.status === 'Pasif').length

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Kullanıcılar yükleniyor...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-red-600 text-xl mb-4">⚠️ Hata</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={fetchUsers}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 overflow-hidden">
          {/* Senkronizasyon Mesajı */}
          {syncMessage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <RefreshCw className={`h-5 w-5 text-blue-600 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                <p className="text-blue-800">{syncMessage}</p>
              </div>
            </div>
          )}

          {/* Senkronizasyon Butonu */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
            <button
              onClick={handleSyncUsers}
              disabled={syncing}
              className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                syncing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Senkronize Ediliyor...' : 'Ana Siteden Senkronize Et'}
            </button>
          </div>

          {/* İstatistikler */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pasif</p>
                    <p className="text-2xl font-bold text-gray-900">{inactiveUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Son güncelleme</p>
                    <p className="text-sm font-bold text-gray-900">{lastUpdate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kullanıcı Listesi */}
          <div className="h-full">
            <UserList 
              users={users} 
              onUserDelete={handleUserDelete}
              onBulkAction={handleBulkAction}
            />
          </div>
        </main>
      </div>
    </div>
  )
} 