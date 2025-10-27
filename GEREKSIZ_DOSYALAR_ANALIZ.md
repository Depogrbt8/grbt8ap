# 🗑️ GEREKSİZ DOSYALAR ANALİZ RAPORU

**Tarih:** 26 Aralık 2025  
**Durum:** 📋 ANALİZ - Silme izni bekliyor

---

## 🔴 SİLİNEBİLİR DOSYALAR

### 1. Broken/Bak Dosyaları (6 adet)

```
app/kullanici/page.tsx.broken
app/kullanici/page.tsx.bak
app/rezervasyonlar/page.tsx.broken
app/rezervasyonlar/page.tsx.bak
app/email/page.tsx.broken
app/email/page.tsx.bak
```

**Boyut:** ~0KB (boş veya geçici)  
**Sebep:** Eski broken dosyalar, aktif kod değil  
**Risk:** Yok, backup dosyaları

---

### 2. Backup Dosyaları (Backups klasöründe - 95MB)

#### Eski Full Backup'lar
```
backups/full-backup-2025-09-26T15-01-01-627Z/ (dizin)
backups/full-backup-2025-09-26T15-02-12-850Z.zip (37MB)
backups/full-backup-2025-10-26T09-45-27-901Z.zip (34MB)
```

**Toplam:** ~75MB  
**Sebep:** 2-3 ay öncesinden full backup'lar  
**Durum:** GitHub'da zaten yedeklenmişler  
**Risk:** Büyük boyut, gereksiz yer kaplıyor

#### Eski Database Backup
```
backups/database-backup.json (53KB)
```

**Sebep:** Eski database backup  
**Durum:** Güncel backup'lar GitHub'da  
**Risk:** Yok

---

### 3. Shared Klasörü (20KB)

```
shared/
├── backup-config.json
├── logs.json
├── payments.json
├── reservations.json
└── users.json
```

**Durum:** Projede kullanılmıyor (production'da database kullanılıyor)  
**Risk:** Yok

---

### 4. Script Dosyaları (Root'ta) - 7 dosya

```
create-admin.js
create-admin-db.js
create-admin-manual.js
create-admin-prisma.js
create-admin-table.sql
test-auth.js
check-admin.js
check-admin-password.js
check-password.js
```

**Durum:** Tek seferlik setup scriptleri, artık gereksiz  
**Risk:** Yok

---

### 5. Ekstra Setup Dosyaları

```
setup-vercel.sh
vercel-build.sh
vercel-protection.js
vercel-env-check.js
github-sync-check.sh
backup-check.sh
```

**Durum:** Bazıları kullanılıyor (package.json'da)  
**Kontrol gerekli:** package.json'da hangileri kullanılıyor?

---

## 📊 TOPLAM TASARRUF

### Boyut Analizi
- Broken files: ~0KB
- Backup files: ~75MB
- Shared folder: ~20KB
- Script files: ~10KB

**Toplam tasarruf:** ~75MB

---

## ⚠️ SİLİNMEMELİLER

### 1. Public/Uploads (16MB)
- ❌ Silme! Kullanıcı upload'ları
- Gerekli dosyalar

### 2. Lib Klasörü
- ❌ Silme! Güvenlik kütüphaneleri
- Aktif kullanılıyor

### 3. App API'leri
- ❌ Silme! Tüm API'ler aktif

---

## 🎯 ÖNERİLEN SİLME LİSTESİ

### Seviye 1: Güvenli Silinebilir (75MB)

```bash
# Broken files (6 adet)
rm app/kullanici/page.tsx.broken
rm app/kullanici/page.tsx.bak
rm app/rezervasyonlar/page.tsx.broken
rm app/rezervasyonlar/page.tsx.bak
rm app/email/page.tsx.broken
rm app/email/page.tsx.bak

# Eski backup'lar (75MB)
rm -rf backups/full-backup-2025-09-26T15-01-01-627Z/
rm backups/full-backup-2025-09-26T15-02-12-850Z.zip
rm backups/full-backup-2025-10-26T09-45-27-901Z.zip

# Eski database backup
rm backups/database-backup.json
```

**Tasarruf:** ~75MB

---

### Seviye 2: Kontrol Gerekli (20KB)

```bash
# Shared klasörü (kontrol et!)
# Eğer kullanılmıyorsa:
rm -rf shared/
```

**Not:** Önce package.json'da kullanım kontrolü yapılmalı

---

### Seviye 3: Script Dosyaları

```bash
# Setup scriptleri (artık gereksiz)
rm create-admin*.js
rm create-admin*.sql
rm check-admin*.js
rm check-password*.js
rm test-auth.js
```

**Tasarruf:** ~10KB

---

## 📋 SONUÇ

**Kesin Silinebilir:** 75MB (broken files + eski backups)  
**Kontrol Gerekli:** 30KB (shared + scripts)  
**Toplam Potansiyel:** ~75MB

**Önerilen Aksiyon:** Seviye 1 (75MB) temizlik

---

**Rapor Tarihi:** 26 Aralık 2025  
**Durum:** 📋 ANALİZ - Silme izni bekliyor

