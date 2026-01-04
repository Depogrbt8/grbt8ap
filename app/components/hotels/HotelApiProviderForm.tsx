'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface Provider {
  id?: string;
  name?: string;
  displayName?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  priority?: number;
  maxConcurrentRequests?: number;
  healthCheckUrl?: string;
  description?: string;
  documentationUrl?: string;
  supportEmail?: string;
  isTestMode?: boolean;
  isActive?: boolean;
}

interface HotelApiProviderFormProps {
  provider: Provider | null;
  onSave?: (data: Provider) => void;
  onUpdate?: (data: Partial<Provider>) => void;
  loading?: boolean;
}

export default function HotelApiProviderForm({ 
  provider, 
  onSave, 
  onUpdate,
  loading = false 
}: HotelApiProviderFormProps) {
  const [formData, setFormData] = useState<Provider>({
    name: provider?.name || '',
    displayName: provider?.displayName || '',
    apiKey: '',
    apiSecret: '',
    apiUrl: provider?.apiUrl || '',
    timeout: provider?.timeout || 30000,
    retryCount: provider?.retryCount || 3,
    retryDelay: provider?.retryDelay || 1000,
    priority: provider?.priority || 1,
    maxConcurrentRequests: provider?.maxConcurrentRequests || 10,
    healthCheckUrl: provider?.healthCheckUrl || '',
    description: provider?.description || '',
    documentationUrl: provider?.documentationUrl || '',
    supportEmail: provider?.supportEmail || '',
    isTestMode: provider?.isTestMode ?? true,
    isActive: provider?.isActive ?? false
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        displayName: provider.displayName || '',
        apiKey: '',
        apiSecret: '',
        apiUrl: provider.apiUrl || '',
        timeout: provider.timeout || 30000,
        retryCount: provider.retryCount || 3,
        retryDelay: provider.retryDelay || 1000,
        priority: provider.priority || 1,
        maxConcurrentRequests: provider.maxConcurrentRequests || 10,
        healthCheckUrl: provider.healthCheckUrl || '',
        description: provider.description || '',
        documentationUrl: provider.documentationUrl || '',
        supportEmail: provider.supportEmail || '',
        isTestMode: provider.isTestMode ?? true,
        isActive: provider.isActive ?? false
      });
    }
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    } else if (onUpdate) {
      onUpdate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider Adı (name) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!!provider}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            placeholder="amadeus, expedia, booking.com"
          />
          <p className="text-xs text-gray-500 mt-1">Küçük harf, tire ile ayrılmış (örn: amadeus-hotel-api)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Görünen Ad (displayName) *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Amadeus Hotel API"
          />
        </div>

        {/* API Credentials */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">API Credentials</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key {!provider && '*'}
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            required={!provider}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={provider ? 'Değiştirmek için yeni değer girin' : 'API Key'}
          />
          {provider && (
            <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız mevcut değer korunur</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Secret {!provider && '*'}
          </label>
          <input
            type="password"
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            required={!provider}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={provider ? 'Değiştirmek için yeni değer girin' : 'API Secret'}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API URL (Opsiyonel)
          </label>
          <input
            type="url"
            value={formData.apiUrl}
            onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="https://api.example.com"
          />
          <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa provider'ın varsayılan URL'i kullanılır</p>
        </div>

        {/* Ayarlar */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">Ayarlar</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeout (ms)
          </label>
          <input
            type="number"
            value={formData.timeout}
            onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retry Sayısı
          </label>
          <input
            type="number"
            value={formData.retryCount}
            onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retry Delay (ms)
          </label>
          <input
            type="number"
            value={formData.retryDelay}
            onChange={(e) => setFormData({ ...formData, retryDelay: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Öncelik (Priority)
          </label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">1 = En yüksek öncelik</p>
        </div>

        {/* Durum */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">Durum</h2>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTestMode}
              onChange={(e) => setFormData({ ...formData, isTestMode: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Test Modu</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Kaydediliyor...' : provider ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </form>
  );
}

