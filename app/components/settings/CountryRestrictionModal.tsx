'use client'
import { X } from 'lucide-react'

interface CountryRestrictionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CountryRestrictionModal({ isOpen, onClose }: CountryRestrictionModalProps) {
  if (!isOpen) return null

  const countries = [
    { code: 'TR', name: 'Türkiye', enabled: true },
    { code: 'DE', name: 'Almanya', enabled: true },
    { code: 'NL', name: 'Hollanda', enabled: true },
    { code: 'BE', name: 'Belçika', enabled: true },
    { code: 'FR', name: 'Fransa', enabled: false },
    { code: 'GB', name: 'İngiltere', enabled: false },
    { code: 'US', name: 'Amerika Birleşik Devletleri', enabled: false },
    { code: 'CA', name: 'Kanada', enabled: false },
    { code: 'AU', name: 'Avustralya', enabled: false },
    { code: 'RU', name: 'Rusya', enabled: false },
    { code: 'CN', name: 'Çin', enabled: false },
    { code: 'IR', name: 'İran', enabled: false }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Ülke Kısıtlaması</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Sadece seçilen ülkelerde tam hizmet verilir. Diğer ülkelerde "Bu ülkede hizmet verilmemektedir" mesajı gösterilir.
          </p>
        </div>

        <div className="space-y-3">
          {countries.map((country) => (
            <div key={country.code} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getCountryFlag(country.code)}</span>
                <div>
                  <div className="font-medium text-gray-900">{country.name}</div>
                  <div className="text-sm text-gray-500">{country.code}</div>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={country.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {country.enabled ? 'Aktif' : 'Pasif'}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Bilgi</h3>
          <p className="text-sm text-blue-700">
            ✅ Aktif ülkeler: Tam site erişimi<br/>
            ❌ Pasif ülkeler: Sadece "Hizmet verilmiyor" mesajı
          </p>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            İptal
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

// Ülke bayrakları için emoji fonksiyonu
function getCountryFlag(countryCode: string): string {
  const flagMap: { [key: string]: string } = {
    'TR': '🇹🇷',
    'DE': '🇩🇪',
    'NL': '🇳🇱',
    'BE': '🇧🇪',
    'FR': '🇫🇷',
    'GB': '🇬🇧',
    'US': '🇺🇸',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'RU': '🇷🇺',
    'CN': '🇨🇳',
    'IR': '🇮🇷'
  }
  return flagMap[countryCode] || '🏳️'
} 