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
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testType, setTestType] = useState('welcome')
  const [testResult, setTestResult] = useState<any>(null)
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
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    fetchEmailData()
    fetchUsers()
    checkApiKeyStatus()
    fetchRecentActivities()
  }, [])

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/email/test')
      const data = await response.json()
      setApiKeyStatus(data.data)
    } catch (error) {
      console.error('API key durumu kontrol edilemedi:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/email/logs?limit=5')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.logs) {
          setRecentActivities(data.data.logs)
        }
      }
    } catch (error) {
      console.error('Son aktiviteler alınamadı:', error)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, error: 'Test email adresi gereklidir' })
      return
    }

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail,
          testType
        })
      })

      const data = await response.json()
      setTestResult(data)
      
      if (data.success) {
        setShowTestModal(false)
        setTestEmail('')
        setTestType('welcome')
        checkApiKeyStatus() // API key durumunu yenile
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Test email gönderilemedi' })
    }
  }

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

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Az önce'
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
    if (diffInHours < 24) return `${diffInHours} saat önce`
    if (diffInDays < 30) return `${diffInDays} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="admin-text-lg flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>Email Yönetimi</span>
            </h1>
            <p className="admin-text-xs">Email gönderimi ve template yönetimi</p>
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
                    <Icon className="h-3 w-3" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="admin-space-y-3">
            {/* Dashboard Tab */}
            {emailTab === 'dashboard' && (
              <div className="admin-space-y-3">
                {/* API Key Status & Test */}
                <div className="admin-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Sistemi Durumu</h3>
                    <button
                      onClick={() => setShowTestModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Test Email Gönder</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${apiKeyStatus?.apiKeyConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">
                        RESEND_API_KEY: {apiKeyStatus?.apiKeyConfigured ? '✅ Aktif' : '❌ Eksik'}
                      </span>
                    </div>
                    
                    {!apiKeyStatus?.apiKeyConfigured && (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          <a href="/RESEND_API_KEY_SETUP.md" target="_blank" className="underline hover:text-orange-700">
                            Kurulum rehberi
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {apiKeyStatus?.apiKeyConfigured && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ Email sistemi aktif. Gerçek email gönderimi yapılabilir.
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="admin-grid-4">
                  <div className="admin-card-small">
                    <div className="flex items-center space-x-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Send className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="admin-text-xs">Toplam Gönderilen</p>
                        <p className="admin-text-sm">{emailStats.totalSent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-small">
                    <div className="flex items-center space-x-1">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="admin-text-xs">Açılma Oranı</p>
                        <p className="admin-text-sm">%{emailStats.openRate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-small">
                    <div className="flex items-center space-x-1">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-3 w-3 text-purple-600" />
                      </div>
                      <div>
                        <p className="admin-text-xs">Tıklama Oranı</p>
                        <p className="admin-text-sm">%{emailStats.clickRate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-small">
                    <div className="flex items-center space-x-1">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="admin-text-xs">Bounce Oranı</p>
                        <p className="admin-text-sm">%{emailStats.bounceRate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Son Aktiviteler</h3>
                  </div>
                  <div className="admin-space-y-2">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => {
                        const statusConfig = {
                          sent: { icon: Send, color: 'blue', label: 'Gönderildi', badge: 'admin-badge-success' },
                          delivered: { icon: CheckCircle, color: 'green', label: 'Teslim Edildi', badge: 'admin-badge-success' },
                          bounced: { icon: AlertCircle, color: 'red', label: 'Geri Döndü', badge: 'admin-badge-error' },
                          failed: { icon: AlertCircle, color: 'red', label: 'Başarısız', badge: 'admin-badge-error' },
                          pending: { icon: Clock, color: 'yellow', label: 'Bekliyor', badge: 'admin-badge-warning' }
                        }
                        
                        const config = statusConfig[activity.status as keyof typeof statusConfig] || statusConfig.sent
                        const Icon = config.icon
                        const timeAgo = getTimeAgo(new Date(activity.sentAt))
                        
                        return (
                          <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-1">
                              <div className={`p-1 bg-${config.color}-100 rounded`}>
                                <Icon className={`h-3 w-3 text-${config.color}-600`} />
                              </div>
                              <div>
                                <p className="admin-text-xs">{activity.subject}</p>
                                <p className="admin-text-xs text-gray-500">{activity.recipientEmail} • {timeAgo}</p>
                              </div>
                            </div>
                            <span className={`admin-badge ${config.badge}`}>{config.label}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="admin-text-xs text-gray-500">Henüz email gönderilmedi</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Send Email Tab */}
            {emailTab === 'send' && (
              <div className="admin-space-y-3">
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Email Gönder</h3>
                  </div>
                  
                  {/* Email Türü Seçimi */}
                  <div className="mb-4">
                    <label className="admin-form-label">Gönderim Türü</label>
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
                        <span className="admin-text-xs">Tekli Gönderim</span>
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
                        <span className="admin-text-xs">Toplu Gönderim</span>
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
                    <div className="admin-grid-2">
                      {emailType === 'single' ? (
                        <div>
                          <label className="admin-form-label">
                            Alıcı Email
                          </label>
                          <input
                            type="email"
                            name="to"
                            required
                            className="admin-form-input"
                            placeholder="ornek@email.com"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="admin-form-label">
                            Seçili Kullanıcılar ({selectedUsers.length})
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {usersLoading ? (
                              <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="admin-text-xs mt-2">Kullanıcılar yükleniyor...</p>
                              </div>
                            ) : (
                              <div className="admin-space-y-2">
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
                                  <span className="admin-text-xs">Tümünü Seç</span>
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
                                    <span className="admin-text-xs">{user.name} ({user.email})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="admin-form-label">
                          Konu
                        </label>
                        <input
                          type="text"
                          name="subject"
                          required
                          className="admin-form-input"
                          placeholder="Email konusu"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="admin-form-label">
                        İçerik
                      </label>
                      <textarea
                        name="content"
                        rows={10}
                        required
                        className="admin-form-input"
                        placeholder="Email içeriği..."
                      />
                    </div>
                    {sendSuccess && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {sendSuccess}
                      </div>
                    )}
                    {sendError && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {sendError}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingEmail || (emailType === 'bulk' && selectedUsers.length === 0)}
                        className="admin-btn admin-btn-primary"
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
              <div className="admin-space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="admin-card-title">Email Template'leri</h3>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="admin-btn admin-btn-primary"
                  >
                    Yeni Template
                  </button>
                </div>
                <div className="admin-grid-3">
                  {templates.map((template) => (
                    <div key={template.id} className="admin-card-small">
                      <div className="admin-card-header">
                        <div className="flex items-center space-x-1">
                          {getTemplateIcon(template.type)}
                          <h4 className="admin-text-xs">{template.name}</h4>
                        </div>
                        <span className={`admin-text-xs px-2 py-1 rounded ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </div>
                      <p className="admin-text-xs mb-3">{template.subject}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 admin-btn admin-btn-primary"
                        >
                          Kullan
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="flex-1 admin-btn admin-btn-secondary"
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
              <div className="admin-space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="admin-card-title">Email Logları</h3>
                  <div className="flex space-x-2">
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
                      className="admin-btn admin-btn-primary"
                    >
                      Yenile
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('90 günden eski email logları silinecek. Emin misiniz?')) {
                          setLogsLoading(true)
                          fetch('/api/system/cleanup-logs', { method: 'POST' })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert(data.message)
                                // Logları yenile
                                return fetch('/api/email/logs')
                              }
                              throw new Error(data.error)
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setEmailLogs(data.data.logs)
                              }
                              setLogsLoading(false)
                            })
                            .catch(error => {
                              alert('Temizleme hatası: ' + error.message)
                              setLogsLoading(false)
                            })
                        }
                      }}
                      className="admin-btn admin-btn-secondary"
                    >
                      Eski Logları Temizle
                    </button>
                  </div>
                </div>
                
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="admin-card">
                    <div className="overflow-x-auto">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th className="admin-text-xs">Alıcı</th>
                            <th className="admin-text-xs">Konu</th>
                            <th className="admin-text-xs">Durum</th>
                            <th className="admin-text-xs">Gönderim</th>
                            <th className="admin-text-xs">Açılma</th>
                            <th className="admin-text-xs">Tıklama</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailLogs.map((log) => (
                            <tr key={log.id}>
                              <td>
                                <div>
                                  <div className="admin-text-xs">{log.recipientName}</div>
                                  <div className="admin-text-xs">{log.recipientEmail}</div>
                                </div>
                              </td>
                              <td>
                                <div className="admin-text-xs">{log.subject}</div>
                              </td>
                              <td>
                                <span className={`admin-badge ${
                                  log.status === 'sent' ? 'admin-badge-success' :
                                  log.status === 'delivered' ? 'admin-badge-success' :
                                  log.status === 'bounced' ? 'admin-badge-error' :
                                  'admin-badge-warning'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="admin-text-xs">
                                {new Date(log.sentAt).toLocaleString('tr-TR')}
                              </td>
                              <td className="admin-text-xs">
                                {log.openedAt ? new Date(log.openedAt).toLocaleString('tr-TR') : '-'}
                              </td>
                              <td className="admin-text-xs">
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
              <div className="admin-space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="admin-card-title">Email Kuyruğu</h3>
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
                    className="admin-btn admin-btn-primary"
                  >
                    Yenile
                  </button>
                </div>
                
                {queueLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="admin-card">
                    <div className="overflow-x-auto">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th className="admin-text-xs">Alıcı</th>
                            <th className="admin-text-xs">Konu</th>
                            <th className="admin-text-xs">Öncelik</th>
                            <th className="admin-text-xs">Durum</th>
                            <th className="admin-text-xs">Zamanlama</th>
                            <th className="admin-text-xs">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailQueue.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div>
                                  <div className="admin-text-xs">{item.recipientName}</div>
                                  <div className="admin-text-xs">{item.recipientEmail}</div>
                                </div>
                              </td>
                              <td>
                                <div className="admin-text-xs">{item.subject}</div>
                              </td>
                              <td>
                                <span className={`admin-badge ${
                                  item.priority === 'high' ? 'admin-badge-error' :
                                  item.priority === 'normal' ? 'admin-badge-success' :
                                  'admin-badge-warning'
                                }`}>
                                  {item.priority}
                                </span>
                              </td>
                              <td>
                                <span className={`admin-badge ${
                                  item.status === 'pending' ? 'admin-badge-warning' :
                                  item.status === 'processing' ? 'admin-badge-success' :
                                  item.status === 'failed' ? 'admin-badge-error' :
                                  'admin-badge-success'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="admin-text-xs">
                                {new Date(item.scheduledAt).toLocaleString('tr-TR')}
                              </td>
                              <td className="admin-text-xs">
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
              <div className="admin-space-y-3">
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">SMTP Ayarları</h3>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSaveSettings()
                  }}>
                    <div className="admin-grid-2">
                      <div>
                        <label className="admin-form-label">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settingsForm.smtpHost}
                          onChange={(e) => setSettingsForm({...settingsForm, smtpHost: e.target.value})}
                          className="admin-form-input"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settingsForm.smtpPort}
                          onChange={(e) => setSettingsForm({...settingsForm, smtpPort: e.target.value})}
                          className="admin-form-input"
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">
                          SMTP Kullanıcı
                        </label>
                        <input
                          type="text"
                          value={settingsForm.smtpUser}
                          onChange={(e) => setSettingsForm({...settingsForm, smtpUser: e.target.value})}
                          className="admin-form-input"
                          placeholder="kullanici@email.com"
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">
                          SMTP Şifre
                        </label>
                        <input
                          type="password"
                          value={settingsForm.smtpPassword}
                          onChange={(e) => setSettingsForm({...settingsForm, smtpPassword: e.target.value})}
                          className="admin-form-input"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">
                          Gönderen Email
                        </label>
                        <input
                          type="email"
                          value={settingsForm.fromEmail}
                          onChange={(e) => setSettingsForm({...settingsForm, fromEmail: e.target.value})}
                          className="admin-form-input"
                          placeholder="noreply@gurbet.biz"
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">
                          Gönderen Adı
                        </label>
                        <input
                          type="text"
                          value={settingsForm.fromName}
                          onChange={(e) => setSettingsForm({...settingsForm, fromName: e.target.value})}
                          className="admin-form-input"
                          placeholder="Gurbet.biz"
                        />
                      </div>
                    </div>
                    {settingsSuccess && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {settingsSuccess}
                      </div>
                    )}
                    {settingsError && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {settingsError}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="admin-btn admin-btn-primary"
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

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingTemplate ? 'Template Düzenle' : 'Yeni Template'}
              </h3>
            </div>
            <div className="admin-modal-content">
              <div className="admin-space-y-2">
                <div>
                  <label className="admin-form-label">
                    Template Adı
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="admin-form-input"
                    placeholder="Template adı"
                  />
                </div>
                
                <div>
                  <label className="admin-form-label">
                    Konu
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    className="admin-form-input"
                    placeholder="Email konusu"
                  />
                </div>
                
                <div>
                  <label className="admin-form-label">
                    Template Türü
                  </label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({...templateForm, type: e.target.value as any})}
                    className="admin-form-select"
                  >
                    <option value="welcome">Hoş Geldiniz</option>
                    <option value="reservation">Rezervasyon</option>
                    <option value="marketing">Pazarlama</option>
                    <option value="system">Sistem</option>
                  </select>
                </div>
                
                <div>
                  <label className="admin-form-label">
                    İçerik
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    rows={8}
                    className="admin-form-input"
                    placeholder="Email içeriği..."
                  />
                </div>
              </div>
            </div>
            
            <div className="admin-modal-footer">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                  setTemplateForm({ name: '', subject: '', content: '', type: 'welcome' })
                }}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={handleCreateTemplate}
                className="admin-btn admin-btn-primary"
              >
                {editingTemplate ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Test Email Gönder</h3>
            </div>
            <div className="admin-modal-content">
              <div className="admin-space-y-3">
                <div>
                  <label className="admin-form-label">Test Email Adresi</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="admin-form-input"
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <label className="admin-form-label">Test Türü</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="admin-form-select"
                  >
                    <option value="welcome">Hoş Geldiniz Emaili</option>
                    <option value="reservation">Rezervasyon Onayı</option>
                    <option value="notification">Sistem Bildirimi</option>
                    <option value="custom">Özel Test</option>
                  </select>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center space-x-2">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult.success ? 'Test başarılı!' : 'Test başarısız!'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.success ? testResult.message : testResult.error}
                    </p>
                  </div>
                )}

                {!apiKeyStatus?.apiKeyConfigured && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">API Key Eksik</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      Test email gönderebilmek için önce RESEND_API_KEY'i kurmanız gerekiyor.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="admin-modal-footer">
              <button
                onClick={() => {
                  setShowTestModal(false)
                  setTestResult(null)
                  setTestEmail('')
                }}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={sendTestEmail}
                disabled={!apiKeyStatus?.apiKeyConfigured || !testEmail}
                className="admin-btn admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Email Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}