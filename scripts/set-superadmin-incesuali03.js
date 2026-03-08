/**
 * incesuali03@gmail.com kullanıcısını Super Admin olarak tanımlar (veya günceller).
 * Çalıştırma: node scripts/set-superadmin-incesuali03.js
 * .env / .env.local içinde DATABASE_URL tanımlı olmalı.
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const prisma = new PrismaClient()

const SUPERADMIN_EMAIL = 'incesuali03@gmail.com'
const DEFAULT_PASSWORD = 'Admin123!'

async function setSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12)
    const existing = await prisma.admin.findUnique({
      where: { email: SUPERADMIN_EMAIL }
    })

    if (existing) {
      await prisma.admin.update({
        where: { email: SUPERADMIN_EMAIL },
        data: {
          role: 'Super Admin',
          status: 'active',
          permissions: {
            system: true,
            admin: true,
            settings: true,
            security: true,
            users: true,
            'user-roles': true,
            flights: true,
            reservations: true,
            'email-templates': true,
            'email-settings': true,
            'api-management': true,
            'external-apis': true,
            reports: true,
            statistics: true,
            dashboard: true
          }
        }
      })
      console.log('✅ Mevcut admin Super Admin olarak güncellendi:', SUPERADMIN_EMAIL)
    } else {
      await prisma.admin.create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: SUPERADMIN_EMAIL,
          password: hashedPassword,
          role: 'Super Admin',
          status: 'active',
          permissions: {
            system: true,
            admin: true,
            settings: true,
            security: true,
            users: true,
            'user-roles': true,
            flights: true,
            reservations: true,
            'email-templates': true,
            'email-settings': true,
            'api-management': true,
            'external-apis': true,
            reports: true,
            statistics: true,
            dashboard: true
          }
        }
      })
      console.log('✅ Yeni Super Admin oluşturuldu:', SUPERADMIN_EMAIL)
      console.log('   Varsayılan şifre:', DEFAULT_PASSWORD, '(giriş sonrası değiştirin)')
    }
  } catch (error) {
    console.error('❌ Hata:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setSuperAdmin()
