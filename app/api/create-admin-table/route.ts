// Vercel'de Admin tablosunu oluşturmak için script
// Bu script'i Vercel Functions'da çalıştır

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Admin tablosunu oluştur
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'Admin',
        "status" TEXT NOT NULL DEFAULT 'active',
        "permissions" JSONB NOT NULL DEFAULT '{}',
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "createdBy" TEXT,
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );
    `

    // Email için unique index
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
    `

    // Diğer indexler
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Admin_status_idx" ON "Admin"("status");
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");
    `

    return res.status(200).json({ 
      success: true, 
      message: 'Admin tablosu başarıyla oluşturuldu!' 
    })

  } catch (error) {
    console.error('Admin tablosu oluşturma hatası:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Admin tablosu oluşturulamadı: ' + error.message 
    })
  } finally {
    await prisma.$disconnect()
  }
}
