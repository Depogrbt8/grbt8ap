#!/bin/bash

# GRBT8 Ana Site Yedekleme Script
# Bu script ana siteyi GitHub'a yedekler

echo "🚀 GRBT8 Ana Site Yedekleme Başlatılıyor..."

# GitHub bilgileri
REPO_OWNER="Depogrbt8"
REPO_NAME="anasiteotoyedek"
GITHUB_TOKEN="ghp_1234567890abcdef1234567890abcdef12345678" # Gerçek token ile değiştirin

# Ana site URL'i
MAIN_SITE_URL="https://anasite.grbt8.store"

echo "📋 Yedekleme Bilgileri:"
echo "   Repository: $REPO_OWNER/$REPO_NAME"
echo "   Ana Site: $MAIN_SITE_URL"
echo "   Tarih: $(date)"

# GitHub API ile repository durumunu kontrol et
echo "🔍 GitHub Repository durumu kontrol ediliyor..."
REPO_STATUS=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME")

if echo "$REPO_STATUS" | grep -q '"message": "Not Found"'; then
    echo "❌ Repository bulunamadı: $REPO_OWNER/$REPO_NAME"
    echo "💡 Repository oluşturulması gerekiyor"
    exit 1
else
    echo "✅ Repository mevcut"
    REPO_SIZE=$(echo "$REPO_STATUS" | grep -o '"size": [0-9]*' | grep -o '[0-9]*')
    echo "   Boyut: ${REPO_SIZE}KB"
fi

# Ana site durumunu kontrol et
echo "🌐 Ana site durumu kontrol ediliyor..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_SITE_URL")

if [ "$SITE_STATUS" = "200" ]; then
    echo "✅ Ana site erişilebilir"
else
    echo "❌ Ana site erişilemiyor (HTTP: $SITE_STATUS)"
fi

echo ""
echo "📝 Yapılması gerekenler:"
echo "1. GitHub Personal Access Token oluşturun"
echo "2. Token'ı bu script'te güncelleyin"
echo "3. Ana site kodlarını GitHub'a push edin"
echo "4. Yedekleme sistemini test edin"

echo ""
echo "🔗 Faydalı linkler:"
echo "   GitHub Token: https://github.com/settings/tokens"
echo "   Repository: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "   Ana Site: $MAIN_SITE_URL"
echo "   Vercel: https://vercel.com/grbt8/grbt8"
