import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Vercel Cron Jobs için - Her 2 saatte bir çalışır
export async function GET(request: NextRequest) {
  try {
    console.log('🤖 Otomatik database backup tetiklendi')
    
    // Sistem hep aktif - environment variable kontrolü yok
    
    const backupFile = path.join(process.cwd(), 'backups', 'database-backup.json')
    const backupDir = path.join(process.cwd(), 'backups')
    
    // Backup klasörünü oluştur
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString()
    let existingBackup: any = null
    let changes = {
      newUsers: 0,
      newReservations: 0,
      newPayments: 0,
      updatedRecords: 0,
      deletedRecords: 0
    }

    // Mevcut backup'ı oku
    if (fs.existsSync(backupFile)) {
      try {
        existingBackup = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
        console.log('📖 Mevcut backup okundu')
      } catch (error) {
        console.log('⚠️ Mevcut backup okunamadı, yeni backup oluşturulacak')
      }
    }

    // Tüm tabloları yedekle
    const currentData = {
      users: await prisma.user.findMany(),
      reservations: await prisma.reservation.findMany(),
      payments: await prisma.payment.findMany(),
      passengers: await prisma.passenger.findMany(),
      priceAlerts: await prisma.priceAlert.findMany(),
      searchFavorites: await prisma.searchFavorite.findMany(),
      surveyResponses: await prisma.surveyResponse.findMany()
    }

    // Değişiklikleri hesapla
    if (existingBackup && existingBackup.data) {
      // Yeni kayıtları bul
      changes.newUsers = currentData.users.length - existingBackup.data.users.length
      changes.newReservations = currentData.reservations.length - existingBackup.data.reservations.length
      changes.newPayments = currentData.payments.length - existingBackup.data.payments.length
      
      // Güncellenen kayıtları bul (updatedAt'e göre)
      const updatedUsers = currentData.users.filter(user => {
        const existingUser = existingBackup.data.users.find((u: any) => u.id === user.id)
        return existingUser && new Date(user.updatedAt) > new Date(existingUser.updatedAt)
      })
      
      changes.updatedRecords = updatedUsers.length
      
      console.log(`📊 Değişiklikler: +${changes.newUsers} kullanıcı, +${changes.newReservations} rezervasyon, +${changes.newPayments} ödeme, ${changes.updatedRecords} güncellenen`)
    } else {
      // İlk backup
      changes.newUsers = currentData.users.length
      changes.newReservations = currentData.reservations.length
      changes.newPayments = currentData.payments.length
      console.log('🆕 İlk backup oluşturuluyor')
    }

    // Yeni backup oluştur
    const newBackup = {
      metadata: {
        timestamp,
        version: '2.0',
        type: 'incremental',
        changes,
        totalRecords: Object.values(currentData).reduce((sum, table) => sum + (Array.isArray(table) ? table.length : 0), 0)
      },
      data: currentData,
      schema: {
        // Prisma schema hash'i (değişiklik kontrolü için)
        hash: await getSchemaHash()
      }
    }

    // Backup'ı kaydet
    fs.writeFileSync(backupFile, JSON.stringify(newBackup, null, 2))
    
    const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(1)
    console.log(`✅ Database backup tamamlandı: ${fileSize} KB`)

    return NextResponse.json({
      success: true,
      message: 'Database incremental backup başarıyla tamamlandı',
      timestamp,
      data: {
        updatedRecords: changes.updatedRecords,
        newRecords: changes.newUsers + changes.newReservations + changes.newPayments,
        deletedRecords: changes.deletedRecords,
        totalRecords: newBackup.metadata.totalRecords,
        fileSize: `${fileSize} KB`
      }
    })

  } catch (error) {
    console.error('❌ Database backup hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Schema hash fonksiyonu
async function getSchemaHash() {
  try {
    const crypto = require('crypto')
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8')
      return crypto.createHash('md5').update(schemaContent).digest('hex')
    }
    
    return 'unknown'
  } catch (error) {
    return 'error'
  }
}
