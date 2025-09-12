import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { createLog } from '@/app/lib/logger'

const execAsync = promisify(exec)

interface BackupConfig {
  enabled: boolean
  schedule: string // cron format
  retention: number // days
  includeDatabase: boolean
  includeUploads: boolean
  includeLogs: boolean
  lastBackup?: string
  nextBackup?: string
}

export async function GET() {
  try {
    // Yedekleme konfigürasyonunu oku
    const configPath = path.join(process.cwd(), 'shared', 'backup-config.json')
    let config: BackupConfig = {
      enabled: false,
      schedule: '0 2 * * *', // Her gün saat 02:00
      retention: 7,
      includeDatabase: true,
      includeUploads: true,
      includeLogs: true
    }

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      config = { ...config, ...JSON.parse(configData) }
    }

    // Son yedekleme bilgilerini al
    const backupDir = path.join(process.cwd(), '..', 'admin64_backup')
    let lastBackup = null
    let backupSize = 0

    if (fs.existsSync(backupDir)) {
      const stats = fs.statSync(backupDir)
      lastBackup = stats.mtime.toISOString()
      
      // Klasör boyutunu hesapla
      try {
        const { stdout } = await execAsync(`du -sh "${backupDir}"`)
        backupSize = parseInt(stdout.split('\t')[0].replace(/[^\d]/g, '')) || 0
      } catch (error) {
        console.log('Backup boyutu hesaplanamadı')
      }
    }

    // Sonraki yedekleme zamanını hesapla
    const nextBackup = calculateNextBackup(config.schedule)

    return NextResponse.json({
      success: true,
      data: {
        config,
        lastBackup,
        nextBackup,
        backupSize,
        status: config.enabled ? 'active' : 'disabled'
      }
    })
  } catch (error) {
    console.error('Yedekleme durumu alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'Yedekleme durumu alınamadı'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    if (action === 'create') {
      // Manuel yedekleme oluştur
      const result = await createBackup()
      
      if (result.success) {
        await createLog({
          level: 'INFO',
          message: 'Manuel yedekleme oluşturuldu',
          source: 'backup',
          metadata: {
            backupPath: result.path,
            size: result.size
          }
        })
      }

      return NextResponse.json(result)
    }

    if (action === 'configure') {
      // Yedekleme konfigürasyonunu güncelle
      const configPath = path.join(process.cwd(), 'shared', 'backup-config.json')
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      
      await createLog({
        level: 'INFO',
        message: 'Yedekleme konfigürasyonu güncellendi',
        source: 'backup',
        metadata: config
      })

      return NextResponse.json({
        success: true,
        message: 'Yedekleme konfigürasyonu güncellendi'
      })
    }

    if (action === 'toggle') {
      // Yedekleme durumunu aç/kapat
      const configPath = path.join(process.cwd(), 'shared', 'backup-config.json')
      let currentConfig: BackupConfig = {
        enabled: false,
        schedule: '0 2 * * *',
        retention: 7,
        includeDatabase: true,
        includeUploads: true,
        includeLogs: true
      }

      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8')
        currentConfig = { ...currentConfig, ...JSON.parse(configData) }
      }

      currentConfig.enabled = !currentConfig.enabled
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2))

      await createLog({
        level: 'INFO',
        message: `Otomatik yedekleme ${currentConfig.enabled ? 'açıldı' : 'kapatıldı'}`,
        source: 'backup',
        metadata: { enabled: currentConfig.enabled }
      })

      return NextResponse.json({
        success: true,
        message: `Otomatik yedekleme ${currentConfig.enabled ? 'açıldı' : 'kapatıldı'}`,
        enabled: currentConfig.enabled
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz işlem'
    })
  } catch (error) {
    console.error('Yedekleme işlemi hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Yedekleme işlemi başarısız'
    })
  }
}

async function createBackup() {
  try {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '') // HHMMSS
    const backupName = `bckp${dateStr}${timeStr}`
    const backupPath = path.join(process.cwd(), '..', backupName)
    
    // Yedekleme klasörünü oluştur
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true })
    }

    // Admin paneli yedekle
    const adminSource = path.join(process.cwd())
    const adminDest = path.join(backupPath, 'grbt8ap')
    await execAsync(`cp -r "${adminSource}" "${adminDest}"`)

    // Ana site yedekle
    const mainSource = path.join(process.cwd(), '..', 'grbt8')
    const mainDest = path.join(backupPath, 'grbt8')
    if (fs.existsSync(mainSource)) {
      await execAsync(`cp -r "${mainSource}" "${mainDest}"`)
    }

    // README dosyası oluştur
    const readmeContent = `# Backup - ${new Date().toLocaleString('tr-TR')}

Bu yedek şunları içerir:
- grbt8ap: Admin paneli (port 3004)
- grbt8: Ana site (port 4000)

Yedek adı: ${backupName}
Yedek tarihi: ${new Date().toLocaleString('tr-TR')}
Oluşturan: Otomatik yedekleme sistemi
`
    fs.writeFileSync(path.join(backupPath, 'README.md'), readmeContent)

    // Yedekleme boyutunu hesapla
    const { stdout } = await execAsync(`du -sh "${backupPath}"`)
    const size = stdout.split('\t')[0]

    return {
      success: true,
      message: 'Yedekleme başarıyla oluşturuldu',
      path: backupPath,
      size: size,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Yedekleme oluşturma hatası:', error)
    return {
      success: false,
      error: 'Yedekleme oluşturulamadı'
    }
  }
}

function calculateNextBackup(schedule: string): string {
  // Basit cron parsing (sadece saat için)
  const parts = schedule.split(' ')
  const hour = parseInt(parts[1]) || 2
  
  const now = new Date()
  const nextBackup = new Date()
  nextBackup.setHours(hour, 0, 0, 0)
  
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1)
  }
  
  return nextBackup.toISOString()
}
