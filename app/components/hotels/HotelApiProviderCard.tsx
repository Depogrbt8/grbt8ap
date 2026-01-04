'use client';

import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  healthStatus: string;
  lastTestAt: string | null;
  errorCount: number;
  priority: number;
}

interface HotelApiProviderCardProps {
  provider: Provider;
}

export default function HotelApiProviderCard({ provider }: HotelApiProviderCardProps) {
  const getHealthIcon = () => {
    switch (provider.healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthColor = () => {
    switch (provider.healthStatus) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow cursor-pointer ${getHealthColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {provider.displayName}
          </h3>
          <p className="text-sm text-gray-500">{provider.name}</p>
        </div>
        {getHealthIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Durum:</span>
          <span className={`font-medium ${
            provider.isActive ? 'text-green-600' : 'text-gray-400'
          }`}>
            {provider.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Mod:</span>
          <span className={`font-medium ${
            provider.isTestMode ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {provider.isTestMode ? 'Test' : 'Production'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Öncelik:</span>
          <span className="font-medium text-gray-900">{provider.priority}</span>
        </div>

        {provider.errorCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hata Sayısı:</span>
            <span className="font-medium text-red-600">{provider.errorCount}</span>
          </div>
        )}

        {provider.lastTestAt && (
          <div className="text-xs text-gray-500 mt-2">
            Son test: {new Date(provider.lastTestAt).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    </div>
  );
}

