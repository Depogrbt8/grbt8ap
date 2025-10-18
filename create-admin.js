const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Admin şifresini hash'le
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    console.log('Admin hesabı oluşturuluyor...');
    console.log('Email: admin@grbt8.store');
    console.log('Şifre: admin123');
    console.log('Hash:', hashedPassword);
    
    // SQL insert komutu
    const sql = `
INSERT INTO User (
  id,
  email,
  firstName,
  lastName,
  password,
  role,
  status,
  emailVerified,
  createdAt,
  updatedAt
) VALUES (
  'admin_' || substr(hex(randomblob(16)), 1, 24),
  'admin@grbt8.store',
  'Admin',
  'User',
  '${hashedPassword}',
  'admin',
  'active',
  1,
  datetime('now'),
  datetime('now')
);
`;

    console.log('\nSQL Komutu:');
    console.log(sql);
    
    console.log('\nBu SQL komutunu veritabanında çalıştırın!');
    
  } catch (error) {
    console.error('Hata:', error);
  }
}

createAdmin();
