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
          // Kullanıcıyı veritabanından bul
          console.log('🔍 [AUTH DEBUG] Kullanıcı aranıyor:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log('❌ [AUTH DEBUG] Kullanıcı bulunamadı:', credentials.email)
            return null
          }

          console.log('✅ [AUTH DEBUG] Kullanıcı bulundu:', user.email, 'Status:', user.status)

          // Kullanıcı aktif mi?
          if (user.status !== 'active') {
            console.log('❌ [AUTH DEBUG] Kullanıcı aktif değil:', user.status)
            return null
          }

          // Şifre kontrolü
          console.log('🔍 [AUTH DEBUG] Şifre kontrol ediliyor...')
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          console.log('✅ [AUTH DEBUG] Şifre kontrolü sonucu:', isValidPassword)
          
          if (!isValidPassword) {
            console.log('❌ [AUTH DEBUG] Şifre yanlış!')
            return null
          }

          // Admin rolü kontrolü
          if (user.role !== 'admin') {
            console.log('❌ [AUTH DEBUG] Admin yetkisi yok:', user.role)
            return null
          }

          console.log('🎉 [AUTH DEBUG] Giriş başarılı! Kullanıcı döndürülüyor:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            status: user.status
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