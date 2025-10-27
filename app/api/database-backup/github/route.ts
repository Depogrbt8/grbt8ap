import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'
import fs from 'fs'
import path from 'path'

// GitHub backup bilgileri
const GITHUB_TOKEN = process.env.GITHUB_BACKUP_TOKEN || ''
const GITHUB_REPO = 'grbt8yedek/adminhersaat'
const GITHUB_API = 'https://api.github.com'

// Her saatte bir çalışacak GitHub backup sistemi
export async function GET(request: NextRequest) {
  // GÜVENLİK: Vercel cron'dan geliyorsa izin ver, yoksa admin kontrolü yap
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me'
  const isVercelCron = authHeader === `Bearer ${cronSecret}`
  
  if (!isVercelCron) {
    // Vercel cron değilse admin kontrolü yap
    const adminCheck = await requireAdmin(request)
    if (adminCheck) return adminCheck
  }
  
  try {
    console.log('🤖 GitHub backup sistemi tetiklendi - Her saatte bir')
    
    // GitHub token kontrolü
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_BACKUP_TOKEN environment variable bulunamadı')
    }
    
    const timestamp = new Date().toISOString()
    const backupDate = new Date().toLocaleDateString('tr-TR')
    const backupTime = new Date().toLocaleTimeString('tr-TR')
    
    // 1. Database'den optimize edilmiş şekilde verileri al
    console.log('📊 Optimize edilmiş database verileri toplanıyor...')
    
    const { createOptimizedDatabaseBackup, monitorBackupProgress } = await import('@/lib/backupOptimizer')
    
    const backupResult = await monitorBackupProgress(async () => {
      return await createOptimizedDatabaseBackup()
    })
    
    if (!backupResult.result.success) {
      throw new Error(backupResult.result.error || 'Database backup başarısız')
    }
    
    const databaseData = backupResult.result.data.tables
    console.log(`🧠 Memory kullanımı: ${backupResult.memory.diff.heapUsed}MB artış`)
    
    // 2. Prisma schema'yı oku
    console.log('📋 Prisma schema okunuyor...')
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    let schemaContent = ''
    if (fs.existsSync(schemaPath)) {
      schemaContent = fs.readFileSync(schemaPath, 'utf8')
    }
    
    // 3. Backup dosyası oluştur
    const backupData = {
      metadata: {
        timestamp,
        date: backupDate,
        time: backupTime,
        version: '1.0',
        type: 'comprehensive_backup',
        source: 'grbt8ap_admin_panel'
      },
      database: databaseData,
      schema: {
        content: schemaContent,
        hash: await getSchemaHash(schemaContent)
      },
      statistics: {
        totalUsers: databaseData.users?.length || 0,
        totalPassengers: databaseData.passengers?.length || 0,
        totalReservations: databaseData.reservations?.length || 0,
        totalPayments: databaseData.payments?.length || 0,
        totalPriceAlerts: databaseData.priceAlerts?.length || 0,
        totalSearchFavorites: databaseData.searchFavorites?.length || 0,
        totalSurveyResponses: databaseData.surveyResponses?.length || 0,
        totalCampaigns: databaseData.campaigns?.length || 0,
        totalSystemSettings: databaseData.systemSettings?.length || 0,
        totalSystemLogs: databaseData.systemLogs?.length || 0,
        totalEmailTemplates: databaseData.emailTemplates?.length || 0,
        totalEmailQueue: databaseData.emailQueue?.length || 0,
        totalEmailLogs: databaseData.emailLogs?.length || 0,
        totalEmailSettings: databaseData.emailSettings?.length || 0,
        totalBillingInfos: databaseData.billingInfos?.length || 0,
        totalSeoSettings: databaseData.seoSettings?.length || 0,
        optimization_stats: backupResult.result.stats,
        memory_usage: backupResult.memory
      }
    }
    
    // 4. Tek dosya olarak backup'ı hazırla
    const backupFileName = `admin_backup_${timestamp.replace(/[:.]/g, '-')}.json`
    const backupContent = JSON.stringify(backupData, null, 2)
    
    console.log(`📦 Backup hazırlandı: ${backupFileName}`)
    console.log(`📊 Toplam kayıt: ${Object.values(backupData.statistics).reduce((sum: number, count: number) => sum + count, 0)}`)
    
    // 5. GitHub'a push et
    const pushResult = await pushToGitHub(backupFileName, backupContent)
    
    if (pushResult.success) {
      console.log('✅ GitHub backup başarılı:', pushResult.message)
      
      // Sistem log'una başarılı backup bilgisini yaz
      try {
        await prisma.systemLog.create({
          data: {
            level: 'info',
            message: 'GitHub backup başarıyla tamamlandı',
            source: 'backup_github',
            metadata: JSON.stringify({
              fileName: backupFileName,
              sha: pushResult.sha,
              sizeKb: Number((backupContent.length / 1024).toFixed(1))
            })
          }
        })
      } catch (logError) {
        console.warn('⚠️ Sistem log yazımı başarısız:', logError)
      }

      return NextResponse.json({
        success: true,
        message: 'GitHub backup başarıyla tamamlandı',
        timestamp,
        backup: {
          fileName: backupFileName,
          records: backupData.statistics,
          totalRecords: Object.values(backupData.statistics).reduce((sum: number, count: number) => sum + count, 0),
          fileSize: (backupContent.length / 1024).toFixed(1) + ' KB'
        }
      })
    } else {
      throw new Error(`GitHub push hatası: ${pushResult.error}`)
    }
    
  } catch (error) {
    console.error('❌ GitHub backup hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Yedekleme işlemi başarısız oldu',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GitHub'a dosya push etme fonksiyonu
async function pushToGitHub(fileName: string, content: string) {
  try {
    const filePath = `backups/${fileName}`
    const encodedContent = Buffer.from(content).toString('base64')
    
    // Önce dosyanın var olup olmadığını kontrol et
    const checkUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`
    let sha = null
    
    try {
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json()
        sha = existingFile.sha
        console.log('📝 Mevcut dosya güncelleniyor...')
      }
    } catch (error) {
      console.log('📝 Yeni dosya oluşturuluyor...')
    }
    
    // Dosyayı push et
    const pushUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`
    const pushResponse = await fetch(pushUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Admin backup - ${new Date().toLocaleString('tr-TR')}`,
        content: encodedContent,
        sha: sha // Mevcut dosya varsa güncelle, yoksa yeni oluştur
      })
    })
    
    if (pushResponse.ok) {
      const result = await pushResponse.json()
      return {
        success: true,
        message: `Dosya başarıyla ${sha ? 'güncellendi' : 'oluşturuldu'}`,
        sha: result.commit.sha
      }
    } else {
      const errorData = await pushResponse.json()
      throw new Error(`GitHub API hatası: ${errorData.message}`)
    }
    
  } catch (error) {
    console.error('❌ GitHub push hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Schema hash fonksiyonu
async function getSchemaHash(content: string): Promise<string> {
  try {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(content).digest('hex')
  } catch (error) {
    return 'unknown'
  }
}
