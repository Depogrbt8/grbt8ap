#!/usr/bin/env node

/**
 * PRODUCTION GUARD - Production Ortam Koruması
 * Production'da hiçbir tehlikeli işlem yapılamaz
 */

console.log('🛡️  PRODUCTION GUARD AKTIF!');

// Environment kontrolü
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isHeroku = process.env.DYNO !== undefined;

if (isProduction || isVercel || isHeroku) {
  console.log('🚨 PRODUCTION ORTAMI TESPİT EDİLDİ!');
  console.log('❌ Production ortamında tehlikeli işlemler YASAKTIR!');
  console.log('');
  console.log('Engellenen işlemler:');
  console.log('- prisma migrate reset');
  console.log('- prisma db push --force-reset');
  console.log('- DROP TABLE komutları');
  console.log('- DELETE FROM komutları');
  console.log('- Schema değişiklikleri');
  console.log('');
  console.log('✅ Veritabanınız güvende!');
  process.exit(1);
} else {
  console.log('✅ Development ortamı - Guard devre dışı');
  process.exit(0);
}
