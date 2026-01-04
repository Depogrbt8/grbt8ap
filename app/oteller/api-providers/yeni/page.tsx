'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import HotelApiProviderForm from '../../../components/hotels/HotelApiProviderForm';

export default function YeniOtelApiProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (providerData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/hotels/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerData)
      });
      
      const data = await response.json();
      if (data.success) {
        router.push(`/oteller/api-providers/${data.data.name}`);
      } else {
        alert(data.error || 'Provider oluşturma hatası');
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Provider oluşturma hatası');
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
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Geri Dön
            </button>
            <h1 className="text-2xl font-bold">Yeni API Provider Ekle</h1>
          </div>

          <HotelApiProviderForm
            provider={null}
            onSave={handleCreate}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
}

