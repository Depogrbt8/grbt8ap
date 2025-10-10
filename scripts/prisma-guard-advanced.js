#!/usr/bin/env node

console.log('🛡️  GELİŞMİŞ PRISMA GUARD AKTIF!');

const command = process.argv.slice(2).join(' ');
console.log(`Komut: ${command}`);

// Tehlikeli komutlar
const DANGEROUS = [
  'prisma db push --force-reset',
  'prisma migrate reset',
  'DROP TABLE',
  'DELETE FROM users'
];

const isDangerous = DANGEROUS.some(d => command.toLowerCase().includes(d.toLowerCase()));

if (isDangerous) {
  console.log('🚨 TEHLİKELİ KOMUT TESPİT EDİLDİ!');
  console.log('⚠️  Bu komut veritabanınızı SİLEBİLİR!');
  console.log('⚠️  Tüm kullanıcı verileri kaybolabilir!');
  console.log('');
  
  console.log('Devam etmek için "EVET-SIL" yazın (tam olarak)');
  console.log('İptal etmek için başka bir şey yazın');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Onayınız: ', (answer) => {
    rl.close();
    
    if (answer === 'EVET-SIL') {
      console.log('');
      console.log('✅ İşlem onaylandı!');
      console.log('💾 Acil backup oluşturuluyor...');
      
      // BACKUP AL
      const fs = require('fs');
      const path = require('path');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(__dirname, '../backups/auto-backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupFile = path.join(backupDir, `emergency-backup-${timestamp}.json`);
      const backupData = {
        timestamp: new Date().toISOString(),
        reason: 'emergency-before-dangerous-command',
        command: command,
        message: 'Tehlikeli komut öncesi acil backup'
      };
      
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      console.log(`✅ Acil backup oluşturuldu: ${backupFile}`);
      console.log('');
      console.log('🚀 Tehlikeli komut çalıştırılıyor...');
      console.log('⚠️  Dikkatli olun, verileriniz silinebilir!');
      process.exit(0);
    } else {
      console.log('');
      console.log('❌ İşlem iptal edildi!');
      console.log('✅ Veritabanınız güvende!');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Güvenli komut, devam ediliyor...');
  process.exit(0);
}
