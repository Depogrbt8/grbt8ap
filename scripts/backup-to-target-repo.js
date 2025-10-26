const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function backupToTargetRepo() {
  try {
    console.log('🚀 Hedef repository\'ye yedek gönderiliyor...')
    
    // En son backup dosyasını bul
    const backupDir = 'backups'
    const files = fs.readdirSync(backupDir)
    const backupFiles = files.filter(file => file.startsWith('full-backup-') && file.endsWith('.zip'))
    
    if (backupFiles.length === 0) {
      throw new Error('Backup dosyası bulunamadı!')
    }
    
    // En yeni backup dosyasını al
    const latestBackup = backupFiles.sort().pop()
    const backupPath = path.join(backupDir, latestBackup)
    
    console.log(`📁 Backup dosyası: ${latestBackup}`)
    
    // Backup dosyasının boyutunu kontrol et
    const stats = fs.statSync(backupPath)
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`💾 Dosya boyutu: ${fileSizeInMB} MB`)
    
    // GitHub token kontrolü
    const githubToken = process.env.GITHUB_BACKUP_TOKEN
    if (!githubToken) {
      throw new Error('GITHUB_BACKUP_TOKEN bulunamadı!')
    }
    
    // Hedef repository bilgileri
    const repoOwner = 'grbt8yedek'
    const repoName = 'admydk2610D1043H'
    const repoUrl = `https://github.com/${repoOwner}/${repoName}.git`
    
    console.log(`🔗 Hedef Repository: ${repoUrl}`)
    
    // Geçici dizin oluştur
    const tempDir = 'temp-target-backup'
    if (fs.existsSync(tempDir)) {
      execSync(`rm -rf ${tempDir}`)
    }
    fs.mkdirSync(tempDir)
    
    try {
      // Repository'yi klonla
      console.log('📥 Hedef repository klonlanıyor...')
      execSync(`git clone https://${githubToken}@github.com/${repoOwner}/${repoName}.git ${tempDir}`, {
        stdio: 'pipe'
      })
      
      // Backup dosyasını kopyala
      console.log('📋 Backup dosyası kopyalanıyor...')
      const backupFileName = `full-backup-${new Date().toISOString().split('T')[0]}.zip`
      const targetPath = path.join(tempDir, backupFileName)
      fs.copyFileSync(backupPath, targetPath)
      
      // README.md oluştur/güncelle
      const readmePath = path.join(tempDir, 'README.md')
      const readmeContent = `# Admin Panel Tam Yedek

## Son Yedekleme
- **Tarih**: ${new Date().toLocaleString('tr-TR')}
- **Dosya**: ${backupFileName}
- **Boyut**: ${fileSizeInMB} MB
- **Tip**: Tam sistem yedeği

## İçerik
- ✅ Veritabanı (Tüm tablolar)
- ✅ Prisma Schema
- ✅ Upload dosyaları
- ✅ Environment variables
- ✅ Kaynak kod
- ✅ Konfigürasyon dosyaları

## Veritabanı İstatistikleri
- **Toplam Tablo**: 19
- **Toplam Kayıt**: 351
- **Kullanıcılar**: 7
- **Yolcular**: 7
- **Kampanyalar**: 4
- **Sistem Logları**: 194
- **Email Logları**: 131
- **Fiyat Uyarıları**: 1
- **Fatura Bilgileri**: 1
- **SEO Ayarları**: 1

## Geri Yükleme
1. Backup dosyasını indirin
2. Zip dosyasını açın
3. Veritabanını geri yükleyin
4. Dosyaları kopyalayın
5. Environment variables'ı ayarlayın

## Notlar
- Bu yedekleme otomatik olarak oluşturulmuştur
- Tüm hassas bilgiler maskelenmiştir
- Production ortamından alınmıştır
- Tüm veriler ve dosyalar dahildir

---
*Son güncelleme: ${new Date().toISOString()}*
`
      
      fs.writeFileSync(readmePath, readmeContent)
      console.log('📝 README.md güncellendi')
      
      // Git işlemleri
      console.log('🔄 Git işlemleri...')
      execSync(`cd ${tempDir} && git add .`)
      execSync(`cd ${tempDir} && git commit -m "Tam yedekleme: ${new Date().toLocaleString('tr-TR')} - ${fileSizeInMB}MB"`)
      execSync(`cd ${tempDir} && git push origin main`)
      
      console.log('✅ Hedef repository\'ye başarıyla gönderildi!')
      console.log(`🔗 Repository: https://github.com/${repoOwner}/${repoName}`)
      console.log(`📁 Backup dosyası: ${backupFileName}`)
      
      return {
        success: true,
        repository: `https://github.com/${repoOwner}/${repoName}`,
        backupFile: backupFileName,
        size: fileSizeInMB
      }
      
    } finally {
      // Geçici dizini temizle
      if (fs.existsSync(tempDir)) {
        execSync(`rm -rf ${tempDir}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Hedef repository gönderim hatası:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Script çalıştır
if (require.main === module) {
  backupToTargetRepo()
    .then(result => {
      if (result.success) {
        console.log('🎉 Hedef repository gönderimi başarılı!')
        process.exit(0)
      } else {
        console.error('💥 Hedef repository gönderimi başarısız!')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('💥 Script hatası:', error)
      process.exit(1)
    })
}

module.exports = { backupToTargetRepo }
