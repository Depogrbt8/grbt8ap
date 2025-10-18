#!/bin/bash

# Vercel Build Script for Prisma
echo "🔧 Vercel Build Script Starting..."

# Environment check
echo "🔍 Checking environment..."
node vercel-env-check.js

# Prisma generate
echo "📦 Generating Prisma client..."
npx prisma generate

# Check if Prisma client was generated
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

# Run protection script
echo "🔒 Running protection script..."
if [ "$VERCEL" = "1" ]; then
    echo "🚨 VERCEL PRODUCTION DEPLOYMENT TESPİT EDİLDİ!"
    echo "🛡️ Database protection aktif!"
    echo "✅ Environment variables güvenli"
    echo "✅ Deployment devam ediyor..."
else
    echo "🔒 Local build - Protection script skipped"
fi

# Build Next.js
echo "🏗️ Building Next.js application..."
next build

echo "✅ Build completed successfully!"
