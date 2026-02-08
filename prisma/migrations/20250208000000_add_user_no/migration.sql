-- AlterTable: Add userNo column to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userNo" INTEGER;

-- Populate userNo for existing users (ordered by createdAt)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "User"
  WHERE "userNo" IS NULL
)
UPDATE "User" u
SET "userNo" = n.rn
FROM numbered n
WHERE u.id = n.id;

-- Create unique index (allows nulls, but unique for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "User_userNo_key" ON "User"("userNo");
