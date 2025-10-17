const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createAdminInDatabase() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_IpbdP9an2jlm@ep-icy-mode-ag8baxgo-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    await client.connect();
    console.log('✅ Veritabanına bağlandı');

    // Admin şifresini hash'le
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('✅ Şifre hash\'lendi');

    // Admin hesabını oluştur
    const insertQuery = `
      INSERT INTO "User" (
        "id",
        "email",
        "firstName",
        "lastName",
        "password",
        "role",
        "status",
        "emailVerified",
        "canDelete",
        "createdAt",
        "updatedAt"
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        NOW(),
        NOW()
      )
      RETURNING "id", "email", "role"
    `;

    const adminId = 'admin_' + Math.random().toString(36).substr(2, 9);
    
    const result = await client.query(insertQuery, [
      adminId,
      'admin@grbt8.store',
      'Admin',
      'User',
      hashedPassword,
      'admin',
      'active',
      new Date(),
      false
    ]);

    console.log('🎉 Admin hesabı başarıyla oluşturuldu!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@grbt8.store');
    console.log('🔑 Şifre: admin123');
    console.log('🆔 ID:', result.rows[0].id);
    console.log('👤 Rol:', result.rows[0].role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Artık bu bilgilerle giriş yapabilirsin!');

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log('⚠️ Admin hesabı zaten mevcut!');
      
      // Mevcut admin hesabını kontrol et
      const checkQuery = 'SELECT "email", "firstName", "lastName", "role" FROM "User" WHERE "role" = $1';
      const checkResult = await client.query(checkQuery, ['admin']);
      
      if (checkResult.rows.length > 0) {
        const admin = checkResult.rows[0];
        console.log('Mevcut admin hesabı:');
        console.log('📧 Email:', admin.email);
        console.log('👤 Ad:', admin.firstName, admin.lastName);
        console.log('🔑 Rol:', admin.role);
        console.log('');
        console.log('✅ Bu hesap zaten mevcut, giriş yapabilirsin!');
        console.log('📧 Email: admin@grbt8.store');
        console.log('🔑 Şifre: admin123');
      }
    } else {
      console.error('❌ Hata:', error.message);
    }
  } finally {
    await client.end();
  }
}

createAdminInDatabase();
