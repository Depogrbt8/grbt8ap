# 🔍 SCRIPT DOSYALARI ANALİZİ

## ✅ KULLANILAN (TUTULMALI)

### 1. deploy.sh
- package.json'da `"deploy": "bash deploy.sh"` kullanılıyor
- ✅ TUTULMALI

### 2. vercel-build.sh
- vercel.json'da buildCommand olarak kullanılıyor
- ✅ TUTULMALI

### 3. scripts/ klasörü
- package.json'da multiple kullanımlar var
- ✅ TUTULMALI

## ❌ GEREKSIZ (SİLİNEBİLİR)

### 1. create-admin*.js (5 dosya)
- ❌ create-admin.js
- ❌ create-admin-db.js  
- ❌ create-admin-manual.js
- ❌ create-admin-prisma.js
- ❌ create-admin-table.sql

**Sebep:** Tek seferlik setup scriptleri, admin zaten oluşturulmuş

### 2. check-admin*.js (3 dosya)
- ❌ check-admin.js
- ❌ check-admin-password.js
- ❌ check-password.js

**Sebep:** Admin kontrolü API'de yapılıyor

### 3. test-auth.js
- ❌ Gereksiz test dosyası

### 4. setup-vercel.sh
- ❌ Tek seferlik setup, Vercel'de zaten çalışıyor

### 5. fix-vercel-build.sh
- ❌ Tek seferlik fix

### 6. vercel-protection.js
- ❌ Kullanılmıyor

### 7. vercel-env-check.js
- ❌ Kullanılmıyor

### 8. github-sync-check.sh
- ❌ Kullanılmıyor

### 9. backup-check.sh
- ❌ Kullanılmıyor

