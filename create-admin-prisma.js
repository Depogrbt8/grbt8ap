const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // Admin şifresini hash'le
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    console.log('Admin hesabı oluşturuluyor...');
    
    // Admin hesabını oluştur
    const admin = await prisma.user.create({
      data: {
        email: 'admin@grbt8.store',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: new Date(),
        canDelete: false
      }
    });
    
    console.log('✅ Admin hesabı başarıyla oluşturuldu!');
    console.log('Email:', admin.email);
    console.log('Şifre: admin123');
    console.log('Rol:', admin.role);
    console.log('ID:', admin.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Admin hesabı zaten mevcut!');
      
      // Mevcut admin hesabını kontrol et
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'admin' },
        select: { email: true, firstName: true, lastName: true, role: true }
      });
      
      if (existingAdmin) {
        console.log('Mevcut admin hesabı:');
        console.log('Email:', existingAdmin.email);
        console.log('Ad:', existingAdmin.firstName, existingAdmin.lastName);
        console.log('Rol:', existingAdmin.role);
      }
    } else {
      console.error('❌ Hata:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
