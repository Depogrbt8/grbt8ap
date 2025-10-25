'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Shield, Smartphone, CheckCircle } from 'lucide-react'

export default function TwoFactorSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)

  // Session kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Sayfa yüklendiğinde 2FA setup başlat
  useEffect(() => {
    if (session?.user?.id) {
      start2FASetup()
    }
  }, [session])

  const start2FASetup = async () => {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminId: session?.user?.id 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQrCode(data.data.qrCode)
        setSecret(data.data.secret)
        setMessage('QR kodu Google Authenticator ile tarayın')
      } else {
        setError(data.error || '2FA setup başlatılamadı')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAndComplete = async () => {
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
          adminId: session?.user?.id,
          token: verificationCode 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ 2FA başarıyla kuruldu!')
        setSetupComplete(true)
        
        // 3 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setError('Geçersiz 2FA kodu. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Güvenlik Kurulumu
          </CardTitle>
          <CardDescription>
            İki Faktörlü Kimlik Doğrulama (2FA) kurulumu
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {setupComplete ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">2FA Kurulumu Tamamlandı!</h3>
              <p className="text-gray-600">
                Dashboard'a yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <>
              {/* Durum Mesajı */}
              <Alert>
                <AlertDescription>
                  Güvenlik için 2FA kurulumu zorunludur. Bu kurulum sadece bir kez yapılacaktır.
                </AlertDescription>
              </Alert>

              {/* Başarı/Hata Mesajları */}
              {message && !error && (
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

              {/* Doğrulama Kodu */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Google Authenticator'dan 6 haneli kodu girin:
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={isLoading}
                />
              </div>

              {/* Tamamla Butonu */}
              <Button 
                onClick={verifyAndComplete} 
                disabled={isLoading || !verificationCode}
                className="w-full"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {isLoading ? 'Kontrol ediliyor...' : 'Kurulumu Tamamla'}
              </Button>

              {/* Bilgi */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Google Authenticator uygulamasını indirin</p>
                <p>• QR kodu tarayın veya manuel kodu girin</p>
                <p>• 6 haneli kodu buraya girin</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

