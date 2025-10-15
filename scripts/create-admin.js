const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = 'admin@grbt8.store';
  const adminPassword = 'Admin123!'; // Güçlü şifre

  try {
    // Admin kullanıcının zaten var olup olmadığını kontrol et
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Admin kullanıcı zaten mevcut:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Ad: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Status: ${existingAdmin.status}`);
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Admin kullanıcı oluştur
    const newAdmin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('🎉 Yeni admin kullanıcı başarıyla oluşturuldu!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`🔑 Şifre: ${adminPassword}`);
    console.log(`👤 Ad: ${newAdmin.firstName} ${newAdmin.lastName}`);
    console.log(`🛡️  Role: ${newAdmin.role}`);
    console.log(`✅ Status: ${newAdmin.status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Bu bilgileri güvenli bir yerde saklayın!');
  } catch (error) {
    console.error('❌ Admin kullanıcı oluşturulurken hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

