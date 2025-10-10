import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const backupFile = path.join(process.cwd(), 'backups', 'database-backup.json')
    
    // Backup klasörünü oluştur
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    let lastBackup: string | undefined
    let totalRecords = 0
    let backupSize = '0 KB'
    let changes = {
      newUsers: 0,
      newReservations: 0,
      newPayments: 0,
      updatedRecords: 0
    }

    // Mevcut backup dosyasını kontrol et
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile)
      lastBackup = stats.mtime.toISOString()
      backupSize = (stats.size / 1024).toFixed(1) + ' KB'
      
      // Backup içeriğini oku
      try {
        const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
        if (backupContent.metadata) {
          changes = backupContent.metadata.changes || changes
        }
      } catch (error) {
        console.log('Backup dosyası okunamadı:', error)
      }
    }

    // Toplam kayıt sayısını hesapla
    try {
      const counts = await Promise.all([
        prisma.user.count(),
        prisma.reservation.count(),
        prisma.payment.count(),
        prisma.passenger.count(),
        prisma.priceAlert.count(),
        prisma.searchFavorite.count(),
        prisma.surveyResponse.count()
      ])
      
      totalRecords = counts.reduce((sum, count) => sum + count, 0)
    } catch (error) {
      console.error('Kayıt sayıları alınamadı:', error)
    }

    // Sonraki yedekleme zamanını hesapla (2 saatte bir)
    let nextBackup: string | undefined
    if (lastBackup) {
      const lastBackupTime = new Date(lastBackup)
      const nextBackupTime = new Date(lastBackupTime.getTime() + 2 * 60 * 60 * 1000)
      nextBackup = nextBackupTime.toISOString()
    } else {
      // İlk yedekleme için şimdi
      nextBackup = new Date().toISOString()
    }

    // Otomatik yedekleme durumu - Hep aktif
    const isActive = true

    const status = {
      lastBackup,
      nextBackup,
      totalRecords,
      backupSize,
      isActive,
      changes,
      interval: '2 saatte bir',
      cronSchedule: '0 */2 * * *'
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('❌ Database backup durumu alınamadı:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
