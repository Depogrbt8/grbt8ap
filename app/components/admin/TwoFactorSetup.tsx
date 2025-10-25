'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Smartphone, CheckCircle, XCircle } from 'lucide-react'

interface TwoFactorSetupProps {
  adminId: string
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function TwoFactorSetup({ adminId, isEnabled, onToggle }: TwoFactorSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const setup2FA = async () => {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      })

      const data = await response.json()

      if (data.success) {
        setQrCode(data.data.qrCode)
        setSecret(data.data.secret)
        setMessage('2FA başarıyla etkinleştirildi! QR kodu Google Authenticator ile tarayın.')
        onToggle(true)
      } else {
        setError(data.error || '2FA etkinleştirilemedi')
      }
    } catch (error) {
      setError('Bağlantı hatası: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const disable2FA = async () => {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('2FA başarıyla devre dışı bırakıldı')
        setQrCode('')
        setSecret('')
        onToggle(false)
      } else {
        setError(data.error || '2FA devre dışı bırakılamadı')
      }
    } catch (error) {
      setError('Bağlantı hatası: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode) {
      setError('Doğrulama kodu girin')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminId, 
          token: verificationCode 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ 2FA kodu doğru!')
        setVerificationCode('')
      } else {
        setError('❌ Geçersiz 2FA kodu')
      }
    } catch (error) {
      setError('Bağlantı hatası: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          İki Faktörlü Kimlik Doğrulama (2FA)
        </CardTitle>
        <CardDescription>
          Google Authenticator ile güvenli giriş
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Durum Göstergesi */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          {isEnabled ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 font-medium">2FA Aktif</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">2FA Pasif</span>
            </>
          )}
        </div>

        {/* Mesajlar */}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* QR Kod */}
        {qrCode && (
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Google Authenticator ile QR kodu tarayın:</p>
            <div className="flex justify-center">
              <img 
                src={qrCode} 
                alt="2FA QR Code" 
                className="border rounded-lg"
                width="200"
                height="200"
              />
            </div>
            <p className="text-xs text-gray-500">
              Manuel kod: <code className="bg-gray-100 px-1 rounded">{secret}</code>
            </p>
          </div>
        )}

        {/* Doğrulama Kodu Test */}
        {isEnabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">2FA Kodunu Test Edin:</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="6 haneli kod"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="flex-1"
              />
              <Button 
                onClick={verifyCode} 
                disabled={isLoading}
                size="sm"
              >
                Test Et
              </Button>
            </div>
          </div>
        )}

        {/* Kontrol Butonları */}
        <div className="flex gap-2">
          {!isEnabled ? (
            <Button 
              onClick={setup2FA} 
              disabled={isLoading}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {isLoading ? 'Etkinleştiriliyor...' : '2FA Etkinleştir'}
            </Button>
          ) : (
            <Button 
              onClick={disable2FA} 
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? 'Devre Dışı Bırakılıyor...' : '2FA Devre Dışı Bırak'}
            </Button>
          )}
        </div>

        {/* Bilgi */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Google Authenticator uygulamasını indirin</p>
          <p>• QR kodu tarayın veya manuel kodu girin</p>
          <p>• Giriş yaparken 6 haneli kodu girin</p>
        </div>
      </CardContent>
    </Card>
  )
}


