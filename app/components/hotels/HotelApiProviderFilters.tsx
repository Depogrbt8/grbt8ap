'use client';

interface HotelApiProviderFiltersProps {
  filters: {
    isActive: string;
    healthStatus: string;
    search: string;
  };
  onFiltersChange: (filters: {
    isActive: string;
    healthStatus: string;
    search: string;
  }) => void;
}

export default function HotelApiProviderFilters({ 
  filters, 
  onFiltersChange 
}: HotelApiProviderFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Health Status
          </label>
          <select
            value={filters.healthStatus}
            onChange={(e) => onFiltersChange({ ...filters, healthStatus: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tümü</option>
            <option value="healthy">Healthy</option>
            <option value="degraded">Degraded</option>
            <option value="down">Down</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ara
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Provider adı..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

