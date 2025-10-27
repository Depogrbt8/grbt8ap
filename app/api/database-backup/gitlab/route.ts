import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'
import fs from 'fs'
import path from 'path'

// GitLab backup bilgileri
const GITLAB_TOKEN = process.env.GITLAB_BACKUP_TOKEN || ''
const GITLAB_REPO = 'Depogrbt8/gunlukyedek'
const GITLAB_API = 'https://gitlab.com/api/v4'

// Gece saat 4'te çalışacak GitLab backup sistemi
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
    console.log('🤖 GitLab backup sistemi tetiklendi - Gece saat 4:00')

    // GitLab token kontrolü
    if (!GITLAB_TOKEN) {
      throw new Error('GITLAB_BACKUP_TOKEN environment variable bulunamadı')
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

    // 3. Backup verisini hazırla
    const backupData = {
      metadata: {
        timestamp,
        backupDate,
        backupTime,
        version: '1.0',
        description: 'Kapsamlı Admin Panel Database Backup (GitLab) - Prisma Schema ve Tüm Tablolar',
        repo: `https://gitlab.com/${GITLAB_REPO}`,
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

    // 5. GitLab'a yükle
    console.log(`⬆️ Backup dosyası GitLab'a yükleniyor: ${backupFileName}`)
    await uploadToGitLab(`database/${backupFileName}`, backupContent, `Daily full backup - ${backupDate} ${backupTime}`)

    const totalRecords = Object.values(databaseData).reduce((sum: number, table) => sum + (Array.isArray(table) ? table.length : 0), 0)
    const fileSize = (Buffer.byteLength(backupContent, 'utf8') / 1024).toFixed(1)

    console.log(`✅ GitLab backup başarıyla tamamlandı: ${fileSize} KB`)

    return NextResponse.json({
      success: true,
      message: 'GitLab backup başarıyla tamamlandı',
      timestamp,
      backup: {
        fileName: backupFileName,
        records: backupData.statistics,
        totalRecords: totalRecords,
        fileSize: `${fileSize} KB`
      }
    })

  } catch (error) {
    console.error('❌ GitLab backup hatası:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GitLab'a dosya yükleme fonksiyonu
async function uploadToGitLab(filePath: string, content: string, commitMessage: string) {
  // GitLab API için project ID'yi al
  const projectId = await getProjectId()
  
  const url = `${GITLAB_API}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`

  // Mevcut dosyayı kontrol et
  let existingFile = null
  try {
    const existingResponse = await fetch(`${url}?ref=main`, {
      headers: {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
        'Accept': 'application/json'
      }
    })
    if (existingResponse.ok) {
      existingFile = await existingResponse.json()
    }
  } catch (error) {
    console.log('Mevcut dosya kontrolü başarısız, yeni dosya oluşturulacak:', error)
  }

  const requestBody: any = {
    branch: 'main',
    content: Buffer.from(content).toString('base64'),
    encoding: 'base64',
    commit_message: commitMessage
  }

  // Eğer dosya varsa SHA'yı ekle
  if (existingFile && existingFile.last_commit_id) {
    requestBody.last_commit_id = existingFile.last_commit_id
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': GITLAB_TOKEN,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`GitLab API hatası: ${response.status} - ${errorData.message || errorData.error}`)
  }

  return response.json()
}

// GitLab project ID'yi al
async function getProjectId(): Promise<string> {
  const url = `${GITLAB_API}/projects/${encodeURIComponent(GITLAB_REPO)}`
  
  const response = await fetch(url, {
    headers: {
      'PRIVATE-TOKEN': GITLAB_TOKEN,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`GitLab project bulunamadı: ${GITLAB_REPO}`)
  }

  const project = await response.json()
  return project.id.toString()
}

// Prisma schema hash fonksiyonu
async function getSchemaHash(schemaContent: string) {
  try {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(schemaContent).digest('hex')
  } catch (error) {
    return 'error'
  }
}
