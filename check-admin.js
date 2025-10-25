const { PrismaClient } = require('@prisma/client')

async function checkAdmin() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Database bağlantısı kontrol ediliyor...')
    
    // Admin tablosundaki tüm adminleri kontrol et
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })
    
    console.log('\n📊 Admin Hesap Durumu:')
    console.log('========================')
    
    if (admins.length === 0) {
      console.log('❌ Database\'de hiç admin hesabı bulunamadı!')
      console.log('🔧 Çözüm: Admin hesabı oluşturmanız gerekiyor')
    } else {
      console.log(`✅ Toplam ${admins.length} admin hesabı bulundu:`)
      console.log('')
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin Hesabı:`)
        console.log(`   📧 Email: ${admin.email}`)
        console.log(`   👤 Ad: ${admin.firstName} ${admin.lastName}`)
        console.log(`   🎭 Rol: ${admin.role}`)
        console.log(`   📊 Status: ${admin.status}`)
        console.log(`   📅 Oluşturulma: ${admin.createdAt}`)
        console.log(`   🔐 Son Giriş: ${admin.lastLoginAt || 'Hiç giriş yapmamış'}`)
        console.log('')
      })
    }
    
    // Özel olarak admin@grbt8.store'u kontrol et
    const adminUser = await prisma.admin.findUnique({
      where: { email: 'admin@grbt8.store' }
    })
    
    console.log('🎯 admin@grbt8.store Kontrolü:')
    console.log('=============================')
    
    if (adminUser) {
      console.log('✅ admin@grbt8.store hesabı bulundu!')
      console.log(`   Status: ${adminUser.status}`)
      console.log(`   Rol: ${adminUser.role}`)
      
      if (adminUser.status !== 'active') {
        console.log('⚠️  UYARI: Admin hesabı aktif değil!')
        console.log('🔧 Çözüm: Status\'u active yapın')
      }
    } else {
      console.log('❌ admin@grbt8.store hesabı bulunamadı!')
      console.log('🔧 Çözüm: Admin hesabı oluşturun')
    }
    
  } catch (error) {
    console.error('❌ Database hatası:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()


