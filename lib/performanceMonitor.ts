import { NextRequest } from 'next/server'

// Performance monitoring için utility
export class PerformanceMonitor {
  private startTime: number
  private memoryStart: NodeJS.MemoryUsage
  private checkpoints: Array<{ name: string; time: number; memory: NodeJS.MemoryUsage }> = []

  constructor() {
    this.startTime = Date.now()
    this.memoryStart = process.memoryUsage()
    this.checkpoint('start')
  }

  checkpoint(name: string) {
    const time = Date.now()
    const memory = process.memoryUsage()
    this.checkpoints.push({ name, time, memory })
    
    console.log(`⏱️ Checkpoint [${name}]: ${time - this.startTime}ms, Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB`)
  }

  getReport() {
    const totalTime = Date.now() - this.startTime
    const memoryEnd = process.memoryUsage()
    
    const memoryDiff = {
      rss: Math.round((memoryEnd.rss - this.memoryStart.rss) / 1024 / 1024),
      heapUsed: Math.round((memoryEnd.heapUsed - this.memoryStart.heapUsed) / 1024 / 1024),
      heapTotal: Math.round((memoryEnd.heapTotal - this.memoryStart.heapTotal) / 1024 / 1024)
    }

    return {
      totalTime,
      memoryStart: {
        rss: Math.round(this.memoryStart.rss / 1024 / 1024),
        heapUsed: Math.round(this.memoryStart.heapUsed / 1024 / 1024),
        heapTotal: Math.round(this.memoryStart.heapTotal / 1024 / 1024)
      },
      memoryEnd: {
        rss: Math.round(memoryEnd.rss / 1024 / 1024),
        heapUsed: Math.round(memoryEnd.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryEnd.heapTotal / 1024 / 1024)
      },
      memoryDiff,
      checkpoints: this.checkpoints.map((cp, index) => ({
        name: cp.name,
        timeFromStart: cp.time - this.startTime,
        memoryUsed: Math.round(cp.memory.heapUsed / 1024 / 1024),
        timeFromPrevious: index > 0 ? cp.time - this.checkpoints[index - 1].time : 0
      }))
    }
  }
}

// Request timeout kontrolü
export function checkRequestTimeout(request: NextRequest, maxTimeout: number = 8000): boolean {
  const requestTime = request.headers.get('x-request-time')
  if (requestTime) {
    const elapsed = Date.now() - parseInt(requestTime)
    return elapsed > maxTimeout
  }
  return false
}

// Database connection pool monitoring
export async function getDatabaseStats() {
  try {
    const { prisma } = await import('@/app/lib/prisma')
    
    // Prisma connection pool bilgileri
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        state,
        COUNT(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    ` as any[]

    // Database boyutu
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    ` as any[]

    return {
      connectionPool: poolInfo,
      databaseSize: dbSize[0]?.size || 'Unknown',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Database stats alınamadı:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Backup performance raporu oluştur
export function createPerformanceReport(
  operation: string,
  monitor: PerformanceMonitor,
  additionalStats?: any
) {
  const report = monitor.getReport()
  
  return {
    operation,
    timestamp: new Date().toISOString(),
    performance: {
      totalTime: report.totalTime,
      memoryUsage: report.memoryDiff,
      checkpoints: report.checkpoints,
      efficiency: {
        memoryPerSecond: report.memoryDiff.heapUsed / (report.totalTime / 1000),
        operationsPerSecond: 1 / (report.totalTime / 1000)
      }
    },
    additionalStats,
    recommendations: generateRecommendations(report)
  }
}

// Performance önerileri oluştur
function generateRecommendations(report: any): string[] {
  const recommendations: string[] = []
  
  if (report.totalTime > 5000) {
    recommendations.push('⚠️ İşlem süresi 5 saniyeyi aştı, pagination kullanmayı düşünün')
  }
  
  if (report.memoryDiff.heapUsed > 100) {
    recommendations.push('⚠️ Memory kullanımı 100MB\'ı aştı, chunked processing kullanın')
  }
  
  if (report.memoryDiff.heapUsed / (report.totalTime / 1000) > 20) {
    recommendations.push('⚠️ Memory leak riski var, garbage collection kontrolü yapın')
  }
  
  const slowCheckpoints = report.checkpoints.filter((cp: any) => cp.timeFromPrevious > 1000)
  if (slowCheckpoints.length > 0) {
    recommendations.push(`⚠️ Yavaş checkpoint'ler: ${slowCheckpoints.map((cp: any) => cp.name).join(', ')}`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Performance optimal seviyede')
  }
  
  return recommendations
}

// Backup endpoint'leri için performance middleware
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  operationName: string
) {
  return async (...args: T) => {
    const monitor = new PerformanceMonitor()
    
    try {
      monitor.checkpoint('operation_start')
      const result = await handler(...args)
      monitor.checkpoint('operation_end')
      
      const report = createPerformanceReport(operationName, monitor, {
        success: true,
        resultSize: JSON.stringify(result).length
      })
      
      console.log(`📊 Performance Report [${operationName}]:`, report)
      
      return {
        ...result,
        performance: report
      }
    } catch (error) {
      monitor.checkpoint('operation_error')
      
      const report = createPerformanceReport(operationName, monitor, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.error(`❌ Performance Report [${operationName}]:`, report)
      
      throw error
    }
  }
}
