import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimize edilmiş Prisma client konfigürasyonu
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool optimizasyonları
  __internal: {
    engine: {
      // Connection pool ayarları
      connectionLimit: 10,        // Maksimum connection sayısı
      poolTimeout: 20000,         // Pool timeout (20 saniye)
      connectTimeout: 10000,      // Connection timeout (10 saniye)
      queryTimeout: 30000,       // Query timeout (30 saniye)
      
      // Retry ayarları
      maxRetries: 3,
      retryDelay: 1000,
      
      // Health check
      healthCheckInterval: 30000, // 30 saniye
      
      // Error handling
      enableRetryOnConnectionError: true,
      enableRetryOnTimeout: true
    }
  }
})

// Connection health monitoring
let connectionHealthCheck: NodeJS.Timeout | null = null

// Health check başlat
function startHealthCheck() {
  if (connectionHealthCheck) return
  
  connectionHealthCheck = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection sağlıklı')
    } catch (error) {
      console.error('❌ Database connection sağlıksız:', error)
      
      // Connection'ı yeniden başlat
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        console.log('🔄 Database connection yeniden başlatıldı')
      } catch (reconnectError) {
        console.error('❌ Reconnection başarısız:', reconnectError)
      }
    }
  }, 60000) // Her dakika kontrol et
}

// Production'da health check başlat
if (process.env.NODE_ENV === 'production') {
  startHealthCheck()
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Graceful shutdown başlatılıyor...')
  
  if (connectionHealthCheck) {
    clearInterval(connectionHealthCheck)
  }
  
  await prisma.$disconnect()
  console.log('✅ Database connection kapatıldı')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM alındı, graceful shutdown...')
  
  if (connectionHealthCheck) {
    clearInterval(connectionHealthCheck)
  }
  
  await prisma.$disconnect()
  console.log('✅ Database connection kapatıldı')
  process.exit(0)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma