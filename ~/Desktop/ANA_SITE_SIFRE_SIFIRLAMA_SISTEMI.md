# 📋 Ana Site AI Asistanı İçin Şifre Sıfırlama Sistemi Talimatları

**Merhaba! Admin panel ile uyumlu şifre sıfırlama sistemi kurman gerekiyor. İşte detaylı talimatlar:**

---

## 🎯 YAPILACAKLAR:

### 1. Prisma Schema Güncelleme
`prisma/schema.prisma` dosyasında `User` modeline ekle:
```prisma
model User {
  // ... mevcut fieldlar
  resetToken         String?
  resetTokenExpiry   DateTime?
  // ... diğer fieldlar
}
```
Sonra: `npx prisma db push` ve `npx prisma generate`

---

### 2. Frontend Sayfaları Oluştur

**`app/sifremi-unuttum/page.tsx` (Email girme sayfası):**
```tsx
'use client'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifre sıfırlama linki email adresinize gönderildi.')
      } else {
        setMessage(data.error || 'Bir hata oluştu.')
      }
    } catch (error) {
      setMessage('Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Şifremi Unuttum</h2>
        
        {message && (
          <div className={`p-4 rounded ${message.includes('gönderildi') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
          </button>
        </form>
        
        <div className="text-center">
          <a href="/giris" className="text-green-600 hover:text-green-800">
            Giriş sayfasına dön
          </a>
        </div>
      </div>
    </div>
  )
}
```

**`app/sifre-sifirla/page.tsx` (Yeni şifre girme sayfası):**
```tsx
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    if (token) {
      checkToken()
    } else {
      setMessage('Geçersiz token.')
      setCheckingToken(false)
    }
  }, [token])

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-token?token=${token}`)
      const data = await response.json()
      
      if (data.valid) {
        setTokenValid(true)
      } else {
        setMessage('Token geçersiz veya süresi dolmuş.')
      }
    } catch (error) {
      setMessage('Token doğrulanırken hata oluştu.')
    } finally {
      setCheckingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor.')
      return
    }
    
    if (password.length < 6) {
      setMessage('Şifre en az 6 karakter olmalıdır.')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.')
        setTimeout(() => {
          window.location.href = '/giris'
        }, 2000)
      } else {
        setMessage(data.error || 'Şifre güncellenirken hata oluştu.')
      }
    } catch (error) {
      setMessage('Şifre güncellenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4">Token doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold text-red-600">Geçersiz Token</h2>
          <p className="text-gray-600">{message}</p>
          <a href="/sifremi-unuttum" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Yeni Token İste
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Yeni Şifre Belirle</h2>
        
        {message && (
          <div className={`p-4 rounded ${message.includes('güncellendi') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

### 3. API Endpoint'leri Oluştur

**`app/api/auth/forgot-password/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Kendi prisma path'ini kullan
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email adresi gereklidir'
      }, { status: 400 })
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik için her zaman başarılı mesaj döndür
      return NextResponse.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlı ise, şifre sıfırlama linki gönderilecektir.'
      })
    }

    // Token oluştur
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

    // Token'ı kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Admin panel'den email gönder
    const emailResponse = await fetch('https://www.grbt8.store/api/email/templates/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.firstName || user.email,
        resetToken: resetToken
      })
    })

    const emailData = await emailResponse.json()

    if (!emailData.success) {
      console.error('Email gönderme hatası:', emailData.error)
      return NextResponse.json({
        success: false,
        error: 'Email gönderilirken hata oluştu'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi.'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu'
    }, { status: 500 })
  }
}
```

**`app/api/auth/verify-token/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    return NextResponse.json({ valid: !!user })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ valid: false })
  }
}
```

**`app/api/auth/reset-password/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Token ve şifre gereklidir'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      }, { status: 400 })
    }

    // Token'ı doğrula
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token'
      }, { status: 400 })
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12)

    // Şifreyi güncelle ve token'ı temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    })

  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Şifre güncellenirken hata oluştu'
    }, { status: 500 })
  }
}
```

---

### 4. Giriş Sayfasına Link Ekle
Giriş sayfanda "Şifremi Unuttum" linki ekle:
```tsx
<a href="/sifremi-unuttum" className="text-green-600 hover:text-green-800">
  Şifremi Unuttum
</a>
```

---

### 5. Gerekli Paketler
`package.json`'a ekle (yoksa):
```bash
npm install bcryptjs
npm install @types/bcryptjs
```

---

## ✅ Test Et:
1. `/sifremi-unuttum` sayfasında email gir
2. Email geldiğini kontrol et
3. Email'deki linke tıkla
4. Yeni şifre belirle
5. Yeni şifre ile giriş yap

**Bu sistem admin panel ile tam uyumlu çalışacak!** 🚀

---

## 🔄 Sistem Akışı:

1. **Kullanıcı** ana sitede `/sifremi-unuttum` sayfasında email girer
2. **Ana site** admin panel'in `/api/email/templates/password-reset` endpoint'ini çağırır
3. **Admin panel** email gönderir, link ana siteye yönlendirir: `/sifre-sifirla?token=xxx`
4. **Kullanıcı** ana sitede yeni şifresini belirler
5. **Ana site** şifreyi database'de günceller

## 🎯 Önemli Notlar:

- Email template'i admin panelde hazır (yeşil tasarım)
- Tüm linkler ana siteye yönlendiriyor
- Token 1 saat geçerli
- Güvenli hash sistemi (bcrypt)
- Responsive tasarım (Tailwind CSS)

**Kopyala-yapıştır yapabilirsin. Sorularını sor!** 📋
