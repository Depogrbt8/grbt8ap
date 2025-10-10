# 📧 Resend API Key Kurulum Rehberi

## 🚀 Email Sistemi Aktivasyonu

Email sisteminiz yapısal olarak hazır ancak **RESEND_API_KEY** eksik olduğu için simülasyon modunda çalışıyor.

## 📋 Adım Adım Kurulum

### 1. Resend Hesabı Oluşturma
1. [resend.com](https://resend.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Email doğrulaması yapın

### 2. API Key Alma
1. Resend dashboard'a giriş yapın
2. **API Keys** sekmesine gidin
3. **Create API Key** butonuna tıklayın
4. Key name: `grbt8ap-production`
5. **Create** butonuna tıklayın
6. API key'i kopyalayın (örnek: `re_123abc456def...`)

### 3. Vercel'e Environment Variable Ekleme

#### Yöntem 1: Vercel Dashboard
1. [vercel.com/dashboard](https://vercel.com/dashboard) açın
2. `grbt8ap` projesini seçin
3. **Settings** → **Environment Variables** gidin
4. **Add New** butonuna tıklayın
5. Şu bilgileri girin:
   ```
   Name: RESEND_API_KEY
   Value: re_your_actual_api_key_here
   Environment: Production, Preview, Development
   ```
6. **Save** butonuna tıklayın

#### Yöntem 2: Vercel CLI
```bash
# Vercel CLI ile login
vercel login

# Environment variable ekle
vercel env add RESEND_API_KEY
# Value girerken: re_your_actual_api_key_here

# Deploy et
vercel --prod
```

### 4. Domain Doğrulama (Opsiyonel)
1. Resend dashboard'da **Domains** sekmesine gidin
2. `grbt8.store` domain'ini ekleyin
3. DNS kayıtlarını ekleyin (TXT, CNAME)
4. Doğrulama bekleyin

### 5. Test Email Gönderme
```bash
# API test
curl -X POST "https://admin.grbt8.store/api/email/send" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientType": "single",
    "to": "test@example.com",
    "subject": "Test Email",
    "content": "Bu bir test emailidir."
  }'
```

## ✅ Doğrulama

### Başarılı Kurulum İşaretleri:
- ✅ Email API'si artık simülasyon modunda değil
- ✅ Gerçek email gönderimi çalışıyor
- ✅ Email logları database'e kaydediliyor
- ✅ Delivery, open, click tracking çalışıyor

### Hata Durumları:
- ❌ `RESEND_API_KEY bulunamadı` mesajı
- ❌ Simülasyon modunda çalışma
- ❌ Email gönderilememe

## 🔧 Troubleshooting

### API Key Format Hatası
```bash
# Doğru format:
re_123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890

# Yanlış format:
resend_123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890
```

### Domain Doğrulama Hatası
- DNS kayıtlarının 24-48 saat içinde aktif olması gerekebilir
- Geçici olarak `resend.dev` domain'i ile test edebilirsiniz

### Rate Limit Hatası
- Resend free plan: 100 email/gün
- Upgrade gerekebilir

## 📊 Monitoring

Email sistemini izlemek için:
- **Dashboard:** `/email` sayfası
- **Logs:** `/api/email/logs`
- **Stats:** `/api/email/stats`
- **Queue:** `/api/email/queue`

## 🎯 Sonraki Adımlar

1. ✅ RESEND_API_KEY ekle
2. ✅ Test email gönder
3. ✅ Domain doğrula (opsiyonel)
4. ✅ Monitoring kur
5. ✅ Template'leri özelleştir

---

**📞 Destek:** Herhangi bir sorun yaşarsanız sistem loglarını kontrol edin veya teknik destek alın.
