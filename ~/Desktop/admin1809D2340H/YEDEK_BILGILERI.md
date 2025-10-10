# Admin Panel Tam Yedek - admin1809D2340H
**Yedek Tarihi:** 18 Eylül 2025 - 23:40
**Proje:** Grbt8 Admin Panel

## 📁 Yedek İçeriği

### 1. Kaynak Kodlar
- **Dosya:** `admin_panel_source.tar.gz`
- **İçerik:** Tüm kaynak kodlar (node_modules, .git, .next hariç)
- **Boyut:** Sıkıştırılmış kaynak kodları

### 2. Veritabanı
- **Dosya:** `database_backup.db`
- **İçerik:** SQLite veritabanı (tüm veriler dahil)
- **Tip:** SQLite database file

### 3. Upload Dosyaları
- **Klasör:** `uploads_backup/`
- **İçerik:** Tüm yüklenmiş dosyalar (resimler, dökümanlar)

### 4. Environment Ayarları
- **Dosya:** `env_backup.txt`
- **İçerik:** Environment variables (DATABASE_URL, API keys, vb.)
- **⚠️ GÜVENLİK:** Bu dosyayı güvenli tutun!

### 5. Shared Data
- **Klasör:** `shared_data/`
- **İçerik:** Paylaşılan veri dosyaları (logs, payments, reservations, vb.)

### 6. Prisma Şeması
- **Dosya:** `current_schema.prisma`
- **İçerik:** Mevcut veritabanı şeması

## 🔧 Geri Yükleme Talimatları

### 1. Kaynak Kodları Geri Yükle
```bash
cd /path/to/restore
tar -xzf admin_panel_source.tar.gz
```

### 2. Node Modules Yükle
```bash
npm install
```

### 3. Environment Dosyasını Ayarla
```bash
cp env_backup.txt .env
```

### 4. Veritabanını Geri Yükle
```bash
cp database_backup.db prisma/prisma/dev.db
```

### 5. Upload Dosyalarını Geri Yükle
```bash
cp -r uploads_backup/* public/uploads/
```

### 6. Shared Data'yı Geri Yükle
```bash
cp -r shared_data/* shared/
```

### 7. Prisma Generate
```bash
npx prisma generate
```

### 8. Uygulamayı Başlat
```bash
npm run dev
```

## 📊 Proje Detayları

### Teknolojiler
- **Framework:** Next.js 14
- **Database:** SQLite (Production: Neon PostgreSQL)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Önemli Özellikler
- Kullanıcı yönetimi
- Rezervasyon sistemi
- Kampanya yönetimi
- Email sistemi
- Fatura adresi yönetimi
- Upload sistemi
- Analytics ve raporlama

### Vercel Deployment
- **URL:** https://www.grbt8.store/
- **Proje:** grbt8ap
- **Team:** grbt8

### Database Connection
- **Production:** Neon PostgreSQL
- **Local:** SQLite (yedeklendi)

## 🔐 Güvenlik Notları
- Environment dosyası hassas bilgiler içerir
- Database backup'ı gerçek kullanıcı verilerini içerir
- Bu yedeği güvenli bir yerde saklayın
- Gerekirse şifreleyerek saklayın

## 📞 Destek
Bu yedek, tam çalışan bir admin panel kopyasıdır.
Geri yükleme sırasında sorun yaşarsanız, yukarıdaki adımları takip edin.
