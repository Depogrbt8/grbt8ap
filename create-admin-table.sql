-- Admin tablosunu oluşturmak için SQL
-- Bu SQL'i Vercel database'de çalıştır

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

-- Email için unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- Diğer indexler
CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Admin_status_idx" ON "Admin"("status");
CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");

-- Foreign key constraint (eğer gerekirse)
-- ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
