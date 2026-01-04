'use client';

import Link from 'next/link';
import HotelApiProviderCard from './HotelApiProviderCard';

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

interface HotelApiProviderListProps {
  providers: Provider[];
  loading: boolean;
  onRefresh: () => void;
}

export default function HotelApiProviderList({ 
  providers, 
  loading,
  onRefresh 
}: HotelApiProviderListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Henüz API provider eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map(provider => (
        <Link key={provider.id} href={`/oteller/api-providers/${provider.name}`}>
          <HotelApiProviderCard provider={provider} />
        </Link>
      ))}
    </div>
  );
}

