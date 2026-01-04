# HotelFavorite Migration Talimatı

## Sorun
`HotelFavorite` modeli Prisma schema'da tanımlı ama migration yapılmamış. Bu yüzden veritabanında tablo yok ve favori oteller görünmüyor.

## Çözüm: Migration Yapılmalı

### Adım 1: Migration Oluştur ve Uygula

```bash
cd /Users/incesu/Desktop/grbt8ap
npx prisma migrate dev --name add_hotel_favorite
```

Bu komut:
1. `HotelFavorite` tablosunu oluşturur
2. `User` tablosuna relation ekler
3. Index'leri oluşturur

### Adım 2: Prisma Client'ı Yeniden Generate Et

```bash
npx prisma generate
```

### Adım 3: Deploy Sonrası Kontrol

Deploy sonrası Vercel log'larında şu mesajları kontrol edin:

✅ **Başarılı:**
```
[API] User ... için X favori otel bulundu
```

❌ **Hata (migration yapılmamışsa):**
```
[API] HotelFavorite tablosu henüz oluşturulmamış, migration gerekli
```

## Test

1. Migration sonrası admin panel'de bir kullanıcı sayfasını açın
2. Browser console'u açın (F12)
3. Şu log'ları kontrol edin:
   - `[API] HotelFavorite sorgusu başlatılıyor`
   - `[API] User ... için X favori otel bulundu`
   - `[Frontend] Full API Response` içinde `hotelFavorites` array'i

## Notlar

- Migration yapılmadan favori oteller görünmez
- Migration sadece bir kez yapılmalı
- Production'da `npx prisma migrate deploy` kullanılmalı

