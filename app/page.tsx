'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [needs2FA, setNeeds2FA] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (session && session.user.role === 'admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        twoFactorCode: needs2FA ? twoFactorCode : undefined,
        redirect: false,
      })

      if (result?.error === 'CredentialsSignin') {
        if (!needs2FA) {
          // İlk denemede şifre doğru ama 2FA kodu girilmemiş - email'e kod gönder
          setNeeds2FA(true)
          
          try {
            await fetch('/api/auth/send-2fa-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            })
            setError('🔐 2FA kodu email\'inize gönderildi. Lütfen 6 haneli kodu girin.')
          } catch (error) {
            setError('🔐 2FA kodu gönderilemedi. Lütfen tekrar deneyin.')
          }
        } else {
          // Kod girilmiş ama yanlış
          setError('2FA kodu yanlış. Lütfen tekrar deneyin.')
        }
      } else if (result?.error) {
        setError('Geçersiz email veya şifre')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Giriş sırasında bir hata oluştu')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {/* Logo */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Grbt8 Admin</h2>
          <p className="text-gray-600">Yönetim paneline giriş yapın</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Giriş Formu */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="admin@grbt8.store"
              />
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 2FA Kodu */}
            {needs2FA && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  🔐 2FA Kodu
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Email'inize gelen 6 haneli kodu girin"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email'inize gönderilen 6 haneli kodu girin (10 dakika geçerli)
                </p>
              </div>
            )}
          </div>

          {/* Giriş Butonu */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Giriş Yap
                </>
              )}
            </button>
          </div>

        </form>

        {/* Güvenlik Uyarısı */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bu panel sadece yetkili personel içindir.
          </p>
        </div>
      </div>
    </div>
  )
}