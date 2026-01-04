# Admin Panel - Favori Oteller Entegrasyonu

## Durum Özeti

✅ **Tamamlananlar:**
- Prisma schema'ya `HotelFavorite` modeli eklendi
- `User` modeline `hotelFavorites HotelFavorite[]` relation'ı eklendi
- API endpoint'ine (`app/api/users/[id]/route.ts`) `hotelFavorites` query eklendi
- Response'a `hotelFavorites` field'ı eklendi
- Frontend'de (`app/kullanici/[id]/page.tsx`) `hotelFavorites` state eklendi ve render ediliyor

❌ **Eksik:**
- **Migration yapılmamış** - Bu yüzden veritabanında `HotelFavorite` tablosu yok ve favori oteller görünmüyor

## Prisma Schema

### HotelFavorite Modeli

```prisma
model HotelFavorite {
  id            String   @id @default(cuid())
  userId        String
  hotelId       String
  hotelName     String
  hotelLocation String?
  hotelImage    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, hotelId])
  @@index([userId])
  @@index([hotelId])
}
```

### User Model Relation

```prisma
model User {
  // ... diğer field'lar
  hotelFavorites   HotelFavorite[]
  // ... diğer relation'lar
}
```

## API Endpoint

### app/api/users/[id]/route.ts

```typescript
// hotelFavorites'i ayrı bir query ile çek
let hotelFavorites: any[] = []
try {
  const hotelFavs = await prisma.hotelFavorite.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      hotelId: true,
      hotelName: true,
      hotelLocation: true,
      hotelImage: true,
      createdAt: true
    }
  })
  hotelFavorites = hotelFavs
} catch (error: any) {
  console.error('[API] HotelFavorite çekilirken hata:', error)
  hotelFavorites = []
}

// Response'a ekle
return NextResponse.json({
  success: true,
  data: formattedUser,
  reservations: user.reservations || [],
  priceAlerts: user.priceAlerts || [],
  searchFavorites: user.searchFavorites || [],
  hotelFavorites: hotelFavorites  // ✅ Eklendi
})
```

## Frontend

### app/kullanici/[id]/page.tsx

```typescript
// State tanımı
const [hotelFavorites, setHotelFavorites] = useState<any[]>([])

// API'den çekme
const fetchUser = async () => {
  const response = await fetch(`/api/users/${params.id}`)
  const data = await response.json()
  
  if (data.success) {
    // ... diğer set'ler
    setHotelFavorites(data.hotelFavorites || [])  // ✅ Eklendi
  }
}

// Render
<div className="flex flex-wrap gap-2">
  {hotelFavorites && hotelFavorites.length > 0 ? (
    hotelFavorites.map((fav: any) => (
      <div key={fav.id} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md">
        {fav.hotelName}
        {fav.hotelLocation && <span className="text-gray-500 ml-1">({fav.hotelLocation})</span>}
      </div>
    ))
  ) : (
    <span className="text-xs text-gray-500">Kayıtlı favori otel yok</span>
  )}
</div>
```

## Migration Yapılması Gerekiyor

### Adım 1: Migration Oluştur ve Uygula

```bash
cd /Users/incesu/Desktop/grbt8ap
npx prisma migrate dev --name add_hotel_favorite
```

Bu komut:
- `HotelFavorite` tablosunu oluşturur
- `User` tablosuna foreign key ekler
- Index'leri oluşturur
- Unique constraint'leri ekler

### Adım 2: Prisma Client'ı Yeniden Generate Et

```bash
npx prisma generate
```

### Adım 3: Production'da Migration

Production'da (Vercel) migration otomatik olarak çalışmalı (`postinstall` script'inde `npx prisma generate` var). Eğer migration dosyası commit edilmişse, Vercel build sırasında migration çalışacaktır.

**Not:** Production'da migration yapmak için:
```bash
npx prisma migrate deploy
```

## Test Adımları

1. **Migration sonrası:**
   ```bash
   npx prisma migrate dev --name add_hotel_favorite
   npx prisma generate
   ```

2. **Admin panel'de test:**
   - Bir kullanıcı sayfasını açın (ör: ezel@hotmail)
   - Browser console'u açın (F12)
   - Network tab'da `/api/users/[id]` request'ini bulun
   - Response'u kontrol edin:
     ```json
     {
       "success": true,
       "data": {...},
       "hotelFavorites": [
         {
           "id": "...",
           "hotelId": "...",
           "hotelName": "...",
           "hotelLocation": "...",
           "hotelImage": "...",
           "createdAt": "..."
         }
       ]
     }
     ```

3. **Console log'larını kontrol edin:**
   - `[API] HotelFavorite sorgusu başlatılıyor - userId: ...`
   - `[API] User ... için X favori otel bulundu`
   - `[Frontend] Full API Response` içinde `hotelFavorites` array'i

## Sorun Giderme

### Favori Oteller Görünmüyor

1. **Migration yapıldı mı?**
   ```bash
   ls -la prisma/migrations/
   ```
   Migration dosyası yoksa migration yapın.

2. **Veritabanında tablo var mı?**
   ```sql
   SELECT * FROM "HotelFavorite" LIMIT 1;
   ```
   Tablo yoksa migration yapın.

3. **API log'larını kontrol edin:**
   - Vercel log'larında `[API] HotelFavorite çekilirken hata` mesajı var mı?
   - Hata varsa, migration yapılmamış olabilir.

4. **Browser console'u kontrol edin:**
   - `[Frontend] Full API Response` içinde `hotelFavorites` field'ı var mı?
   - Array boş mu yoksa undefined mı?

## Sonuç

Tüm kod değişiklikleri tamamlandı. **Sadece migration yapılması gerekiyor.** Migration yapıldıktan sonra favori oteller görünecektir.

