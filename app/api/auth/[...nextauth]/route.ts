import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [AUTH DEBUG] Authorize çağrıldı')
          console.log('📧 [AUTH DEBUG] Email:', credentials?.email)
        }
        
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ [AUTH DEBUG] Credentials eksik')
          }
          return null
        }

        try {
          // Önce Admin tablosunda ara
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 [AUTH DEBUG] Admin tablosunda aranıyor:', credentials.email)
          }
          let admin: any = await prisma.admin.findUnique({
            where: { email: credentials.email }
          })

          // Admin tablosunda yoksa User tablosunda ara
          if (!admin) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 [AUTH DEBUG] Admin tablosunda bulunamadı, User tablosunda aranıyor:', credentials.email)
            }
            const user = await prisma.user.findUnique({
              where: { email: credentials.email }
            })
            
            if (user && user.role === 'admin') {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ [AUTH DEBUG] User tablosunda admin bulundu:', user.email)
              }
              admin = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                role: user.role,
                status: user.status,
                permissions: {},
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                createdBy: null
              }
            }
          }

          if (!admin) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ [AUTH DEBUG] Hiçbir tabloda admin bulunamadı:', credentials.email)
            }
            return null
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH DEBUG] Admin bulundu:', admin.email, 'Status:', admin.status)
          }

          // Admin aktif mi?
          if (admin.status !== 'active') {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ [AUTH DEBUG] Admin aktif değil:', admin.status)
            }
            return null
          }

          // Şifre kontrolü
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 [AUTH DEBUG] Şifre kontrol ediliyor...')
          }
          const isValidPassword = await bcrypt.compare(credentials.password, admin.password)
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH DEBUG] Şifre kontrolü sonucu:', isValidPassword)
          }
          
          if (!isValidPassword) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ [AUTH DEBUG] Şifre yanlış!')
            }
            return null
          }

          // 2FA Kontrolü (Email tabanlı)
          if (admin.twoFactorEnabled) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔐 [AUTH DEBUG] 2FA etkin, kontrol ediliyor...')
            }
            
            if (!credentials.twoFactorCode) {
              if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ [AUTH DEBUG] 2FA etkin ama kod girilmemiş!')
              }
              return null // Frontend'e hata döndür, o email gönderir
            }
            
            // Email tabanlı kod kontrolü (GÜVENLIK: Production'da loglanmaz!)
            if (process.env.NODE_ENV === 'development') {
              console.log('🔐 [AUTH DEBUG] Verifying 2FA code')
            }
            
            if (admin.twoFactorSecret !== credentials.twoFactorCode) {
              if (process.env.NODE_ENV === 'development') {
                console.log('❌ [AUTH DEBUG] 2FA kodu yanlış!')
              }
              return null
            }
            
            // Süre kontrolü (10 dakika)
            if (admin.twoFactorSetupAt) {
              const expiry = new Date(admin.twoFactorSetupAt as any)
              const now = new Date()
              
              if (now > expiry) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('❌ [AUTH DEBUG] 2FA kodu süresi dolmuş!')
                }
                return null
              }
            }
            
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ [AUTH DEBUG] 2FA kodu doğru!')
            }
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('🎉 [AUTH DEBUG] Giriş başarılı! Admin döndürülüyor:', admin.email)
          }
          return {
            id: admin.id,
            email: admin.email,
            name: `${admin.firstName} ${admin.lastName}`,
            role: admin.role,
            status: admin.status
          }

        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log('💥 [AUTH DEBUG] Hata oluştu:', error.message)
          }
          console.error('Authentication error:', error) // Production'da da önemli hataları logla
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Çıkış işlemi için özel kontrol
      if (url.includes('signout') || url.includes('logout')) {
        return baseUrl
      }
      
      // Root path için dashboard'a yönlendir
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`
    }
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict', // CSRF koruması için strict
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Production'da HTTPS zorunlu
        maxAge: 86400, // 24 hours
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }