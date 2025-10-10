/**
 * VERCEL DEPLOYMENT PROTECTION
 * Vercel deployment'da database koruması
 */

// Vercel environment kontrolü
if (process.env.VERCEL === '1') {
  console.log('🚨 VERCEL PRODUCTION DEPLOYMENT TESPİT EDİLDİ!');
  console.log('🛡️  Database protection aktif!');
  
  // Tehlikeli environment variable'ları kontrol et
  const dangerousVars = [
    'DATABASE_RESET',
    'PRISMA_RESET',
    'FORCE_RESET'
  ];
  
  dangerousVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`❌ Tehlikeli environment variable tespit edildi: ${varName}`);
      console.log('❌ Deployment iptal edildi!');
      process.exit(1);
    }
  });
  
  console.log('✅ Environment variables güvenli');
  console.log('✅ Deployment devam ediyor...');
}

// Production environment kontrolü
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 Production environment - Database protection aktif');
  
  // Prisma client'ı production-safe modda başlat
  if (typeof require !== 'undefined') {
    const originalConsole = console.log;
    console.log = (...args) => {
      if (args[0] && args[0].includes('reset')) {
        console.error('❌ Production\'da reset komutları yasak!');
        process.exit(1);
      }
      originalConsole.apply(console, args);
    };
  }
}

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: process.env.VERCEL === '1',
  protectionActive: true
};
