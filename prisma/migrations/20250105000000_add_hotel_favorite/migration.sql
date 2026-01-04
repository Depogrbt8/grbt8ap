-- CreateTable
CREATE TABLE "HotelFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelLocation" TEXT,
    "hotelImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HotelFavorite_userId_idx" ON "HotelFavorite"("userId");

-- CreateIndex
CREATE INDEX "HotelFavorite_hotelId_idx" ON "HotelFavorite"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelFavorite_userId_hotelId_key" ON "HotelFavorite"("userId", "hotelId");

-- AddForeignKey
ALTER TABLE "HotelFavorite" ADD CONSTRAINT "HotelFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

