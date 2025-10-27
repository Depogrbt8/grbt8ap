# 📦 YEDEKLEME REPOSİTORY BİLGİLERİ

**Kontrol Tarihi:** 26 Aralık 2025

---

## 🤖 SAATLİK YEDEKLEME (Her Saatte Bir)

**Repository:** `grbt8yedek/adminhersaat`  
**Endpoint:** `/api/database-backup/github`  
**Schedule:** `0 * * * *` (Her saat başı)  
**Durum:** ✅ AKTIF

### Repository Link:
```
https://github.com/grbt8yedek/adminhersaat
```

### Yedeklenen Veriler:
- ✅ Database (tüm tablolar)
- ✅ Prisma Schema
- ✅ Kayıt istatistikleri
- ✅ Memory kullanım bilgisi

### Yedekleme Formatı:
- **Klasör:** `backups/`
- **Dosya:** `admin_backup_YYYY-MM-DDTHH-MM-SS.json`
- **Boyut:** Genellikle birkaç KB (sıkıştırılmamış, JSON format)

---

## 📅 GÜNLÜK YEDEKLEME (Gece 02:00)

**Repository:** `grbt8yedek/apauto`  
**Endpoint:** `/api/database-backup/gitlab`  
**Schedule:** `0 2 * * *` (Gece 02:00)  
**Durum:** ✅ AKTIF

### Repository Link:
```
https://github.com/grbt8yedek/apauto
```

### Not:
Bu endpoint `/api/database-backup/gitlab` olarak adlandırılmış olsa da **GitHub** repository'ye yedek alıyor.

---

## ❌ 6 SAATLİK YEDEKLEME (ÇALIŞMIYOR!)

**Endpoint:** `/api/backup/auto`  
**Repository:** `grbt8yedek/apauto`  
**Schedule:** TANIMSIZ (vercel.json'da yok)

### Repository Link:
```
https://github.com/grbt8yedek/apauto
```

**Durum:** ⚠️ ENDPOINT HAZIR AMA TETİKLENMİYOR

---

## 📊 ÖZET

| Yedekleme Tipi | Repository | Zamanlama | Durum |
|----------------|-----------|-----------|-------|
| Saatlik | `grbt8yedek/adminhersaat` | Her saat başı | ✅ Çalışıyor |
| Günlük | `grbt8yedek/apauto` | Gece 02:00 | ✅ Çalışıyor |
| 6 Saatlik | `grbt8yedek/apauto` | - | ❌ Tanımlı değil |

---

## 🔍 REPOSITORY YAPISI

### Saatlik Yedekleme (`adminhersaat`)
```
backups/
  └── admin_backup_2025-12-26T14-30-00.json
  └── admin_backup_2025-12-26T15-30-00.json
  └── admin_backup_2025-12-26T16-30-00.json
  └── ...
```

### Günlük/6 Saatlik Yedekleme (`apauto`)
```
database/
  └── db_backup_2025-12-26T02-00-00.json.gz
uploads/
  └── upload_backup_2025-12-26T02-00-00.json.gz
vercel/
  └── vercel_backup_2025-12-26T02-00-00.json
reports/
  └── backup_report_2025-12-26T02-00-00.json
README.md
```

---

## 🔐 TOKEN BİLGİLERİ

**Environment Variable:** `GITHUB_BACKUP_TOKEN`  
**Durum:** ✅ Ayarlandı (kod içinde kullanılıyor)  
**Kontrol:** Vercel Environment Variables'dan kontrol edilmeli

---

## 📈 İSTATİSTİKLER

### Saatlik Yedekleme:
- **Günlük:** 24 backup
- **Haftalık:** 168 backup
- **Aylık:** ~720 backup
- **Repository Size:** ~10-50 MB (tahmin)

### Günlük Yedekleme:
- **Aylık:** ~30 backup
- **Repository Size:** ~50-200 MB (tahmin)

---

## ⚠️ NOTLAR

1. **Saatlik yedekleme** sürekli aktif, her saat başı çalışıyor
2. **Günlük yedekleme** gece 02:00'de çalışıyor
3. **6 saatlik yedekleme** şu an için tanımlı değil
4. Her iki yedekleme de **GitHub** repository'ye gönderiliyor
5. Yedekler **GZIP sıkıştırılmış** formatta (6 saatlik için)
6. Eski yedekler **7 gün** sonra otomatik siliniyor

---

**Rapor Tarihi:** 26 Aralık 2025  
**Durum:** ✅ SAATLİK YEDEKLEME AKTİF - GITHUB'A GÖNDERİYOR

