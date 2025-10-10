# 🔐 GitHub Personal Access Token Oluşturma Rehberi

## GRBT8 Ana Site Yedekleme Sistemi İçin

### 📋 Gereksinimler
- GitHub hesabı (Depogrbt8)
- Repository erişim izni
- Admin paneli yedekleme sistemi

### 🚀 Adım Adım Token Oluşturma

#### 1. GitHub'a Giriş Yapın
- https://github.com adresine gidin
- Depogrbt8 hesabıyla giriş yapın

#### 2. Settings'e Gidin
- Sağ üst köşedeki profil fotoğrafına tıklayın
- "Settings" seçeneğini seçin

#### 3. Developer Settings'e Gidin
- Sol menüden "Developer settings" seçin
- "Personal access tokens" altında "Tokens (classic)" seçin

#### 4. Yeni Token Oluşturun
- "Generate new token" butonuna tıklayın
- "Generate new token (classic)" seçin

#### 5. Token Ayarlarını Yapın
```
Note: GRBT8 Ana Site Backup Token
Expiration: 90 days (veya daha uzun)
Scopes:
  ✅ repo (Full control of private repositories)
    ✅ repo:status
    ✅ repo_deployment
    ✅ public_repo
    ✅ repo:invite
    ✅ security_events
```

#### 6. Token'ı Kopyalayın
- Token oluşturulduktan sonra kopyalayın
- **ÖNEMLİ**: Token'ı güvenli bir yerde saklayın, tekrar gösterilmeyecek!

### 🔧 Token'ı Sisteme Entegre Etme

#### 1. Environment Variable Olarak Ayarlayın
```bash
# .env.local dosyasına ekleyin
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2. Admin Panel Yedekleme Sisteminde Güncelleyin
```typescript
// app/api/system/backup/route.ts dosyasında
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

#### 3. Backup Script'lerinde Güncelleyin
```bash
# github-sync-check.sh dosyasında
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 🧪 Token'ı Test Etme

#### 1. API Test
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.github.com/repos/Depogrbt8/anasiteotoyedek"
```

#### 2. Admin Panel Test
- Admin panel > Sistem > Ana Site GitLab'a Yedekle
- Yedekleme işlemini başlatın
- Console loglarını kontrol edin

### 🔒 Güvenlik Önerileri

1. **Token'ı Paylaşmayın**: Token'ı kimseyle paylaşmayın
2. **Süreli Token**: Token'a son kullanma tarihi belirleyin
3. **Minimum İzin**: Sadece gerekli izinleri verin
4. **Düzenli Yenileme**: Token'ı düzenli olarak yenileyin
5. **Environment Variable**: Token'ı kodda hardcode etmeyin

### 🚨 Sorun Giderme

#### Token Çalışmıyor
- Token'ın doğru kopyalandığından emin olun
- Token'ın süresinin dolmadığını kontrol edin
- Repository izinlerini kontrol edin

#### API Rate Limit
- GitHub API rate limit: 5000 istek/saat
- Gerekirse token'ı yenileyin

#### Repository Erişim Sorunu
- Repository'nin private/public olduğunu kontrol edin
- Token'ın repository erişim izni olduğunu kontrol edin

### 📞 Destek

Sorun yaşarsanız:
1. GitHub API dokümantasyonunu kontrol edin
2. Admin panel loglarını inceleyin
3. Token ayarlarını yeniden kontrol edin

### 🔗 Faydalı Linkler

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GRBT8 Admin Panel](https://www.grbt8.store/sistem)
- [Ana Site Repository](https://github.com/Depogrbt8/anasiteotoyedek)
