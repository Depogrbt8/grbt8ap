'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Link from 'next/link';
import HotelApiProviderList from '../../components/hotels/HotelApiProviderList';
import HotelApiProviderFilters from '../../components/hotels/HotelApiProviderFilters';

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

export default function OtelApiProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isActive: '',
    healthStatus: '',
    search: ''
  });

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.isActive) params.append('isActive', filters.isActive);
      if (filters.healthStatus) params.append('healthStatus', filters.healthStatus);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/hotels/providers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab="oteller-api-providers" setActiveTab={() => {}} />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Otel API Sağlayıcıları</h1>
            <Link
              href="/oteller/api-providers/yeni"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Yeni Provider Ekle
            </Link>
          </div>
          
          <HotelApiProviderFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <HotelApiProviderList 
            providers={providers} 
            loading={loading}
            onRefresh={fetchProviders}
          />
        </main>
      </div>
    </div>
  );
}

