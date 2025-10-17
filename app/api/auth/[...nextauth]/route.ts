import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

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

        // Sabit admin hesabı - Prisma olmadan
        if (credentials.email === 'admin@grbt8.store' && credentials.password === 'admin123') {
          console.log('✅ [AUTH DEBUG] Sabit admin hesabı ile giriş başarılı')
          return {
            id: 'admin-123',
            email: 'admin@grbt8.store',
            name: 'Admin User',
            role: 'admin',
            status: 'active'
          }
        }

        console.log('❌ [AUTH DEBUG] Geçersiz credentials')
        return null
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