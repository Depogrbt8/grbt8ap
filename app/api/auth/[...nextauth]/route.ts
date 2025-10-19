import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 [AUTH DEBUG] Authorize çağrıldı')
        console.log('📧 [AUTH DEBUG] Email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH DEBUG] Credentials eksik')
          return null
        }

        try {
          // Admin'i veritabanından bul
          console.log('🔍 [AUTH DEBUG] Admin aranıyor:', credentials.email)
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          })

          if (!admin) {
            console.log('❌ [AUTH DEBUG] Admin bulunamadı:', credentials.email)
            return null
          }

          console.log('✅ [AUTH DEBUG] Admin bulundu:', admin.email, 'Status:', admin.status)

          // Admin aktif mi?
          if (admin.status !== 'active') {
            console.log('❌ [AUTH DEBUG] Admin aktif değil:', admin.status)
            return null
          }

          // Şifre kontrolü
          console.log('🔍 [AUTH DEBUG] Şifre kontrol ediliyor...')
          const isValidPassword = await bcrypt.compare(credentials.password, admin.password)
          console.log('✅ [AUTH DEBUG] Şifre kontrolü sonucu:', isValidPassword)
          
          if (!isValidPassword) {
            console.log('❌ [AUTH DEBUG] Şifre yanlış!')
            return null
          }

          console.log('🎉 [AUTH DEBUG] Giriş başarılı! Admin döndürülüyor:', admin.email)
          return {
            id: admin.id,
            email: admin.email,
            name: `${admin.firstName} ${admin.lastName}`,
            role: admin.role,
            status: admin.status
          }

        } catch (error) {
          console.log('💥 [AUTH DEBUG] Hata oluştu:', error.message)
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }