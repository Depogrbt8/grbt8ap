# Migration Uygulama Talimatı

## Migration Dosyası Oluşturuldu ✅

Migration dosyası oluşturuldu ve push edildi:
- `prisma/migrations/20250105000000_add_hotel_favorite/migration.sql`

## Migration'ı Uygulama

### Development Ortamında:

```bash
cd /Users/incesu/Desktop/grbt8ap
npx prisma migrate dev
```

Bu komut:
1. Migration dosyasını veritabanına uygular
2. Prisma Client'ı otomatik olarak generate eder
3. Migration geçmişini günceller

### Production Ortamında (Vercel):

Vercel'de migration otomatik olarak çalışacak çünkü:
- `package.json` içinde `postinstall` script'i var: `npx prisma generate`
- Migration dosyası commit edildi ve push edildi
- Vercel build sırasında migration çalışacak

**Manuel olarak production'da migration yapmak için:**
```bash
npx prisma migrate deploy
```

## Migration İçeriği

Migration şunları yapar:
1. `HotelFavorite` tablosunu oluşturur
2. `userId` ve `hotelId` üzerinde index'ler oluşturur
3. `userId + hotelId` üzerinde unique constraint ekler
4. `User` tablosuna foreign key ekler (CASCADE delete ile)

## Kontrol

Migration sonrası kontrol edin:

```sql
-- Tablo var mı?
SELECT * FROM "HotelFavorite" LIMIT 1;

-- Index'ler var mı?
SELECT indexname FROM pg_indexes WHERE tablename = 'HotelFavorite';
```

## Sonuç

Migration uygulandıktan sonra:
- ✅ `HotelFavorite` tablosu oluşacak
- ✅ Favori oteller görünecek
- ✅ API endpoint'leri çalışacak

