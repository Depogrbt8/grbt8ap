#!/bin/bash

# GRBT8 Ana Site GitHub Sync Script
# Bu script ana siteyi GitHub repository'sine senkronize eder

echo "🔄 GRBT8 Ana Site GitHub Senkronizasyonu"

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub bilgileri
REPO_OWNER="Depogrbt8"
REPO_NAME="anasiteotoyedek"
# Token dosyaya yazılmaz; env'den okunur
GITHUB_TOKEN="${GITHUB_TOKEN}"

echo -e "${BLUE}📋 Senkronizasyon Bilgileri:${NC}"
echo "   Repository: $REPO_OWNER/$REPO_NAME"
echo "   Ana Site: https://anasite.grbt8.store"
echo "   Vercel: https://vercel.com/grbt8/grbt8"
echo "   Tarih: $(date)"
echo ""

# 1. GitHub repository durumunu kontrol et
echo -e "${YELLOW}🔍 GitHub Repository durumu kontrol ediliyor...${NC}"
REPO_INFO=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME")

if echo "$REPO_INFO" | grep -q '"message": "Not Found"'; then
    echo -e "${RED}❌ Repository bulunamadı: $REPO_OWNER/$REPO_NAME${NC}"
    echo -e "${YELLOW}💡 Repository oluşturulması gerekiyor${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Repository mevcut${NC}"
    REPO_SIZE=$(echo "$REPO_INFO" | grep -o '"size": [0-9]*' | grep -o '[0-9]*')
    REPO_UPDATED=$(echo "$REPO_INFO" | grep -o '"updated_at": "[^"]*"' | cut -d'"' -f4)
    echo "   Boyut: ${REPO_SIZE}KB"
    echo "   Son güncelleme: $REPO_UPDATED"
fi

# 2. Ana site durumunu kontrol et
echo -e "${YELLOW}🌐 Ana site durumu kontrol ediliyor...${NC}"
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://anasite.grbt8.store")

if [ "$SITE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Ana site erişilebilir${NC}"
else
    echo -e "${RED}❌ Ana site erişilemiyor (HTTP: $SITE_STATUS)${NC}"
fi

# 3. Vercel deployment durumunu kontrol et
echo -e "${YELLOW}🚀 Vercel deployment durumu kontrol ediliyor...${NC}"
VERCEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://vercel.com/grbt8/grbt8")

if [ "$VERCEL_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Vercel projesi erişilebilir${NC}"
else
    echo -e "${RED}❌ Vercel projesi erişilemiyor (HTTP: $VERCEL_STATUS)${NC}"
fi

# 4. GitHub repository içeriğini analiz et
echo -e "${YELLOW}📊 Repository içeriği analiz ediliyor...${NC}"
CONTENTS=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/contents")

FILE_COUNT=$(echo "$CONTENTS" | jq '.[] | select(.type == "file") | .name' | wc -l)
DIR_COUNT=$(echo "$CONTENTS" | jq '.[] | select(.type == "dir") | .name' | wc -l)

echo "   Dosya sayısı: $FILE_COUNT"
echo "   Klasör sayısı: $DIR_COUNT"

# 5. Eksik dosyaları tespit et
echo -e "${YELLOW}🔍 Eksik dosyalar tespit ediliyor...${NC}"
MISSING_FILES=()

# Ana site için gerekli dosyalar
REQUIRED_FILES=("package.json" "next.config.js" "tailwind.config.ts" "tsconfig.json" "README.md")

for file in "${REQUIRED_FILES[@]}"; do
    if ! echo "$CONTENTS" | jq -r '.[] | select(.type == "file") | .name' | grep -q "^$file$"; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Tüm gerekli dosyalar mevcut${NC}"
else
    echo -e "${RED}❌ Eksik dosyalar:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
fi

echo ""
echo -e "${BLUE}📝 Yapılması gerekenler:${NC}"
echo "1. GitHub Personal Access Token oluşturun:"
echo "   https://github.com/settings/tokens"
echo "   Gerekli izinler: repo (Full control of private repositories)"
echo ""
echo "2. Token'ı bu script'te güncelleyin:"
echo "   GITHUB_TOKEN=\"gerçek_token_buraya\""
echo ""
echo "3. Ana site kodlarını GitHub'a push edin:"
echo "   git clone https://github.com/$REPO_OWNER/$REPO_NAME.git"
echo "   # Ana site kodlarını kopyala"
echo "   git add ."
echo "   git commit -m \"Ana site yedekleme\""
echo "   git push origin main"
echo ""
echo "4. Yedekleme sistemini test edin:"
echo "   Admin panel > Sistem > Ana Site GitLab'a Yedekle"

echo ""
echo -e "${BLUE}🔗 Faydalı linkler:${NC}"
echo "   GitHub Token: https://github.com/settings/tokens"
echo "   Repository: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "   Ana Site: https://anasite.grbt8.store"
echo "   Vercel: https://vercel.com/grbt8/grbt8"
echo "   Admin Panel: https://www.grbt8.store/sistem"
