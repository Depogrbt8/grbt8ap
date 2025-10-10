#!/usr/bin/env node

/**
 * AUTO BACKUP - Otomatik Veritabanı Yedekleme
 * Her tehlikeli işlem öncesi otomatik backup alır
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class AutoBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups/auto-backups')
    this.maxBackups = 10 // Son 10 backup'ı sakla
    this.ensureBackupDir()
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  // Timestamp oluştur
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-')
  }

  // Prisma backup (JSON format)
  async createPrismaBackup(reason = 'auto') {
    const timestamp = this.getTimestamp()
    const backupFile = path.join(this.backupDir, `prisma-backup-${timestamp}-${reason}.json`)
    
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      console.log('🔄 Prisma backup oluşturuluyor...')
      
      const backup = {
        metadata: {
          timestamp: new Date().toISOString(),
          reason: reason,
          version: '1.0',
          environment: process.env.NODE_ENV || 'development'
        },
        data: {
          users: await prisma.user.findMany(),
          passengers: await prisma.passenger.findMany(),
          reservations: await prisma.reservation.findMany(),
          flights: await prisma.flight.findMany(),
          airlines: await prisma.airline.findMany(),
          airports: await prisma.airport.findMany(),
        },
        statistics: {
          totalUsers: 0,
          totalPassengers: 0,
          totalReservations: 0,
          totalFlights: 0,
        }
      }

      // İstatistikleri hesapla
      backup.statistics.totalUsers = backup.data.users.length
      backup.statistics.totalPassengers = backup.data.passengers.length
      backup.statistics.totalReservations = backup.data.reservations.length
      backup.statistics.totalFlights = backup.data.flights.length

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
      
      await prisma.$disconnect()
      
      console.log(`✅ Prisma backup oluşturuldu: ${backupFile}`)
      console.log(`📊 İstatistikler: ${backup.statistics.totalUsers} kullanıcı, ${backup.statistics.totalReservations} rezervasyon`)
      
      return backupFile
    } catch (error) {
      console.error('❌ Prisma backup hatası:', error)
      return null
    }
  }

  // SQL dump backup (PostgreSQL)
  async createSQLBackup(reason = 'auto') {
    const timestamp = this.getTimestamp()
    const backupFile = path.join(this.backupDir, `sql-backup-${timestamp}-${reason}.sql`)
    
    try {
      console.log('🔄 SQL dump backup oluşturuluyor...')
      
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        throw new Error('DATABASE_URL environment variable not found')
      }

      // pg_dump komutu
      const dumpCommand = `pg_dump "${dbUrl}" > "${backupFile}"`
      
      execSync(dumpCommand, { stdio: 'pipe' })
      
      console.log(`✅ SQL backup oluşturuldu: ${backupFile}`)
      return backupFile
    } catch (error) {
      console.error('❌ SQL backup hatası:', error)
      return null
    }
  }

  // Schema backup
  createSchemaBackup(reason = 'auto') {
    const timestamp = this.getTimestamp()
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
    const backupFile = path.join(this.backupDir, `schema-backup-${timestamp}-${reason}.prisma`)
    
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, backupFile)
      console.log(`✅ Schema backup oluşturuldu: ${backupFile}`)
      return backupFile
    }
    
    return null
  }

  // Tam backup (tüm yöntemler)
  async createFullBackup(reason = 'auto') {
    console.log(`\n🔄 Tam backup başlatılıyor... (Sebep: ${reason})`)
    
    const results = {
      prisma: null,
      sql: null,
      schema: null,
      timestamp: this.getTimestamp(),
      reason: reason
    }

    // Paralel backup
    try {
      results.prisma = await this.createPrismaBackup(reason)
      results.schema = this.createSchemaBackup(reason)
      
      // SQL backup sadece production'da
      if (process.env.NODE_ENV === 'production') {
        results.sql = await this.createSQLBackup(reason)
      }
    } catch (error) {
      console.error('❌ Backup hatası:', error)
    }

    // Backup manifest oluştur
    const manifestFile = path.join(this.backupDir, `manifest-${results.timestamp}.json`)
    fs.writeFileSync(manifestFile, JSON.stringify(results, null, 2))
    
    console.log(`✅ Backup tamamlandı: ${manifestFile}`)
    
    // Eski backup'ları temizle
    this.cleanupOldBackups()
    
    return results
  }

  // Eski backup'ları temizle
  cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
      const backupFiles = files
        .filter(file => file.startsWith('prisma-backup-') || file.startsWith('sql-backup-') || file.startsWith('schema-backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stat: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime)

      // En eski backup'ları sil
      if (backupFiles.length > this.maxBackups) {
        const toDelete = backupFiles.slice(this.maxBackups)
        toDelete.forEach(file => {
          fs.unlinkSync(file.path)
          console.log(`🗑️  Eski backup silindi: ${file.name}`)
        })
      }
    } catch (error) {
      console.error('❌ Backup temizleme hatası:', error)
    }
  }

  // Backup listesi
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
      const backupFiles = files
        .filter(file => file.endsWith('.json') || file.endsWith('.sql') || file.endsWith('.prisma'))
        .map(file => {
          const filePath = path.join(this.backupDir, file)
          const stat = fs.statSync(filePath)
          return {
            name: file,
            size: (stat.size / 1024 / 1024).toFixed(2) + ' MB',
            created: stat.mtime.toISOString(),
            path: filePath
          }
        })
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

      console.log('\n📋 Mevcut Backup\'lar:')
      console.log('='.repeat(80))
      backupFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`)
        console.log(`   Boyut: ${file.size}`)
        console.log(`   Tarih: ${file.created}`)
        console.log('')
      })

      return backupFiles
    } catch (error) {
      console.error('❌ Backup listesi hatası:', error)
      return []
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const backup = new AutoBackup()
  const command = process.argv[2] || 'full'
  const reason = process.argv[3] || 'manual'

  switch (command) {
    case 'full':
      backup.createFullBackup(reason)
      break
    case 'prisma':
      backup.createPrismaBackup(reason)
      break
    case 'sql':
      backup.createSQLBackup(reason)
      break
    case 'schema':
      backup.createSchemaBackup(reason)
      break
    case 'list':
      backup.listBackups()
      break
    default:
      console.log('Kullanım: node auto-backup.js [full|prisma|sql|schema|list] [reason]')
  }
}

module.exports = AutoBackup
