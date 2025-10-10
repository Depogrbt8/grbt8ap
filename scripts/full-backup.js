const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function createFullBackup() {
  try {
    console.log('🚀 Tam yedekleme başlatılıyor...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = `backups/full-backup-${timestamp}`
    
    // Backup dizini oluştur
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    console.log('📊 Veritabanı verileri alınıyor...')
    
    // Tüm tabloları al
    const tables = [
      'User', 'Account', 'Session', 'VerificationToken', 'Reservation', 
      'Payment', 'Passenger', 'PriceAlert', 'SearchFavorite', 'SystemSettings',
      'Campaign', 'SurveyResponse', 'SystemLog', 'EmailTemplate', 'EmailQueue',
      'EmailLog', 'EmailSettings', 'BillingInfo', 'SeoSettings'
    ]
    
    const backupData = {}
    
    for (const table of tables) {
      try {
        console.log(`  📋 ${table} tablosu alınıyor...`)
        // Prisma model adlarını doğru şekilde kullan
        const modelName = table.charAt(0).toLowerCase() + table.slice(1)
        const data = await prisma[modelName].findMany()
        backupData[table] = data
        console.log(`  ✅ ${table}: ${data.length} kayıt`)
      } catch (error) {
        console.log(`  ❌ ${table} hatası:`, error.message)
        backupData[table] = []
      }
    }
    
    // Veritabanı yedeğini kaydet
    const dbBackupFile = path.join(backupDir, 'database-backup.json')
    fs.writeFileSync(dbBackupFile, JSON.stringify(backupData, null, 2))
    console.log(`💾 Veritabanı yedeği kaydedildi: ${dbBackupFile}`)
    
    // Prisma schema yedeği
    const schemaBackupFile = path.join(backupDir, 'schema.prisma')
    fs.copyFileSync('prisma/schema.prisma', schemaBackupFile)
    console.log(`📋 Prisma schema yedeği kaydedildi: ${schemaBackupFile}`)
    
    // Upload dosyaları yedeği
    console.log('📁 Upload dosyaları alınıyor...')
    const uploadsBackupDir = path.join(backupDir, 'uploads')
    if (fs.existsSync('public/uploads')) {
      execSync(`cp -r public/uploads ${uploadsBackupDir}`)
      console.log(`📁 Upload dosyaları yedeği kaydedildi: ${uploadsBackupDir}`)
    }
    
    // Environment variables yedeği
    console.log('🔧 Environment variables alınıyor...')
    const envBackupFile = path.join(backupDir, 'environment.json')
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? '***MASKED***' : undefined,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***MASKED***' : undefined,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '***MASKED***' : undefined,
      GITHUB_BACKUP_TOKEN: process.env.GITHUB_BACKUP_TOKEN ? '***MASKED***' : undefined,
      GITLAB_BACKUP_TOKEN: process.env.GITLAB_BACKUP_TOKEN ? '***MASKED***' : undefined,
      // Diğer environment variables
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION
    }
    fs.writeFileSync(envBackupFile, JSON.stringify(envVars, null, 2))
    console.log(`🔧 Environment variables yedeği kaydedildi: ${envBackupFile}`)
    
    // Package.json yedeği
    const packageBackupFile = path.join(backupDir, 'package.json')
    fs.copyFileSync('package.json', packageBackupFile)
    console.log(`📦 Package.json yedeği kaydedildi: ${packageBackupFile}`)
    
    // Vercel.json yedeği
    if (fs.existsSync('vercel.json')) {
      const vercelBackupFile = path.join(backupDir, 'vercel.json')
      fs.copyFileSync('vercel.json', vercelBackupFile)
      console.log(`🚀 Vercel.json yedeği kaydedildi: ${vercelBackupFile}`)
    }
    
    // Next.config.js yedeği
    if (fs.existsSync('next.config.js')) {
      const nextConfigBackupFile = path.join(backupDir, 'next.config.js')
      fs.copyFileSync('next.config.js', nextConfigBackupFile)
      console.log(`⚙️ Next.config.js yedeği kaydedildi: ${nextConfigBackupFile}`)
    }
    
    // Tailwind.config.ts yedeği
    if (fs.existsSync('tailwind.config.ts')) {
      const tailwindBackupFile = path.join(backupDir, 'tailwind.config.ts')
      fs.copyFileSync('tailwind.config.ts', tailwindBackupFile)
      console.log(`🎨 Tailwind.config.ts yedeği kaydedildi: ${tailwindBackupFile}`)
    }
    
    // TypeScript config yedeği
    if (fs.existsSync('tsconfig.json')) {
      const tsConfigBackupFile = path.join(backupDir, 'tsconfig.json')
      fs.copyFileSync('tsconfig.json', tsConfigBackupFile)
      console.log(`📝 tsconfig.json yedeği kaydedildi: ${tsConfigBackupFile}`)
    }
    
    // Kaynak kod yedeği (app dizini)
    console.log('💻 Kaynak kod alınıyor...')
    const sourceBackupDir = path.join(backupDir, 'source-code')
    if (!fs.existsSync(sourceBackupDir)) {
      fs.mkdirSync(sourceBackupDir, { recursive: true })
    }
    
    // Dizinleri tek tek kopyala
    const dirsToCopy = ['app', 'lib', 'scripts', 'shared', 'public', '.github']
    for (const dir of dirsToCopy) {
      if (fs.existsSync(dir)) {
        execSync(`cp -r ${dir} ${sourceBackupDir}/`)
        console.log(`  📁 ${dir} kopyalandı`)
      }
    }
    console.log(`💻 Kaynak kod yedeği kaydedildi: ${sourceBackupDir}`)
    
    // Backup manifest oluştur
    const manifest = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'full-backup',
      description: 'Tam sistem yedeği - Tüm veriler, dosyalar ve konfigürasyonlar',
      contents: {
        database: 'database-backup.json',
        schema: 'schema.prisma',
        uploads: 'uploads/',
        environment: 'environment.json',
        package: 'package.json',
        vercel: 'vercel.json',
        nextConfig: 'next.config.js',
        tailwindConfig: 'tailwind.config.ts',
        tsConfig: 'tsconfig.json',
        sourceCode: 'source-code/'
      },
      statistics: {
        totalTables: tables.length,
        totalRecords: Object.values(backupData).reduce((sum, records) => sum + records.length, 0),
        backupSize: getDirectorySize(backupDir)
      }
    }
    
    const manifestFile = path.join(backupDir, 'manifest.json')
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
    console.log(`📋 Backup manifest kaydedildi: ${manifestFile}`)
    
    // Backup dizinini sıkıştır
    console.log('🗜️ Backup sıkıştırılıyor...')
    const zipFile = `backups/full-backup-${timestamp}.zip`
    execSync(`cd ${backupDir} && zip -r ../../${zipFile} .`)
    console.log(`🗜️ Sıkıştırılmış backup: ${zipFile}`)
    
    // Geçici dizini sil
    execSync(`rm -rf ${backupDir}`)
    
    console.log('✅ Tam yedekleme tamamlandı!')
    console.log(`📁 Backup dosyası: ${zipFile}`)
    console.log(`📊 Toplam kayıt: ${manifest.statistics.totalRecords}`)
    console.log(`💾 Backup boyutu: ${formatBytes(manifest.statistics.backupSize)}`)
    
    return {
      success: true,
      backupFile: zipFile,
      manifest: manifest
    }
    
  } catch (error) {
    console.error('❌ Yedekleme hatası:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0
  const files = fs.readdirSync(dirPath)
  
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath)
    } else {
      totalSize += stats.size
    }
  }
  
  return totalSize
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Script çalıştır
if (require.main === module) {
  createFullBackup()
    .then(result => {
      if (result.success) {
        console.log('🎉 Yedekleme başarılı!')
        process.exit(0)
      } else {
        console.error('💥 Yedekleme başarısız!')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('💥 Script hatası:', error)
      process.exit(1)
    })
}

module.exports = { createFullBackup }
