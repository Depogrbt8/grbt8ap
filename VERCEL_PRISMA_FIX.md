# Vercel Prisma Build Fix

Bu dosya Vercel'de Prisma client build hatasını çözmek için oluşturulmuştur.

## Sorun
Vercel'de deploy ederken şu hata alınıyordu:
```
Module not found: Can't resolve './.prisma/client'
```

## Çözüm
Aşağıdaki değişiklikler yapıldı:

### 1. vercel.json Güncellemeleri
- `installCommand`: `npm install && npx prisma generate --force`
- `buildCommand`: `bash vercel-build.sh`

### 2. package.json Güncellemeleri
- `postinstall` script eklendi: `npx prisma generate --force`
- `build` script güncellendi: `npx prisma generate --force && node vercel-protection.js && next build`
- `engines` eklendi: `"node": ">=18.0.0"`

### 3. Yeni Dosyalar
- `vercel-build.sh`: Özel build script
- `vercel-env-check.js`: Environment kontrol script'i
- `.vercelignore`: Vercel ignore dosyası

## Nasıl Çalışır
1. Vercel install sırasında Prisma client generate edilir
2. Build sırasında özel script çalışır
3. Environment kontrol edilir
4. Prisma client tekrar generate edilir (force ile)
5. Next.js build edilir

## Test
Deploy işlemi şimdi başarılı olmalı. Eğer hala sorun varsa:
1. Vercel dashboard'da environment variables'ları kontrol edin
2. DATABASE_URL'in doğru set edildiğinden emin olun
3. Vercel'de Node.js version'ının 18+ olduğunu kontrol edin
