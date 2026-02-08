-- AlterTable: Add membership column to User (standart, silver, gold)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "membership" TEXT DEFAULT 'standart';
