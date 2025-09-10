'use client'
import { Calendar, Clock, User, Layout, Megaphone, CreditCard, FileText, Settings, BookOpen, BarChart3, Search, Mail, Code, Globe, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Zaman/Tarih Alanı */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">19 Temmuz 2024</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 mt-1">
          <Clock className="h-4 w-4" />
          <span className="text-sm">18:30</span>
        </div>
      </div>

      {/* Admin Bilgisi Alanı */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">Yönetici</div>
          </div>
        </div>
      </div>

      {/* Sekmeler - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          <Link 
            href="/dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/dashboard' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/sistem"
            onClick={() => setActiveTab('sistem')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/sistem' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Layout className="h-4 w-4" />
            <span>Sistem</span>
          </Link>
          <Link 
            href="/kullanici"
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/kullanici' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Kullanıcılar</span>
          </Link>
          <Link 
            href="/kampanyalar"
            onClick={() => setActiveTab('kampanyalar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/kampanyalar' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Kampanyalar</span>
          </Link>
          <Link 
            href="/seo"
            onClick={() => setActiveTab('seo')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/seo' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </Link>
          <Link 
            href="/email"
            onClick={() => setActiveTab('email')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/email' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </Link>
          <Link 
            href="/apiler"
            onClick={() => setActiveTab('apiler')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/apiler' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>API</span>
          </Link>
          <Link 
            href="/dis-apiler"
            onClick={() => setActiveTab('dis-apiler')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/dis-apiler' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Dış API</span>
          </Link>
          <Link 
            href="/calismalarim"
            onClick={() => setActiveTab('calismalarim')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/calismalarim' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Çalışmalarım</span>
          </Link>
          <Link 
            href="/rezervasyonlar"
            onClick={() => setActiveTab('rezervasyonlar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/rezervasyonlar' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Rezervasyonlar</span>
          </Link>
          <Link 
            href="/ucuslar"
            onClick={() => setActiveTab('ucuslar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/ucuslar' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Uçuşlar</span>
          </Link>
          <Link 
            href="/odemeler"
            onClick={() => setActiveTab('odemeler')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/odemeler' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Ödemeler</span>
          </Link>
          <Link 
            href="/raporlar"
            onClick={() => setActiveTab('raporlar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/raporlar' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Raporlar</span>
          </Link>
          <Link 
            href="/istatistikler"
            onClick={() => setActiveTab('istatistikler')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/istatistikler' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>İstatistikler</span>
          </Link>
          <Link 
            href="/ayarlar"
            onClick={() => setActiveTab('ayarlar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/ayarlar' 
                ? 'text-gray-900 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Ayarlar</span>
          </Link>
        </nav>
      </div>
    </div>
  )
} 