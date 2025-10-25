import { prisma } from '@/app/lib/prisma'

// Backup optimizasyonu için konfigürasyon
export const BACKUP_CONFIG = {
  // Sayfa başına maksimum kayıt sayısı
  PAGE_SIZE: 1000,
  // Maksimum timeout süresi (ms)
  MAX_TIMEOUT: 8000,
  // Paralel işlem sayısı
  MAX_CONCURRENT: 3,
  // Büyük tablolar için özel limitler
  LARGE_TABLE_LIMITS: {
    users: 5000,
    reservations: 5000,
    payments: 5000,
    passengers: 5000,
    systemLogs: 2000,
    emailLogs: 2000,
    emailQueue: 1000
  }
}

// Tablo boyutlarını kontrol et
export async function getTableStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    ` as any[]

    return stats
  } catch (error) {
    console.error('Table stats alınamadı:', error)
    return []
  }
}

// Pagination ile güvenli veri çekme
export async function safeFindMany<T>(
  model: any,
  options: {
    page?: number
    limit?: number
    orderBy?: any
    where?: any
    select?: any
  } = {}
) {
  const { page = 1, limit = BACKUP_CONFIG.PAGE_SIZE, orderBy, where, select } = options
  
  try {
    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        orderBy: orderBy || { id: 'asc' },
        where,
        select
      }),
      model.count({ where })
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error(`Safe findMany error for ${model.name}:`, error)
    throw error
  }
}

// Büyük tablolar için chunked backup
export async function createChunkedBackup(tableName: string, model: any) {
  const startTime = Date.now()
  const chunks: any[] = []
  let page = 1
  let hasMore = true
  
  console.log(`📊 ${tableName} tablosu chunked backup başlatılıyor...`)
  
  while (hasMore && (Date.now() - startTime) < BACKUP_CONFIG.MAX_TIMEOUT) {
    try {
      const result = await safeFindMany(model, {
        page,
        limit: BACKUP_CONFIG.LARGE_TABLE_LIMITS[tableName as keyof typeof BACKUP_CONFIG.LARGE_TABLE_LIMITS] || BACKUP_CONFIG.PAGE_SIZE
      })
      
      chunks.push(...result.data)
      hasMore = result.pagination.hasNext
      page++
      
      console.log(`📄 ${tableName} - Sayfa ${page - 1}: ${result.data.length} kayıt`)
      
      // Memory koruması için küçük delay
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
    } catch (error) {
      console.error(`❌ ${tableName} chunked backup hatası:`, error)
      break
    }
  }
  
  const duration = Date.now() - startTime
  console.log(`✅ ${tableName} chunked backup tamamlandı: ${chunks.length} kayıt, ${duration}ms`)
  
  return {
    data: chunks,
    stats: {
      totalRecords: chunks.length,
      duration,
      pagesProcessed: page - 1,
      timeoutReached: (Date.now() - startTime) >= BACKUP_CONFIG.MAX_TIMEOUT
    }
  }
}

// Optimize edilmiş database backup
export async function createOptimizedDatabaseBackup() {
  const startTime = Date.now()
  const backup = {
    timestamp: new Date().toISOString(),
    source: 'https://www.grbt8.store/',
    database: 'production',
    optimization: 'chunked_pagination',
    tables: {} as any,
    stats: {
      total_tables: 0,
      total_records: 0,
      total_duration: 0,
      timeout_reached: false
    }
  }

  // Tablo listesi ve öncelik sırası
  const tableConfigs = [
    { name: 'users', model: prisma.user, priority: 'high' },
    { name: 'reservations', model: prisma.reservation, priority: 'high' },
    { name: 'payments', model: prisma.payment, priority: 'high' },
    { name: 'passengers', model: prisma.passenger, priority: 'medium' },
    { name: 'priceAlerts', model: prisma.priceAlert, priority: 'low' },
    { name: 'searchFavorites', model: prisma.searchFavorite, priority: 'low' },
    { name: 'surveyResponses', model: prisma.surveyResponse, priority: 'low' },
    { name: 'campaigns', model: prisma.campaign, priority: 'medium' },
    { name: 'systemSettings', model: prisma.systemSettings, priority: 'low' },
    { name: 'systemLogs', model: prisma.systemLog, priority: 'low' },
    { name: 'emailTemplates', model: prisma.emailTemplate, priority: 'low' },
    { name: 'emailQueue', model: prisma.emailQueue, priority: 'medium' },
    { name: 'emailLogs', model: prisma.emailLog, priority: 'low' },
    { name: 'emailSettings', model: prisma.emailSettings, priority: 'low' },
    { name: 'billingInfos', model: prisma.billingInfo, priority: 'medium' },
    { name: 'seoSettings', model: prisma.seoSettings, priority: 'low' }
  ]

  // Öncelik sırasına göre sırala
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  tableConfigs.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])

  console.log('🚀 Optimize edilmiş database backup başlatılıyor...')
  
  // Paralel işlem için batch'ler oluştur
  const batches = []
  for (let i = 0; i < tableConfigs.length; i += BACKUP_CONFIG.MAX_CONCURRENT) {
    batches.push(tableConfigs.slice(i, i + BACKUP_CONFIG.MAX_CONCURRENT))
  }

  // Her batch'i sırayla işle
  for (const batch of batches) {
    if ((Date.now() - startTime) >= BACKUP_CONFIG.MAX_TIMEOUT) {
      console.warn('⚠️ Timeout süresi doldu, backup yarıda kesildi')
      backup.stats.timeout_reached = true
      break
    }

    // Batch içindeki tabloları paralel işle
    const batchPromises = batch.map(async ({ name, model }) => {
      try {
        const result = await createChunkedBackup(name, model)
        return { name, ...result }
      } catch (error) {
        console.error(`❌ ${name} tablosu backup hatası:`, error)
        return { name, data: [], stats: { totalRecords: 0, duration: 0, error: error.message } }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    
    // Sonuçları backup'a ekle
    batchResults.forEach(result => {
      backup.tables[result.name] = result.data
      backup.stats.total_records += result.stats.totalRecords
    })
  }

  backup.stats.total_tables = Object.keys(backup.tables).length
  backup.stats.total_duration = Date.now() - startTime

  console.log(`✅ Optimize edilmiş backup tamamlandı: ${backup.stats.total_tables} tablo, ${backup.stats.total_records} kayıt, ${backup.stats.total_duration}ms`)

  return {
    success: true,
    data: backup,
    stats: backup.stats
  }
}

// Memory kullanımını kontrol et
export function checkMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    timestamp: new Date().toISOString()
  }
}

// Backup sırasında memory monitoring
export async function monitorBackupProgress(callback: () => Promise<any>) {
  const startMemory = checkMemoryUsage()
  console.log('🧠 Başlangıç memory:', startMemory)
  
  const result = await callback()
  
  const endMemory = checkMemoryUsage()
  console.log('🧠 Bitiş memory:', endMemory)
  
  const memoryDiff = {
    rss: endMemory.rss - startMemory.rss,
    heapUsed: endMemory.heapUsed - startMemory.heapUsed
  }
  
  console.log('📊 Memory değişimi:', memoryDiff)
  
  return {
    result,
    memory: {
      start: startMemory,
      end: endMemory,
      diff: memoryDiff
    }
  }
}
