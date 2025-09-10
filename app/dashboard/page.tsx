'use client'

import { useState } from 'react'
import { BarChart3, Users, Mail, CreditCard, Calendar, FileText, Settings, Search, Globe, Briefcase, BookOpen, Megaphone, Code } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    { name: 'Toplam Kullanıcı', value: '12,847', icon: Users, color: 'blue' },
    { name: 'Aktif Rezervasyon', value: '1,234', icon: BookOpen, color: 'green' },
    { name: 'Email Gönderilen', value: '8,456', icon: Mail, color: 'purple' },
    { name: 'Toplam Gelir', value: '₺245,678', icon: CreditCard, color: 'yellow' }
  ]

  const quickActions = [
    { name: 'Sistem', href: '/sistem', icon: Settings, color: 'gray' },
    { name: 'Kullanıcılar', href: '/kullanici', icon: Users, color: 'blue' },
    { name: 'Kampanyalar', href: '/kampanyalar', icon: Megaphone, color: 'orange' },
    { name: 'SEO', href: '/seo', icon: Search, color: 'green' },
    { name: 'Email', href: '/email', icon: Mail, color: 'purple' },
    { name: 'API', href: '/apiler', icon: Code, color: 'indigo' },
    { name: 'Rezervasyonlar', href: '/rezervasyonlar', icon: BookOpen, color: 'pink' },
    { name: 'Uçuşlar', href: '/ucuslar', icon: Calendar, color: 'teal' },
    { name: 'Ödemeler', href: '/odemeler', icon: CreditCard, color: 'yellow' },
    { name: 'Raporlar', href: '/raporlar', icon: FileText, color: 'red' },
    { name: 'İstatistikler', href: '/istatistikler', icon: BarChart3, color: 'cyan' },
    { name: 'Ayarlar', href: '/ayarlar', icon: Settings, color: 'gray' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2" />
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Admin paneli genel bakış</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                          <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <a
                        key={action.name}
                        href={action.href}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg bg-${action.color}-100 mr-3`}>
                          <Icon className={`h-5 w-5 text-${action.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{action.name}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}