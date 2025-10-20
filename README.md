# GurbetBiz Admin Panel

GurbetBiz seyahat platformu için admin panel yönetim sistemi.

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn
- SQLite (varsayılan)

### Kurulum
```bash
npm install
npm run dev
```

### Çalıştırma
```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build
npm start
```

## 🌐 Erişim

- **Admin Panel:** http://localhost:3004
- **Ana Site:** http://localhost:3000

## 📋 Özellikler

### ✅ Tamamlanan Özellikler
- [x] Kullanıcı Yönetimi
  - [x] Kullanıcı listesi görüntüleme
  - [x] Kullanıcı detayları düzenleme
  - [x] Kullanıcı durumu değiştirme (aktif/pasif)
  - [x] Kullanıcı silme
  - [x] Toplu işlemler (aktif/pasif yapma)
  - [x] CSV dışa aktarma
  - [x] Arama ve filtreleme
- [x] Kampanya Yönetimi (API hazır)
- [x] Dosya yükleme sistemi
- [x] Sistem logları
- [x] Production-ready yapılandırma

### 🔄 Devam Eden Özellikler
- [ ] Kampanya yönetimi UI
- [ ] Dashboard istatistikleri
- [ ] Import/Export geliştirmeleri

## 🔗 Ana Site Entegrasyonu

### Kampanya Bağlantısı
Admin panel'deki kampanya yönetimi, ana site ile REST API üzerinden bağlantı kurar.

**API Endpoint:** `http://localhost:3004/api/campaigns`

**Ana Site Entegrasyonu:**
- Ana site dosyası: `/Users/incesu/Desktop/grbt8/src/app/page.tsx`
- CampaignCard component: `/Users/incesu/Desktop/grbt8/src/components/CampaignCard.tsx`

### Entegrasyon Notları
1. **Statik Kampanyalar:** Şu anda ana site statik kampanya kartları kullanıyor
2. **API Entegrasyonu:** İleride `CampaignsSection` component'i eklenebilir
3. **Production:** Environment-based config ile sunucu URL'leri dinamik olarak ayarlanır

### Ana Site Değişiklikleri
```typescript
// CampaignCard.tsx - Statik yapı
import CampaignCard from '@/components/CampaignCard';

// page.tsx - Kampanyalar bölümü
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <CampaignCard src="/images/campaign1.jpg" alt="..." title="..." />
  // ... diğer kampanyalar
</div>
```

## 🗄️ Veritabanı

### Modeller
- User (Kullanıcılar)
- Campaign (Kampanyalar)
- SystemLog (Sistem logları)
- SystemSettings (Sistem ayarları)

### Migration
```bash
# Veritabanı oluştur
npx prisma db push

# Prisma Studio
npx prisma studio
```

## 🔧 Yapılandırma

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3004"
NEXT_PUBLIC_MAIN_SITE_URL="http://localhost:3000"

# Upload
MAX_FILE_SIZE="5242880"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
```

### GitHub Webhook (Yedek Doğrulama)
```text
Webhook URL: /api/database-backup/webhook
Event: push
Env: GITHUB_WEBHOOK_SECRET (gerekli), GITHUB_BACKUP_TOKEN (GitHub API fallback için)
Çalışma: Webhook geldiğinde imza doğrulanır ve son push bilgisi SystemLog'a yazılır (source=backup_github_webhook).
```

## 🚀 Production Deployment

### Deploy Script
```bash
# Production deployment
./deploy.sh
```

### Production Hazırlığı
- [x] Environment-based configuration
- [x] Dynamic API URLs
- [x] Cloud-ready file upload
- [x] Flexible database connection
- [x] CORS middleware
- [x] Security headers

## 📝 Notlar

### Ana Site Bağlantısı
- Ana site dosyaları: `/Users/incesu/Desktop/grbt8/`
- Admin panel dosyaları: `/Users/incesu/Desktop/ali/grbt8ap/`
- İki site arasında REST API iletişimi
- Production'da WebSocket entegrasyonu planlanıyor

### Kampanya Entegrasyonu
- Admin panel'de kampanya oluşturma/düzenleme
- Ana site'de dinamik kampanya gösterimi
- Resim yükleme ve optimizasyon
- Tıklama ve görüntüleme istatistikleri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.




# Deployment trigger Mon Oct 20 09:10:58 CEST 2025
