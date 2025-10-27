# 🔐 VERCEL CRON SECRET KURULUM REHBERİ

**Saatlik yedekleme için güvenlik kontrolü eklendi**

---

## ⚠️ ÖNEMLİ: Environment Variable Ekle

Vercel Dashboard'dan **mutlaka** şu environment variable'ı ekleyin:

```bash
CRON_SECRET=your_random_secret_key_here_minimum_32_chars
```

### Nasıl Eklenir:

1. Vercel Dashboard'a git: https://vercel.com/grbt8/grbt8ap
2. **Project Settings** → **Environment Variables**
3. Yeni variable ekle:
   - **Name:** `CRON_SECRET`
   - **Value:** Rastgele güçlü bir şifre (en az 32 karakter)
   - **Environments:** Production, Preview, Development (hepsini seç)
4. **Save** butonuna tıkla

### Güçlü Secret Oluştur:

```bash
# Terminal'de çalıştır
openssl rand -hex 32
```

Örnek çıktı:
```
fec50d58aab489ce685954e6383aca28d68bdc67593e2360d176140f13eca4d2
```

---

## 🛡️ GÜVENLİK SİSTEMİ

### Nasıl Çalışıyor:

1. **Vercel Cron Job** her saat `/api/database-backup/github` endpoint'ini çağırır
2. Endpoint'e **Authorization header** eklenir:
   ```
   Authorization: Bearer your_cron_secret_here
   ```
3. Endpoint kontrol eder:
   - ✅ Header varsa ve doğruysa → Backup yapılır
   - ❌ Header yoksa veya yanlışsa → Admin kontrolü yapılır
   - ❌ Admin de değilse → 401 Unauthorized

### Güvenlik Katmanları:

```
┌─────────────────────────────────────┐
│ Vercel Cron (Otomatik)              │
│ Header: Bearer {CRON_SECRET}        │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Endpoint Kontrolü                   │
│ ✅ Header doğru mu?                 │
│    YES → Backup yap                 │
│    NO  → Admin kontrolü yap         │
└─────────────────────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Admin Kontrolü (Başarısız ise)     │
│ ❌ Admin değilse → 401 Error        │
└─────────────────────────────────────┘
```

---

## ✅ AVANTAJLAR

1. **Güvenli:** Endpoint'e sadece authorized erişim
2. **Esnek:** Admin'ler manuel tetikleyebilir
3. **Otomatik:** Vercel cron her saat çalışıyor
4. **Audit:** Her istekte authorization kontrolü

---

## ⚠️ ÖNEMLİ NOTLAR

1. ❌ **Mutlaka** `CRON_SECRET` environment variable'ı ekleyin
2. ✅ Secret'ı güçlü tutun (minimum 32 karakter)
3. ✅ Production, Preview, Development'te aynı secret'i kullanın
4. ❌ Secret'ı commit'lemeyin (gitignore'da zaten var)
5. ✅ Secret'ı düzenli olarak değiştirin (her 3-6 ay)

---

## 🧪 TEST

Deployment'tan sonra test edin:

```bash
# Admin olarak test (401 almamalı)
curl -H "Cookie: your-admin-session" \
  https://www.grbt8.store/api/database-backup/github

# Secret ile test (200 almalı)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://www.grbt8.store/api/database-backup/github

# Yanlış secret ile test (401 almalı)
curl -H "Authorization: Bearer wrong-secret" \
  https://www.grbt8.store/api/database-backup/github
```

---

## 📝 ENVIRONMENT VARIABLES LİSTESİ

Vercel'de şu environment variables olmalı:

```bash
✅ DATABASE_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ GITHUB_BACKUP_TOKEN
✅ GITLAB_BACKUP_TOKEN
✅ CRON_SECRET  ← YENİ EKLENMELİ!
```

---

**Rapor Tarihi:** 26 Aralık 2025  
**Durum:** 🔐 GÜVENLİK EKLENDİ  
**Aksiyon:** VERCEL'E CRON_SECRET EKLE

