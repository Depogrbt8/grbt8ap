const bcrypt = require('bcryptjs');

async function createAdminCredentials() {
  try {
    // Admin şifresini hash'le
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    console.log('🔐 Admin Giriş Bilgileri:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@grbt8.store');
    console.log('🔑 Şifre: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔧 Veritabanında Admin Hesabı Oluşturmak İçin:');
    console.log('');
    console.log('1. Vercel Dashboard\'a git: https://vercel.com/dashboard');
    console.log('2. Projeni seç: grbt8ap');
    console.log('3. Storage > Postgres > Query Editor');
    console.log('4. Aşağıdaki SQL komutunu çalıştır:');
    console.log('');
    console.log('INSERT INTO "User" (');
    console.log('  "id",');
    console.log('  "email",');
    console.log('  "firstName",');
    console.log('  "lastName",');
    console.log('  "password",');
    console.log('  "role",');
    console.log('  "status",');
    console.log('  "emailVerified",');
    console.log('  "canDelete",');
    console.log('  "createdAt",');
    console.log('  "updatedAt"');
    console.log(') VALUES (');
    console.log('  \'admin_' + Math.random().toString(36).substr(2, 9) + '\',');
    console.log('  \'admin@grbt8.store\',');
    console.log('  \'Admin\',');
    console.log('  \'User\',');
    console.log('  \'' + hashedPassword + '\',');
    console.log('  \'admin\',');
    console.log('  \'active\',');
    console.log('  NOW(),');
    console.log('  false,');
    console.log('  NOW(),');
    console.log('  NOW()');
    console.log(');');
    console.log('');
    console.log('✅ Bu komutu çalıştırdıktan sonra admin hesabıyla giriş yapabilirsin!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

createAdminCredentials();
