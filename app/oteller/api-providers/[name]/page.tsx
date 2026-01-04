'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import HotelApiProviderForm from '../../../components/hotels/HotelApiProviderForm';
import HotelApiProviderTest from '../../../components/hotels/HotelApiProviderTest';

export default function OtelApiProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerName = params.name as string;
  
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'test'>('details');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProvider();
  }, [providerName]);

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hotels/providers/${providerName}`);
      const data = await response.json();
      
      if (data.success) {
        setProvider(data.data);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/hotels/providers/${providerName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchProvider();
        alert('Provider başarıyla güncellendi');
      } else {
        alert(data.error || 'Güncelleme hatası');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Güncelleme hatası');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar activeTab="oteller-api-providers" setActiveTab={() => {}} />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="text-center">Yükleniyor...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex">
        <Sidebar activeTab="oteller-api-providers" setActiveTab={() => {}} />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="text-center">Provider bulunamadı</div>
          </main>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">{provider.displayName}</h1>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Detaylar ve Ayarlar
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                API Test
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <HotelApiProviderForm
              provider={provider}
              onUpdate={handleUpdate}
              loading={saving}
            />
          )}

          {activeTab === 'test' && (
            <HotelApiProviderTest
              providerName={providerName}
              provider={provider}
            />
          )}
        </main>
      </div>
    </div>
  );
}

