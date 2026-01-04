'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HotelApiProviderTestProps {
  providerName: string;
  provider: any;
}

export default function HotelApiProviderTest({ providerName, provider }: HotelApiProviderTestProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`/api/hotels/providers/${providerName}/test`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Test sırasında bir hata oluştu'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">API Bağlantı Testi</h2>
        <p className="text-sm text-gray-600">
          Provider'ın API bağlantısını test edin. Bu işlem API credentials'ları kullanarak gerçek bir istek gönderir.
        </p>
      </div>

      <button
        onClick={handleTest}
        disabled={testing || !provider.apiKey}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Test Ediliyor...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Test Et
          </>
        )}
      </button>

      {!provider.apiKey && (
        <p className="text-sm text-red-600 mt-2">
          API credentials yapılandırılmamış. Lütfen önce API Key ve Secret ekleyin.
        </p>
      )}

      {testResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.success ? 'Test Başarılı' : 'Test Başarısız'}
            </span>
          </div>

          {testResult.data?.testResult && (
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Status:</strong> {testResult.data.testResult.status} {testResult.data.testResult.statusText}
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(testResult.data.testResult.data, null, 2)}
              </pre>
            </div>
          )}

          {testResult.error && (
            <p className="text-sm text-red-700 mt-2">
              <strong>Hata:</strong> {testResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

