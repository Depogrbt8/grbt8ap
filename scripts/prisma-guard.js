#!/usr/bin/env node

/**
 * PRISMA GUARD - Database Koruması
 * AI asistanların tehlikeli Prisma komutlarını engeller
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Tehlikeli komutlar listesi
const DANGEROUS_COMMANDS = [
  'prisma db push --force-reset',
  'prisma db push --accept-data-loss',
  'prisma migrate reset',
  'prisma db seed --force',
  'prisma studio --reset',
  'npx prisma db push --force-reset',
  'npx prisma migrate reset',
  'prisma generate --force',
  'DROP TABLE',
  'DROP DATABASE',
  'TRUNCATE TABLE',
  'DELETE FROM users',
  'DELETE FROM passengers',
  'DELETE FROM reservations',
  'DELETE FROM flights',
]

// Korunması gereken tablolar
const PROTECTED_TABLES = [
  'users',
  'passengers', 
  'reservations',
  'flights',
  'airlines',
  'airports'
]

// Uyarı mesajları
const WARNING_MESSAGES = {
  command: '⚠️  TEHLİKELİ KOMUT TESPİT EDİLDİ!',
  data: '🚨 VERİTABANI SİLME İŞLEMİ ENGELLENDİ!',
  schema: '🔒 PRISMA SCHEMA KORUMASINDA!'
}

class PrismaGuard {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.backupPath = path.join(__dirname, '../backups/prisma-guard')
    this.ensureBackupDir()
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true })
    }
  }

  // Komut kontrolü
  checkCommand(command) {
    const lowerCommand = command.toLowerCase()
    
    // Tehlikeli komut kontrolü
    for (const dangerous of DANGEROUS_COMMANDS) {
      if (lowerCommand.includes(dangerous.toLowerCase())) {
        return {
          isDangerous: true,
          type: 'command',
          message: `${WARNING_MESSAGES.command}\nKomut: ${command}\nTehlikeli: ${dangerous}`
        }
      }
    }

    // Tablo koruma kontrolü
    for (const table of PROTECTED_TABLES) {
      if (lowerCommand.includes(`delete from ${table}`) || 
          lowerCommand.includes(`truncate ${table}`) ||
          lowerCommand.includes(`drop table ${table}`)) {
        return {
          isDangerous: true,
          type: 'data',
          message: `${WARNING_MESSAGES.data}\nTablo: ${table}\nKomut: ${command}`
        }
      }
    }

    return { isDangerous: false }
  }

  // Backup oluştur
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(this.backupPath, `backup-${timestamp}.json`)
    
    try {
      // Prisma client ile backup
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      const backup = {
        timestamp: new Date().toISOString(),
        users: await prisma.user.findMany(),
        passengers: await prisma.passenger.findMany(),
        reservations: await prisma.reservation.findMany(),
        flights: await prisma.flight.findMany(),
      }
      
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
      console.log(`✅ Backup oluşturuldu: ${backupFile}`)
      
      await prisma.$disconnect()
      return backupFile
    } catch (error) {
      console.error('❌ Backup hatası:', error)
      return null
    }
  }

  // Kullanıcı onayı iste
  async requestConfirmation(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise((resolve) => {
      console.log('\n' + '='.repeat(60))
      console.log(message)
      console.log('='.repeat(60))
      console.log('Bu işlem VERİTABANINIZI SİLEBİLİR!')
      console.log('Devam etmek için "EVET" yazın (büyük harflerle)')
      console.log('='.repeat(60))
      
      rl.question('Onayınız: ', (answer) => {
        rl.close()
        resolve(answer === 'EVET')
      })
    })
  }

  // Ana guard fonksiyonu
  async guard(command) {
    const check = this.checkCommand(command)
    
    if (!check.isDangerous) {
      return { allowed: true }
    }

    console.log('\n🚨 ' + check.message)
    
    // Production'da hiç izin verme
    if (this.isProduction) {
      console.log('❌ Production ortamında bu işlem yasaktır!')
      return { allowed: false, reason: 'production-block' }
    }

    // Backup oluştur
    console.log('💾 Backup oluşturuluyor...')
    const backupFile = await this.createBackup()
    
    if (!backupFile) {
      console.log('❌ Backup oluşturulamadı, işlem iptal edildi!')
      return { allowed: false, reason: 'backup-failed' }
    }

    // Kullanıcı onayı iste
    const confirmed = await this.requestConfirmation(check.message)
    
    if (confirmed) {
      console.log('✅ İşlem onaylandı, devam ediliyor...')
      return { allowed: true, backupFile }
    } else {
      console.log('❌ İşlem iptal edildi')
      return { allowed: false, reason: 'user-denied' }
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const guard = new PrismaGuard()
  const command = process.argv.slice(2).join(' ')
  
  if (!command) {
    console.log('Kullanım: node prisma-guard.js "prisma komutu"')
    process.exit(1)
  }

  guard.guard(command).then(result => {
    if (result.allowed) {
      console.log('✅ Komut çalıştırılabilir')
      process.exit(0)
    } else {
      console.log('❌ Komut engellendi')
      process.exit(1)
    }
  })
}

module.exports = PrismaGuard