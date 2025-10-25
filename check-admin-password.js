const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function checkAdminPassword() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔐 Admin Şifre Kontrolü')
    console.log('======================')
    
    // admin@grbt8.store hesabını al
    const admin = await prisma.admin.findUnique({
      where: { email: 'admin@grbt8.store' },
      select: {
        email: true,
        password: true,
        status: true,
        role: true
      }
    })
    
    if (!admin) {
      console.log('❌ admin@grbt8.store hesabı bulunamadı!')
      return
    }
    
    console.log(`📧 Email: ${admin.email}`)
    console.log(`📊 Status: ${admin.status}`)
    console.log(`🎭 Rol: ${admin.role}`)
    console.log(`🔐 Hash: ${admin.password}`)
    console.log('')
    
    // Şifre testleri
    const testPasswords = [
      'admin123',
      'admin',
      'password',
      '123456',
      'admin@grbt8.store'
    ]
    
    console.log('🔍 Şifre Testleri:')
    console.log('=================')
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, admin.password)
      console.log(`${password.padEnd(20)} -> ${isValid ? '✅ DOĞRU' : '❌ Yanlış'}`)
    }
    
    console.log('')
    console.log('🔧 Yeni şifre oluşturma testi:')
    const newPassword = 'admin123'
    const newHash = await bcrypt.hash(newPassword, 12)
    console.log(`Yeni şifre: ${newPassword}`)
    console.log(`Yeni hash: ${newHash}`)
    
    const isNewValid = await bcrypt.compare(newPassword, newHash)
    console.log(`Test: ${isNewValid ? '✅ Başarılı' : '❌ Başarısız'}`)
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPassword()
