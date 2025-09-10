'use client'
import { useState, useEffect } from 'react'
import { Mail, Send, Users, FileText, BarChart3, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'reservation' | 'marketing' | 'system'
  lastUsed: string
  status: 'active' | 'draft' | 'archived'
}

interface EmailStats {
  totalSent: number
  openRate: number
  clickRate: number
  bounceRate: number
  todaySent: number
}

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState('email')
  const [emailTab, setEmailTab] = useState('dashboard')
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    todaySent: 0
  })
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [emailSettings, setEmailSettings] = useState<any>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'welcome' as 'welcome' | 'reservation' | 'marketing' | 'system'
  })
  const [settingsForm, setSettingsForm] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    dailyLimit: '',
    rateLimit: ''
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [emailQueue, setEmailQueue] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState(false)
  const [emailType, setEmailType] = useState<'single' | 'bulk'>('single')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  useEffect(() => {
    fetchEmailData()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data)
        }
      }
    } catch (error) {
      console.error('Kullanıcılar alınamadı:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchEmailData = async () => {
    try {
      setIsLoading(true)

      // Email istatistiklerini çek
      const statsResponse = await fetch('/api/email/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setEmailStats(statsData.data)
        }
      }

      // Email template'lerini çek
      const templatesResponse = await fetch('/api/email/templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        if (templatesData.success) {
          setTemplates(templatesData.data)
        }
      }

      // Email ayarlarını çek
      const settingsResponse = await fetch('/api/email/settings')
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData.success) {
          setEmailSettings(settingsData.data)
          setSettingsForm({
            smtpHost: settingsData.data.smtpHost || '',
            smtpPort: settingsData.data.smtpPort?.toString() || '',
            smtpUser: settingsData.data.smtpUser || '',
            smtpPassword: settingsData.data.smtpPassword || '',
            fromEmail: settingsData.data.fromEmail || '',
            fromName: settingsData.data.fromName || '',
            dailyLimit: settingsData.data.dailyLimit?.toString() || '',
            rateLimit: settingsData.data.rateLimit?.toString() || ''
          })
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Email verileri alınamadı:', error)
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateForm)
      })

      const data = await response.json()

      if (data.success) {
        if (editingTemplate) {
          // Template güncelleme
          setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...data.data } : t))
        } else {
          // Yeni template oluşturma
          setTemplates([...templates, data.data])
        }
        setShowTemplateModal(false)
        setEditingTemplate(null)
        setTemplateForm({ name: '', subject: '', content: '', type: 'welcome' })
      }
    } catch (error) {
      console.error('Template oluşturma hatası:', error)
    }
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type
    })
    setEmailTab('send')
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type
    })
    setShowTemplateModal(true)
  }

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true)
      setSettingsError(null)
      setSettingsSuccess(null)

      const response = await fetch('/api/email/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsForm)
      })

      const data = await response.json()

      if (data.success) {
        setSettingsSuccess('Ayarlar başarıyla kaydedildi!')
        setTimeout(() => setSettingsSuccess(null), 3000)
      } else {
        setSettingsError(data.message || 'Ayarlar kaydedilemedi')
      }
    } catch (error) {
      setSettingsError('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSendEmail = async (formData: any) => {
    try {
      setSendingEmail(true)
      setSendError(null)
      setSendSuccess(null)

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        if (formData.recipientType === 'bulk') {
          const recipientEmails = JSON.parse(formData.recipientEmails as string)
          setSendSuccess(`${recipientEmails.length} kişiye email başarıyla gönderildi!`)
        } else {
          setSendSuccess('Email başarıyla gönderildi!')
        }
        setTimeout(() => setSendSuccess(null), 5000)
        
        // Toplu gönderim sonrası seçimleri temizle
        if (formData.recipientType === 'bulk') {
          setSelectedUsers([])
        }
      } else {
        setSendError(data.message || 'Email gönderilemedi')
      }
    } catch (error) {
      setSendError('Email gönderilirken hata oluştu')
    } finally {
      setSendingEmail(false)
    }
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Users className="h-4 w-4" />
      case 'reservation': return <FileText className="h-4 w-4" />
      case 'marketing': return <Send className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

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
                  <Mail className="h-6 w-6 mr-2" />
                  Email Yönetimi
                </h1>
                <p className="text-gray-600 mt-1">Email gönderimi ve template yönetimi</p>
              </div>

              {/* Tab Navigation */}
              <div className="mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                    { id: 'send', name: 'Email Gönder', icon: Send },
                    { id: 'templates', name: 'Template\'ler', icon: FileText },
                    { id: 'logs', name: 'Loglar', icon: FileText },
                    { id: 'queue', name: 'Kuyruk', icon: Clock },
                    { id: 'settings', name: 'Ayarlar', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setEmailTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          emailTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Dashboard Tab */}
                {emailTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Send className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Toplam Gönderilen</p>
                            <p className="text-2xl font-bold text-blue-900">{emailStats.totalSent}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Açılma Oranı</p>
                            <p className="text-2xl font-bold text-green-900">%{emailStats.openRate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Tıklama Oranı</p>
                            <p className="text-2xl font-bold text-purple-900">%{emailStats.clickRate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-red-600">Bounce Oranı</p>
                            <p className="text-2xl font-bold text-red-900">%{emailStats.bounceRate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Send className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Hoş geldiniz emaili gönderildi</p>
                                <p className="text-xs text-gray-500">2 saat önce</p>
                              </div>
                            </div>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Başarılı</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Rezervasyon onayı kuyruğa eklendi</p>
                                <p className="text-xs text-gray-500">5 saat önce</p>
                              </div>
                            </div>
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Bekliyor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Send Email Tab */}
                {emailTab === 'send' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Gönder</h3>
                      
                      {/* Email Türü Seçimi */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Gönderim Türü</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="emailType"
                              value="single"
                              checked={emailType === 'single'}
                              onChange={(e) => setEmailType(e.target.value as 'single' | 'bulk')}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Tekli Gönderim</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="emailType"
                              value="bulk"
                              checked={emailType === 'bulk'}
                              onChange={(e) => setEmailType(e.target.value as 'single' | 'bulk')}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Toplu Gönderim</span>
                          </label>
                        </div>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target as HTMLFormElement)
                        const data = Object.fromEntries(formData.entries())
                        
                        if (emailType === 'bulk') {
                          data.recipientType = 'bulk'
                          data.recipientEmails = JSON.stringify(selectedUsers)
                        } else {
                          data.recipientType = 'single'
                        }
                        
                        handleSendEmail(data)
                      }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {emailType === 'single' ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alıcı Email
                              </label>
                              <input
                                type="email"
                                name="to"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ornek@email.com"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seçili Kullanıcılar ({selectedUsers.length})
                              </label>
                              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                {usersLoading ? (
                                  <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Kullanıcılar yükleniyor...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedUsers(users.map(u => u.email))
                                          } else {
                                            setSelectedUsers([])
                                          }
                                        }}
                                        className="mr-2"
                                      />
                                      <span className="text-sm font-medium text-gray-700">Tümünü Seç</span>
                                    </div>
                                    {users.map((user) => (
                                      <div key={user.id} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.includes(user.email)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedUsers([...selectedUsers, user.email])
                                            } else {
                                              setSelectedUsers(selectedUsers.filter(email => email !== user.email))
                                            }
                                          }}
                                          className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">{user.name} ({user.email})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Konu
                            </label>
                            <input
                              type="text"
                              name="subject"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Email konusu"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            İçerik
                          </label>
                          <textarea
                            name="content"
                            rows={10}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email içeriği..."
                          />
                        </div>
                        {sendSuccess && (
                          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {sendSuccess}
                          </div>
                        )}
                        {sendError && (
                          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {sendError}
                          </div>
                        )}
                        <div className="mt-6 flex justify-end">
                          <button
                            type="submit"
                            disabled={sendingEmail || (emailType === 'bulk' && selectedUsers.length === 0)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {sendingEmail ? 'Gönderiliyor...' : 
                             emailType === 'bulk' ? `Toplu Gönder (${selectedUsers.length} kişi)` : 'Gönder'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Templates Tab */}
                {emailTab === 'templates' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Email Template'leri</h3>
                      <button
                        onClick={() => setShowTemplateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Yeni Template
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templates.map((template) => (
                        <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              {getTemplateIcon(template.type)}
                              <h4 className="ml-2 text-sm font-medium text-gray-900">{template.name}</h4>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(template.status)}`}>
                              {template.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{template.subject}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUseTemplate(template)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Kullan
                            </button>
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logs Tab */}
                {emailTab === 'logs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Email Logları</h3>
                      <button
                        onClick={() => {
                          setLogsLoading(true)
                          fetch('/api/email/logs')
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setEmailLogs(data.data.logs)
                              }
                              setLogsLoading(false)
                            })
                            .catch(() => setLogsLoading(false))
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Yenile
                      </button>
                    </div>
                    
                    {logsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alıcı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gönderim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açılma</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tıklama</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {emailLogs.map((log) => (
                                <tr key={log.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{log.recipientName}</div>
                                      <div className="text-sm text-gray-500">{log.recipientEmail}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{log.subject}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      log.status === 'sent' ? 'bg-green-100 text-green-800' :
                                      log.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                      log.status === 'bounced' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.sentAt).toLocaleString('tr-TR')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.openedAt ? new Date(log.openedAt).toLocaleString('tr-TR') : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.clickedAt ? new Date(log.clickedAt).toLocaleString('tr-TR') : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Queue Tab */}
                {emailTab === 'queue' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Email Kuyruğu</h3>
                      <button
                        onClick={() => {
                          setQueueLoading(true)
                          fetch('/api/email/queue')
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setEmailQueue(data.data.queue)
                              }
                              setQueueLoading(false)
                            })
                            .catch(() => setQueueLoading(false))
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Yenile
                      </button>
                    </div>
                    
                    {queueLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alıcı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zamanlama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {emailQueue.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{item.recipientName}</div>
                                      <div className="text-sm text-gray-500">{item.recipientEmail}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{item.subject}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      item.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {item.priority}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                      item.status === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.scheduledAt).toLocaleString('tr-TR')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      {item.status === 'failed' && (
                                        <button className="text-blue-600 hover:text-blue-900">Tekrar Dene</button>
                                      )}
                                      <button className="text-red-600 hover:text-red-900">İptal</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {emailTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP Ayarları</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveSettings()
                      }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Host
                            </label>
                            <input
                              type="text"
                              value={settingsForm.smtpHost}
                              onChange={(e) => setSettingsForm({...settingsForm, smtpHost: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Port
                            </label>
                            <input
                              type="number"
                              value={settingsForm.smtpPort}
                              onChange={(e) => setSettingsForm({...settingsForm, smtpPort: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="587"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Kullanıcı
                            </label>
                            <input
                              type="text"
                              value={settingsForm.smtpUser}
                              onChange={(e) => setSettingsForm({...settingsForm, smtpUser: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="kullanici@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Şifre
                            </label>
                            <input
                              type="password"
                              value={settingsForm.smtpPassword}
                              onChange={(e) => setSettingsForm({...settingsForm, smtpPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gönderen Email
                            </label>
                            <input
                              type="email"
                              value={settingsForm.fromEmail}
                              onChange={(e) => setSettingsForm({...settingsForm, fromEmail: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="noreply@gurbet.biz"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gönderen Adı
                            </label>
                            <input
                              type="text"
                              value={settingsForm.fromName}
                              onChange={(e) => setSettingsForm({...settingsForm, fromName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Gurbet.biz"
                            />
                          </div>
                        </div>
                        {settingsSuccess && (
                          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {settingsSuccess}
                          </div>
                        )}
                        {settingsError && (
                          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {settingsError}
                          </div>
                        )}
                        <div className="mt-6 flex justify-end">
                          <button
                            type="submit"
                            disabled={savingSettings}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {savingSettings ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTemplate ? 'Template Düzenle' : 'Yeni Template'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Adı
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Template adı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konu
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email konusu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Türü
                </label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({...templateForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Hoş Geldiniz</option>
                  <option value="reservation">Rezervasyon</option>
                  <option value="marketing">Pazarlama</option>
                  <option value="system">Sistem</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İçerik
                </label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email içeriği..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                  setTemplateForm({ name: '', subject: '', content: '', type: 'welcome' })
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingTemplate ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}