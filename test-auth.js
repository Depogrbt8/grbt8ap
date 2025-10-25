const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testAuthentication() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔐 Authentication Test')
    console.log('=====================')
    
    const credentials = {
      email: 'admin@grbt8.store',
      password: 'admin123'
    }
    
    console.log(`📧 Email: ${credentials.email}`)
    console.log(`🔑 Şifre: ${credentials.password}`)
    console.log('')
    
    // 1. Admin hesabını bul
    console.log('1️⃣ Admin hesabı aranıyor...')
    let admin = await prisma.admin.findUnique({
      where: { email: credentials.email }
    })
    
    if (!admin) {
      console.log('❌ Admin hesabı bulunamadı!')
      return
    }
    
    console.log('✅ Admin hesabı bulundu!')
    console.log(`   Status: ${admin.status}`)
    console.log(`   Rol: ${admin.role}`)
    console.log('')
    
    // 2. Status kontrolü
    console.log('2️⃣ Status kontrolü...')
    if (admin.status !== 'active') {
      console.log(`❌ Admin hesabı aktif değil! Status: ${admin.status}`)
      return
    }
    
    console.log('✅ Admin hesabı aktif!')
    console.log('')
    
    // 3. Şifre kontrolü
    console.log('3️⃣ Şifre kontrolü...')
    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)
    
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış!')
      return
    }
    
    console.log('✅ Şifre doğru!')
    console.log('')
    
    // 4. Başarılı giriş
    console.log('🎉 AUTHENTICATION BAŞARILI!')
    console.log('==========================')
    console.log(`👤 Admin: ${admin.firstName} ${admin.lastName}`)
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🎭 Rol: ${admin.role}`)
    console.log(`📊 Status: ${admin.status}`)
    
    // 5. LastLoginAt güncelle
    console.log('')
    console.log('5️⃣ LastLoginAt güncelleniyor...')
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })
    console.log('✅ LastLoginAt güncellendi!')
    
  } catch (error) {
    console.error('❌ Authentication hatası:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthentication()


