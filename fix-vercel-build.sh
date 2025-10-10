#!/bin/bash

echo "🔧 Vercel Build Ayarları Düzeltiliyor..."

# Vercel CLI ile ayarları düzelt
if command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI bulundu, ayarlar düzeltiliyor..."
    
    # Ignored Build Step'ı kapat (build'e izin ver)
    vercel env add VERCEL_IGNORE_BUILD_STEP --value="false" --scope=production
    
    echo "✅ Vercel ayarları güncellendi"
    echo "🧪 Test deployment başlatılıyor..."
    
    # Test deployment tetikle
    vercel --prod --force
    
else
    echo "⚠️ Vercel CLI bulunamadı"
    echo "📝 Manuel olarak düzeltmeniz gerekiyor:"
    echo ""
    echo "1. Vercel Dashboard → Settings → Git"
    echo "2. 'Ignored Build Step' bölümünde:"
    echo "   - Behavior: 'Build all commits' seçin"
    echo "   - Command: Boş bırakın"
    echo "3. Save butonuna basın"
    echo ""
    echo "Sonra test edin:"
    echo "git add . && git commit -m 'Test build' && git push origin main"
fi

echo "🎯 İşlem tamamlandı!"
