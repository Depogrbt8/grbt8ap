import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import bcrypt from 'bcryptjs'
import { createRateLimit, rateLimitConfigs } from '@/lib/rateLimit'
import { createLog } from '@/lib/logger'

// Rate limiting for authentication
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `auth:${ip}`
  }
})

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          console.log('🔍 [AUTH DEBUG] Authorize fonksiyonu çağrıldı')
          console.log('📧 [AUTH DEBUG] Email:', credentials?.email)
          console.log('🔑 [AUTH DEBUG] Password length:', credentials?.password?.length)
          
          // Rate limiting check
          const rateLimitResult = await authRateLimit(req as any)
          if (rateLimitResult) {
            console.log('⚠️ [AUTH DEBUG] Rate limit exceeded')
            await createLog({
              level: 'warn',
              message: 'Rate limit exceeded for authentication',
              category: 'security',
              metadata: {
                ip: req?.headers?.get('x-forwarded-for') || 'unknown',
                userAgent: req?.headers?.get('user-agent'),
                endpoint: '/api/auth/signin'
              }
            })
            return null
          }

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ [AUTH DEBUG] Credentials eksik')
            return null
          }

          // Find user by email
          console.log('🔍 [AUTH DEBUG] Kullanıcı aranıyor:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log('❌ [AUTH DEBUG] Kullanıcı bulunamadı:', credentials.email)
            await createLog({
              level: 'warn',
              message: 'Failed login attempt - user not found',
              category: 'security',
              metadata: {
                email: credentials.email,
                ip: req?.headers?.get('x-forwarded-for') || 'unknown',
                userAgent: req?.headers?.get('user-agent')
              }
            })
            return null
          }

          console.log('✅ [AUTH DEBUG] Kullanıcı bulundu:', user.email, 'Status:', user.status)

          // Check if user is active
          if (user.status !== 'active') {
            await createLog({
              level: 'warn',
              message: 'Failed login attempt - inactive user',
              category: 'security',
              metadata: {
                email: credentials.email,
                userId: user.id,
                status: user.status
              }
            })
            return null
          }

          // Verify password
          console.log('🔍 [AUTH DEBUG] Şifre kontrol ediliyor...')
          console.log('🔑 [AUTH DEBUG] Girilen şifre:', credentials.password)
          console.log('🔐 [AUTH DEBUG] DB hash:', user.password.substring(0, 20) + '...')
          
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          console.log('✅ [AUTH DEBUG] Şifre kontrolü sonucu:', isValidPassword)
          
          if (!isValidPassword) {
            console.log('❌ [AUTH DEBUG] Şifre yanlış!')
            await createLog({
              level: 'warn',
              message: 'Failed login attempt - invalid password',
              category: 'security',
              metadata: {
                email: credentials.email,
                userId: user.id,
                ip: req?.headers?.get('x-forwarded-for') || 'unknown'
              }
            })
            return null
          }

          // Check if user has admin role
          if (user.role !== 'admin') {
            await createLog({
              level: 'warn',
              message: 'Failed login attempt - insufficient privileges',
              category: 'security',
              metadata: {
                email: credentials.email,
                userId: user.id,
                role: user.role
              }
            })
            return null
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          // Log successful login
          await createLog({
            level: 'info',
            message: 'Successful admin login',
            category: 'authentication',
            metadata: {
              email: credentials.email,
              userId: user.id,
              ip: req?.headers?.get('x-forwarded-for') || 'unknown',
              userAgent: req?.headers?.get('user-agent')
            }
          })

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
          console.log('💥 [AUTH DEBUG] Stack:', error.stack)
          
          await createLog({
            level: 'error',
            message: 'Authentication error',
            category: 'security',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              email: credentials?.email,
              ip: req?.headers?.get('x-forwarded-for') || 'unknown'
            }
          })
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
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
      // Always redirect to dashboard after login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      await createLog({
        level: 'info',
        message: 'User signed in',
        category: 'authentication',
        metadata: {
          userId: user.id,
          email: user.email,
          provider: account?.provider
        }
      })
    },
    async signOut({ session, token }) {
      await createLog({
        level: 'info',
        message: 'User signed out',
        category: 'authentication',
        metadata: {
          userId: token?.sub,
          email: session?.user?.email
        }
      })
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
