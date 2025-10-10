'use client'

interface Reservation {
  id: string
  pnr: string
  name: string
  orderType: 'individual' | 'corporate'
  status: 'ready' | 'preparing' | 'cancelled' | 'completed'
  orderDate: string
  totalAmount?: number
  currency?: string
  bookingType?: 'book' | 'reserve'
}

interface ReservationDetailHeaderProps {
  reservation: Reservation
  onBack: () => void
  onApprove?: () => void
  onPrepare?: () => void
  onCancel?: () => void
  onShowCancelModal?: () => void
  onShowRefundModal?: () => void
}

export default function ReservationDetailHeader({
  reservation,
  onBack,
  onApprove,
  onPrepare,
  onCancel,
  onShowCancelModal,
  onShowRefundModal
}: ReservationDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Hazır'
      case 'preparing':
        return 'Hazırlanıyor'
      case 'completed':
        return 'Tamamlandı'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const getOrderTypeText = (orderType: string) => {
    switch (orderType) {
      case 'individual':
        return 'Bireysel'
      case 'corporate':
        return 'Kurumsal'
      default:
        return orderType
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{reservation.name}</h1>
            <p className="text-sm text-gray-600">PNR: {reservation.pnr}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Tutar</p>
            <p className="text-xl font-semibold text-gray-900">
              {reservation.totalAmount ? `${reservation.currency || '€'}${reservation.totalAmount.toFixed(2)}` : '-'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusText(reservation.status)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {getOrderTypeText(reservation.orderType)}
            </span>
          </div>
        </div>
      </div>

      {/* İşlem Butonları */}
      <div className="mt-4 flex space-x-3">
        {reservation.status === 'ready' && onApprove && (
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Onayla
          </button>
        )}
        {reservation.status === 'preparing' && onPrepare && (
          <button
            onClick={onPrepare}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Hazırla
          </button>
        )}
        
        {/* İptal ve İade Butonları */}
        {reservation.status !== 'cancelled' && (
          <>
            {onShowCancelModal && (
              <button
                onClick={onShowCancelModal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>İptal Et</span>
              </button>
            )}
            
            {onShowRefundModal && (reservation.status === 'completed' || reservation.status === 'ready' || reservation.status === 'preparing') && (
              <button
                onClick={onShowRefundModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>İade Yap</span>
              </button>
            )}
          </>
        )}
        

      </div>
    </div>
  )
} 