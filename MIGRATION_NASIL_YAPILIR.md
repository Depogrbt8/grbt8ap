# Migration Nasıl Yapılır - Adım Adım

## 🎯 Amaç
`HotelFavorite` tablosunu veritabanında oluşturmak için migration yapılması gerekiyor.

## 📋 Adım Adım Talimatlar

### Adım 1: Terminal'i Açın
- macOS'ta: `Terminal` uygulamasını açın
- Veya VS Code'da: `Terminal` → `New Terminal` (⌘ + `)

### Adım 2: Proje Klasörüne Gidin
```bash
cd /Users/incesu/Desktop/grbt8ap
```

### Adım 3: Migration'ı Uygulayın

**Development ortamında (yerel veritabanı için):**
```bash
npx prisma migrate dev
```

**VEYA**

**Production ortamında (Vercel için):**
```bash
npx prisma migrate deploy
```

### Adım 4: Prisma Client'ı Generate Edin (otomatik olabilir)
```bash
npx prisma generate
```

## 🔍 Ne Olacak?

Migration çalıştığında:
1. ✅ `HotelFavorite` tablosu oluşturulacak
2. ✅ Index'ler eklenecek
3. ✅ Foreign key'ler eklenecek
4. ✅ Prisma Client güncellenecek

## ⚠️ Önemli Notlar

### DATABASE_URL Kontrolü
Migration yapmadan önce `.env` dosyasında `DATABASE_URL` olduğundan emin olun:
```bash
cat .env | grep DATABASE_URL
```

### Hata Alırsanız
Eğer `DATABASE_URL` hatası alırsanız:
1. `.env` dosyasını kontrol edin
2. Veritabanı bağlantısının çalıştığından emin olun

### Vercel'de Otomatik Migration
Vercel'de migration otomatik çalışacak çünkü:
- Migration dosyası commit edildi ✅
- `package.json` içinde `postinstall` script'i var ✅
- Vercel build sırasında migration çalışır ✅

## ✅ Başarı Kontrolü

Migration başarılı olduysa şu mesajı göreceksiniz:
```
✅ Migration applied successfully
```

Sonra admin panel'de kullanıcı sayfasını açın ve favori otellerin göründüğünü kontrol edin.

## 🆘 Sorun mu Var?

Eğer hata alırsanız, hata mesajını paylaşın, birlikte çözelim.

