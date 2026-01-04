'use client'
import { Calendar, Clock, User, Layout, Megaphone, CreditCard, FileText, Settings, BookOpen, BarChart3, Search, Mail, Code, Globe, LogOut, Building2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [adminPermissions, setAdminPermissions] = useState<any>({})
  const [currentDateTime, setCurrentDateTime] = useState({ date: '', time: '' })

  // Tarih ve saati güncelle
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      // Paris/Fransa zaman dilimi (CET/CEST - GMT+1/+2)
      const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
      
      const dateStr = parisTime.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      
      const timeStr = parisTime.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      setCurrentDateTime({ date: dateStr, time: timeStr })
    }

    // İlk güncelleme
    updateDateTime()

    // Her saniye güncelle
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Admin yetkilerini yükle
  useEffect(() => {
    if (session?.user?.email) {
      fetchAdminPermissions()
    }
  }, [session])

  const fetchAdminPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdminPermissions(data.permissions || {})
        }
      }
    } catch (error) {
      console.error('Admin yetkileri yüklenemedi:', error)
    }
  }

  // Sayfa yetkisi kontrolü
  const hasPagePermission = (page: string) => {
    return adminPermissions[page] === true
  }

  // Sayfa link'i render etme
  const renderPageLink = (href: string, page: string, icon: any, label: string, onClick: () => void) => {
    const hasPermission = hasPagePermission(page)
    
    if (!hasPermission) {
      return (
        <div 
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-50"
          title="Bu sayfaya erişim yetkiniz yok"
        >
          {icon}
          <span>{label}</span>
        </div>
      )
    }

    return (
      <Link 
        href={href}
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
          pathname === href 
            ? 'text-gray-900 bg-blue-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    )
  }

  const handleLogout = async () => {
    try {
      // NextAuth'ın kendi signOut fonksiyonunu kullan
      await signOut({ 
        redirect: false,
        callbackUrl: 'https://www.grbt8.store/'
      })
      
      // Session temizlendikten sonra localStorage'ı da temizle
      localStorage.clear()
      sessionStorage.clear()
      
      // Cookie'leri temizle
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      
      // Ana sayfaya yönlendir (hard redirect)
      window.location.replace('https://www.grbt8.store/')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Hata durumunda da yönlendir
      window.location.replace('https://www.grbt8.store/')
    }
  }
  
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Zaman/Tarih Alanı */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span className="admin-text-xs">{currentDateTime.date}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 mt-1">
          <Clock className="h-3 w-3" />
          <span className="admin-text-xs">{currentDateTime.time}</span>
        </div>
      </div>

      {/* Admin Bilgisi Alanı */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <div>
            <div className="admin-text-xs">Admin</div>
            <div className="admin-text-xs">Yönetici</div>
          </div>
        </div>
      </div>

      {/* Sekmeler - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 admin-space-y-2">
          {renderPageLink('/dashboard', 'dashboard', <BarChart3 className="h-3 w-3" />, 'Dashboard', () => setActiveTab('dashboard'))}
          {renderPageLink('/sistem', 'system', <Layout className="h-3 w-3" />, 'Sistem', () => setActiveTab('sistem'))}
          {renderPageLink('/kullanici', 'users', <User className="h-3 w-3" />, 'Kullanıcılar', () => setActiveTab('users'))}
          {renderPageLink('/seo', 'seo', <Search className="h-3 w-3" />, 'SEO', () => setActiveTab('seo'))}
          {renderPageLink('/email', 'email', <Mail className="h-3 w-3" />, 'Email', () => setActiveTab('email'))}
          {renderPageLink('/apiler', 'api', <Code className="h-3 w-3" />, 'API', () => setActiveTab('apiler'))}
          {renderPageLink('/dis-apiler', 'externalApi', <Globe className="h-3 w-3" />, 'Dış API', () => setActiveTab('dis-apiler'))}
          {renderPageLink('/rezervasyonlar', 'reservations', <BookOpen className="h-3 w-3" />, 'Rezervasyonlar', () => setActiveTab('rezervasyonlar'))}
          {renderPageLink('/oteller/rezervasyonlar', 'reservations', <Building2 className="h-3 w-3" />, 'Otel Rezervasyonları', () => setActiveTab('oteller'))}
          {renderPageLink('/ucuslar', 'flights', <Calendar className="h-3 w-3" />, 'Uçuşlar', () => setActiveTab('ucuslar'))}
          {renderPageLink('/odemeler', 'payments', <CreditCard className="h-3 w-3" />, 'Ödemeler', () => setActiveTab('odemeler'))}
          {renderPageLink('/raporlar', 'reports', <FileText className="h-3 w-3" />, 'Raporlar', () => setActiveTab('raporlar'))}
          {renderPageLink('/istatistikler', 'statistics', <BarChart3 className="h-3 w-3" />, 'İstatistikler', () => setActiveTab('istatistikler'))}
          {renderPageLink('/ayarlar', 'settings', <Settings className="h-3 w-3" />, 'Ayarlar', () => setActiveTab('ayarlar'))}
          
          {/* Çıkış Sekmesi */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="h-3 w-3" />
            <span>Çıkış</span>
          </button>
        </nav>
      </div>
    </div>
  )
} 