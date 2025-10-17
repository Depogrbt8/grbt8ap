const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function checkPassword() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_IpbdP9an2jlm@ep-icy-mode-ag8baxgo-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    await client.connect();
    console.log('✅ Veritabanına bağlandı');

    // Admin kullanıcısını getir
    const result = await client.query('SELECT "email", "password", "role", "status" FROM "User" WHERE "email" = $1', ['admin@grbt8.store']);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin kullanıcı bulunamadı!');
      return;
    }

    const user = result.rows[0];
    console.log('👤 Kullanıcı bulundu:');
    console.log('📧 Email:', user.email);
    console.log('🔑 Rol:', user.role);
    console.log('📊 Durum:', user.status);
    console.log('🔐 Hash:', user.password.substring(0, 20) + '...');

    // Şifre kontrolü
    const testPasswords = ['admin123', 'Admin123', 'admin', 'Admin'];
    
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`🔍 Şifre "${testPassword}" test edildi: ${isValid ? '✅ DOĞRU' : '❌ YANLIŞ'}`);
    }

    // Yeni şifre oluştur
    console.log('\n🔄 Yeni şifre oluşturuluyor...');
    const newPassword = 'admin123';
    const newHash = await bcrypt.hash(newPassword, 12);
    
    await client.query('UPDATE "User" SET "password" = $1 WHERE "email" = $2', [newHash, 'admin@grbt8.store']);
    
    console.log('✅ Şifre güncellendi!');
    console.log('📧 Email: admin@grbt8.store');
    console.log('🔑 Şifre: admin123');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await client.end();
  }
}

checkPassword();
