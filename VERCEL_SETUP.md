# 🚀 Vercel Otomatik Deploy Kurulum Rehberi

## Mevcut Durum

Projeniz zaten Vercel'e bağlı:
- **Project ID**: `prj_rXkgitirGAXCLv8WILRiPi7BetH1`
- **Project Name**: `grbt8ap`
- **GitHub Repo**: `Depogrbt8/admydk2609D1722H`
- **Region**: Frankfurt (fra1)

---

## 📋 Otomatik Deploy Aktifleştirme

### Adım 1: Vercel Dashboard'a Giriş

1. Tarayıcınızda açın: https://vercel.com/login
2. GitHub hesabınızla giriş yapın

### Adım 2: Projeyi Açın

1. Dashboard'da **grbt8ap** projesini bulun
2. Proje adına tıklayın

### Adım 3: Git Settings Kontrol

```
grbt8ap → Settings → Git
```

**Şu ayarları kontrol edin:**

#### Production Branch
```
✅ Branch Name: main
✅ Automatic deployments: ENABLED
```

Eğer "Automatic deployments" **DISABLED** ise:
- Toggle'ı **ENABLE** yapın
- Save Changes butonuna basın

#### Preview Branches (Opsiyonel)
```
✅ Deploy all branches: YES
   (veya)
✅ Deploy only specific branches: main, dev, staging
```

---

## 🔧 GitHub Webhook Kontrolü

### Adım 1: GitHub Repository Settings

1. GitHub'da reponuza gidin:
   ```
   https://github.com/Depogrbt8/admydk2609D1722H
   ```

2. **Settings** → **Webhooks**

### Adım 2: Vercel Webhook'u Kontrol Edin

Listede şöyle bir webhook olmalı:
```
Payload URL: https://api.vercel.com/v1/integrations/deploy/...
Content type: application/json
Events: Just the push event
✅ Active
```

**Eğer webhook yoksa:**
1. Vercel Dashboard → Settings → Git
2. "Disconnect" yapın
3. Tekrar "Connect Git Repository" yapın

---

## ⚡ Hızlı Test - Otomatik Deploy

Otomatik deploy'un çalışıp çalışmadığını test edin:

### Terminal'de:

```bash
cd /Users/incesu/Desktop/grbt8ap

# Küçük bir değişiklik yapın
echo "# Test" >> README.md

# Commit edin
git add README.md
git commit -m "Test: Vercel otomatik deploy"

# Push edin
git push origin main
```

### Vercel'de Kontrol:

1. Vercel Dashboard'a gidin
2. **Deployments** tab'ına bakın
3. Birkaç saniye içinde yeni bir deployment görmelisiniz:
   ```
   🔄 Building...
   ⏱️ ~2-3 dakika
   ✅ Ready
   ```

---

## 🎯 Deploy Tetikleyicileri

Vercel otomatik deploy şu durumlarda başlar:

### 1. **Git Push (Main Branch)**
```bash
git push origin main
```
→ Production deploy başlar

### 2. **Git Push (Diğer Branch'ler)**
```bash
git push origin dev
```
→ Preview deploy başlar

### 3. **Pull Request**
```
GitHub PR oluşturulduğunda
```
→ Preview deploy + yorum eklenir

### 4. **Manuel Trigger**
```
Vercel Dashboard → Deployments → Redeploy
```

---

## 🔒 Environment Variables (ÖNEMLİ!)

Otomatik deploy çalışması için environment variables gerekli!

### Vercel Dashboard'da Ekleyin:

```
Project → Settings → Environment Variables
```

**Minimum gerekli değişkenler:**

```env
DATABASE_URL = "postgresql://..." (Production)
NEXTAUTH_SECRET = "32+ karakter secret"
JWT_SECRET = "32+ karakter secret"
RESEND_API_KEY = "re_..."
GITHUB_TOKEN = "ghp_..."
NODE_ENV = "production"
```

**Her değişken için:**
- ✅ Environment: **Production**
- ✅ Environment: **Preview** (test için)
- Add butonuna basın

---

## 🐛 Sorun Giderme

### Otomatik Deploy Çalışmıyorsa:

#### 1. GitHub Webhook Kontrolü
```
GitHub Repo → Settings → Webhooks
→ Vercel webhook "Recent Deliveries" kontrol edin
→ Yeşil ✅ olmalı, kırmızı ❌ varsa "Redeliver" yapın
```

#### 2. Vercel Git Connection
```
Vercel → Settings → Git
→ "Connected Git Repository" görüyor musunuz?
→ Görmüyorsanız: Disconnect → Reconnect
```

#### 3. Build Logs Kontrol
```
Vercel → Deployments → En son deployment
→ "View Build Logs"
→ Hata varsa burada görünür
```

### Yaygın Hatalar:

#### ❌ "DATABASE_URL is not defined"
**Çözüm:** Settings → Environment Variables → DATABASE_URL ekleyin

#### ❌ "Prisma generate failed"
**Çözüm:** `vercel-protection.js` çalışıyor, environment variables kontrol edin

#### ❌ "Build exceeded maximum duration"
**Çözüm:** package.json'da gereksiz dependencies varsa kaldırın

---

## 📊 Deploy İzleme

### Vercel Dashboard
```
https://vercel.com/team_eQep1Gt7Q6PS9FWqxDjMr62u/grbt8ap
```

### GitHub Integration
- Her PR'da Vercel botu yorum yapar
- Preview URL paylaşır
- Build durumunu gösterir

### Email Notifications
```
Vercel → Settings → Notifications
→ Email bildirimlerini açın (deploy success/fail)
```

---

## 🎨 Deploy Preview (PR'lar için)

Her Pull Request için otomatik preview:

1. PR oluşturun
2. Vercel otomatik preview deploy yapar
3. PR'da yorum olarak preview URL paylaşılır
4. PR merge olunca production'a deploy olur

---

## ⚙️ Cron Jobs (Şu An Aktif)

`vercel.json` dosyanızda 2 cron job var:

```json
{
  "crons": [
    {
      "path": "/api/database-backup/github",
      "schedule": "0 * * * *"  // Her saat
    },
    {
      "path": "/api/database-backup/gitlab",
      "schedule": "0 2 * * *"  // Her gün 02:00
    }
  ]
}
```

**Bu cron'lar sadece production'da çalışır!**

---

## ✅ Kontrol Listesi

Otomatik deploy için:

- [ ] Vercel'e GitHub ile bağlandım
- [ ] Git Integration açık
- [ ] Main branch seçili
- [ ] Automatic deployments: ENABLED
- [ ] GitHub webhook aktif
- [ ] Environment variables eklendi
- [ ] Test push yaptım ve deploy çalıştı

---

## 📞 Yardım

Deploy çalışmazsa:
1. Build logs'u kontrol edin
2. Environment variables kontrol edin
3. GitHub webhook'u kontrol edin
4. Vercel status page: https://vercel-status.com

---

**Oluşturulma Tarihi:** ${new Date().toLocaleString('tr-TR')}
**Vercel Docs:** https://vercel.com/docs/deployments/overview

