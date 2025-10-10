'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

interface Balance {
  id: string
  agencyId: string
  agencyName: string
  amount: number
  currency: string
  status: 'active' | 'inactive'
  createdAt: string
  description?: string
}

interface Refund {
  id: string
  orderId: string
  agencyId: string
  agencyName: string
  customerName: string
  amount: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  processedAt?: string
  processedBy?: string
  note?: string
}

export default function OdemelerPage() {
  const [activeTab, setActiveTab] = useState('odemeler')
  const [activeDetailTab, setActiveDetailTab] = useState('odemeler')
  const [showCreateBalanceModal, setShowCreateBalanceModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock bakiye verileri
  const [balances] = useState<Balance[]>([
    {
      id: '1',
      agencyId: 'agency-1',
      agencyName: 'DEMO SEYAHAT',
      amount: 5000.00,
      currency: 'EUR',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      description: 'Başlangıç bakiyesi'
    },
    {
      id: '2',
      agencyId: 'agency-2',
      agencyName: 'TEST ACENTE',
      amount: 2500.00,
      currency: 'EUR',
      status: 'active',
      createdAt: '2024-01-10T14:20:00Z',
      description: 'Test bakiyesi'
    }
  ])

  // Mock iade verileri
  const [refunds] = useState<Refund[]>([
    {
      id: 'refund-1',
      orderId: 'order-123',
      agencyId: 'agency-1',
      agencyName: 'DEMO SEYAHAT',
      customerName: 'Ahmet Yılmaz',
      amount: 150.00,
      currency: 'EUR',
      reason: 'Müşteri talebi - İptal',
      status: 'pending',
      createdAt: '2024-01-20T09:15:00Z'
    },
    {
      id: 'refund-2',
      orderId: 'order-456',
      agencyId: 'agency-2',
      agencyName: 'TEST ACENTE',
      customerName: 'Fatma Demir',
      amount: 75.50,
      currency: 'EUR',
      reason: 'Uçuş iptali',
      status: 'approved',
      createdAt: '2024-01-18T14:30:00Z',
      processedAt: '2024-01-19T10:00:00Z',
      processedBy: 'admin@demo.com'
    }
  ])

  const handleCreateBalance = async (formData: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Bakiye başarıyla oluşturuldu')
        setShowCreateBalanceModal(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Bakiye oluşturma başarısız: ${error.message}`)
      }
    } catch (error) {
      console.error('Bakiye oluşturma hatası:', error)
      alert('Bakiye oluşturma sırasında bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Aktif' : 'Pasif'
  }

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRefundStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede'
      case 'approved': return 'Onaylandı'
      case 'rejected': return 'Reddedildi'
      case 'completed': return 'Tamamlandı'
      default: return 'Bilinmiyor'
    }
  }

  const handleRefundAction = async (refundId: string, action: 'approve' | 'reject', note?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/refunds/${refundId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note })
      })

      if (response.ok) {
        alert(`İade ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`)
        setShowRefundModal(false)
        setSelectedRefund(null)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`İade işlemi başarısız: ${error.message}`)
      }
    } catch (error) {
      console.error('İade işlemi hatası:', error)
      alert('İade işlemi sırasında bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Başlık */}
          <div className="admin-card">
            <h1 className="admin-text-lg">Ödeme ve Bakiye Yönetimi</h1>
            <p className="admin-text-xs mt-1">Ödemeleri ve bakiyeleri yönetin</p>
          </div>

          {/* Tab Başlıkları */}
          <div className="admin-card">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveDetailTab('odemeler')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeDetailTab === 'odemeler'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ödemeler
                </button>
                <button
                  onClick={() => setActiveDetailTab('bakiyeler')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeDetailTab === 'bakiyeler'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bakiyeler ({balances.length})
                </button>
                <button
                  onClick={() => setActiveDetailTab('iadeler')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeDetailTab === 'iadeler'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  İadeler ({refunds.length})
                </button>
              </nav>
            </div>

            {/* Tab İçerikleri */}
            <div className="p-6">
              {activeDetailTab === 'odemeler' && (
                <div>
                  <h3 className="admin-text-sm mb-3">Ödeme Yönetimi</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="admin-text-xs text-yellow-800">
                          <strong>Geliştirme Aşamasında:</strong> Ödeme yönetimi özellikleri yakında eklenecek.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'bakiyeler' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="admin-text-sm">Bakiye Yönetimi</h3>
                    <button
                      onClick={() => setShowCreateBalanceModal(true)}
                      className="admin-btn admin-btn-primary flex items-center space-x-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Yeni Bakiye</span>
                    </button>
                  </div>

                  {/* Bakiye Listesi */}
                  <div className="space-y-4">
                    {balances.map((balance) => (
                      <div key={balance.id} className="admin-card-small">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="admin-text-sm">{balance.agencyName}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(balance.status)}`}>
                                {getStatusText(balance.status)}
                              </span>
                            </div>
                            <p className="admin-text-xs mt-1">Acente ID: {balance.agencyId}</p>
                            {balance.description && (
                              <p className="admin-text-xs mt-1">{balance.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="admin-text-lg">
                              {balance.currency} {balance.amount.toFixed(2)}
                            </p>
                            <p className="admin-text-xs mt-1">
                              Oluşturulma: {formatDate(balance.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'iadeler' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="admin-text-sm">Manuel İade Yönetimi</h3>
                    <div className="flex space-x-2">
                      <select className="admin-form-select">
                        <option value="">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="approved">Onaylandı</option>
                        <option value="rejected">Reddedildi</option>
                        <option value="completed">Tamamlandı</option>
                      </select>
                    </div>
                  </div>

                  {/* İade Listesi */}
                  <div className="space-y-4">
                    {refunds.map((refund) => (
                      <div key={refund.id} className="admin-card-small">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="admin-text-sm">{refund.customerName}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                                {getRefundStatusText(refund.status)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 admin-text-xs">
                              <div>
                                <p><strong>Acente:</strong> {refund.agencyName}</p>
                                <p><strong>Sipariş ID:</strong> {refund.orderId}</p>
                                <p><strong>Sebep:</strong> {refund.reason}</p>
                              </div>
                              <div>
                                <p><strong>Oluşturulma:</strong> {formatDate(refund.createdAt)}</p>
                                {refund.processedAt && (
                                  <p><strong>İşlenme:</strong> {formatDate(refund.processedAt)}</p>
                                )}
                                {refund.processedBy && (
                                  <p><strong>İşleyen:</strong> {refund.processedBy}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="admin-text-lg">
                              {refund.currency} {refund.amount.toFixed(2)}
                            </p>
                            {refund.status === 'pending' && (
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => {
                                    setSelectedRefund(refund)
                                    setShowRefundModal(true)
                                  }}
                                  className="admin-btn admin-btn-primary text-xs"
                                >
                                  İşle
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bakiye Oluşturma Modal */}
      {showCreateBalanceModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Yeni Bakiye Oluştur</h3>
              <button
                onClick={() => setShowCreateBalanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateBalance({
                agencyId: formData.get('agencyId'),
                amount: parseFloat(formData.get('amount') as string),
                currency: formData.get('currency'),
                description: formData.get('description')
              })
            }}>
              <div className="admin-modal-content">
                <div className="admin-space-y-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Acente ID *</label>
                    <input
                      type="text"
                      name="agencyId"
                      required
                      className="admin-form-input"
                      placeholder="Acente ID girin"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Bakiye Tutarı *</label>
                    <input
                      type="number"
                      name="amount"
                      required
                      step="0.01"
                      min="0"
                      className="admin-form-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Para Birimi *</label>
                    <select
                      name="currency"
                      required
                      className="admin-form-select"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Açıklama</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="admin-form-input"
                      placeholder="Bakiye açıklaması..."
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateBalanceModal(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={isProcessing}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="admin-btn admin-btn-primary"
                >
                  {isProcessing ? 'Oluşturuluyor...' : 'Bakiye Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* İade İşleme Modal */}
      {showRefundModal && selectedRefund && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">İade İşlemi</h3>
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setSelectedRefund(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="admin-modal-content">
              <div className="admin-space-y-3">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="admin-text-sm mb-2">İade Detayları</h4>
                  <div className="admin-space-y-2 admin-text-xs">
                    <p><strong>Müşteri:</strong> {selectedRefund.customerName}</p>
                    <p><strong>Acente:</strong> {selectedRefund.agencyName}</p>
                    <p><strong>Sipariş ID:</strong> {selectedRefund.orderId}</p>
                    <p><strong>Tutar:</strong> {selectedRefund.currency} {selectedRefund.amount.toFixed(2)}</p>
                    <p><strong>Sebep:</strong> {selectedRefund.reason}</p>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Not (Opsiyonel)</label>
                  <textarea
                    id="refundNote"
                    rows={3}
                    className="admin-form-input"
                    placeholder="İade işlemi hakkında not..."
                  />
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false)
                  setSelectedRefund(null)
                }}
                className="admin-btn admin-btn-secondary"
                disabled={isProcessing}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const note = (document.getElementById('refundNote') as HTMLTextAreaElement)?.value
                  handleRefundAction(selectedRefund.id, 'reject', note)
                }}
                disabled={isProcessing}
                className="admin-btn admin-btn-secondary bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'İşleniyor...' : 'Reddet'}
              </button>
              <button
                onClick={() => {
                  const note = (document.getElementById('refundNote') as HTMLTextAreaElement)?.value
                  handleRefundAction(selectedRefund.id, 'approve', note)
                }}
                disabled={isProcessing}
                className="admin-btn admin-btn-primary"
              >
                {isProcessing ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}