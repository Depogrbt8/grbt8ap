import { prisma } from '@/app/lib/prisma'

// Connection management ve error handling için utility
export class ConnectionManager {
  private static instance: ConnectionManager
  private connectionRetries = 0
  private maxRetries = 3
  private retryDelay = 1000 // 1 saniye

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  // Güvenli database işlemi
  async safeDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'database_operation'
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${operationName} - Deneme ${attempt}/${this.maxRetries}`)
        
        // Connection health check
        await this.checkConnectionHealth()
        
        const result = await operation()
        
        // Başarılı olursa retry counter'ı sıfırla
        this.connectionRetries = 0
        
        console.log(`✅ ${operationName} başarılı`)
        return result
        
      } catch (error) {
        lastError = error as Error
        console.error(`❌ ${operationName} hatası (deneme ${attempt}):`, error)
        
        // ECONNRESET veya connection error'ları için retry
        if (this.isConnectionError(error) && attempt < this.maxRetries) {
          console.log(`⏳ ${this.retryDelay * attempt}ms bekleniyor...`)
          await this.delay(this.retryDelay * attempt)
          
          // Connection'ı yeniden başlat
          await this.reconnect()
        } else {
          break
        }
      }
    }

    throw new Error(`${operationName} başarısız: ${lastError?.message}`)
  }

  // Connection health check
  private async checkConnectionHealth(): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      throw new Error(`Database connection sağlıksız: ${error}`)
    }
  }

  // Connection error kontrolü
  private isConnectionError(error: any): boolean {
    const connectionErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Connection terminated',
      'Connection lost',
      'Connection timeout'
    ]
    
    const errorMessage = error?.message || error?.code || ''
    return connectionErrors.some(err => 
      errorMessage.includes(err) || errorMessage.includes(err.toLowerCase())
    )
  }

  // Yeniden bağlanma
  private async reconnect(): Promise<void> {
    try {
      console.log('🔄 Database connection yeniden başlatılıyor...')
      await prisma.$disconnect()
      await this.delay(500)
      await prisma.$connect()
      console.log('✅ Database connection yeniden başlatıldı')
    } catch (error) {
      console.error('❌ Reconnection hatası:', error)
      throw error
    }
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Connection pool stats
  async getConnectionStats() {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          state,
          COUNT(*) as count,
          MAX(backend_start) as oldest_connection
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state
      ` as any[]

      return {
        connections: stats,
        timestamp: new Date().toISOString(),
        retryCount: this.connectionRetries
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Global connection manager instance
export const connectionManager = ConnectionManager.getInstance()

// Request timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  operationName: string = 'operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationName} timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  ])
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Deneme ${attempt}/${maxRetries}`)
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`❌ ${operationName} hatası (deneme ${attempt}):`, error)

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`⏳ ${delay}ms bekleniyor...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`${operationName} başarısız (${maxRetries} deneme): ${lastError?.message}`)
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 dakika
  ) {}

  async execute<T>(operation: () => Promise<T>, operationName: string = 'operation'): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
        console.log(`🔄 Circuit breaker HALF_OPEN durumuna geçti: ${operationName}`)
      } else {
        throw new Error(`Circuit breaker OPEN: ${operationName} geçici olarak devre dışı`)
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
      console.warn(`⚠️ Circuit breaker OPEN durumuna geçti (${this.failures} hata)`)
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker()

// Error classification
export function classifyError(error: any): {
  type: 'CONNECTION' | 'TIMEOUT' | 'VALIDATION' | 'UNKNOWN'
  retryable: boolean
  message: string
} {
  const errorMessage = error?.message || error?.code || ''
  
  if (errorMessage.includes('ECONNRESET') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection')) {
    return {
      type: 'CONNECTION',
      retryable: true,
      message: 'Database bağlantı hatası'
    }
  }
  
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('TIMEOUT')) {
    return {
      type: 'TIMEOUT',
      retryable: true,
      message: 'İşlem zaman aşımı'
    }
  }
  
  if (errorMessage.includes('validation') || 
      errorMessage.includes('invalid')) {
    return {
      type: 'VALIDATION',
      retryable: false,
      message: 'Veri doğrulama hatası'
    }
  }
  
  return {
    type: 'UNKNOWN',
    retryable: false,
    message: 'Bilinmeyen hata'
  }
}


