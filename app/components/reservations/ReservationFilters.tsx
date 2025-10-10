'use client'

interface ReservationFiltersProps {
  activeFilter: string
  searchTerm: string
  onFilterChange: (filter: string) => void
  onSearchChange: (search: string) => void
}

export default function ReservationFilters({
  activeFilter,
  searchTerm,
  onFilterChange,
  onSearchChange
}: ReservationFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Arama */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rezervasyon ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Durum Filtresi */}
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => onFilterChange('ready')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === 'ready'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hazır
          </button>
          <button
            onClick={() => onFilterChange('preparing')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === 'preparing'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hazırlanıyor
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tamamlandı
          </button>
          <button
            onClick={() => onFilterChange('cancelled')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
} 