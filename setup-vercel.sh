#!/bin/bash

echo "🚀 Vercel Environment Variables Setup Script"
echo "============================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Setting up environment variables..."

# Add DATABASE_URL
echo "🔧 Adding DATABASE_URL..."
vercel env add DATABASE_URL production

# Add JWT_SECRET
echo "🔧 Adding JWT_SECRET..."
vercel env add JWT_SECRET production

# Add NEXTAUTH_SECRET
echo "🔧 Adding NEXTAUTH_SECRET..."
vercel env add NEXTAUTH_SECRET production

# Add NEXTAUTH_URL
echo "🔧 Adding NEXTAUTH_URL..."
vercel env add NEXTAUTH_URL production

echo "✅ Environment variables setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Run: vercel env pull .env.local"
echo "2. Run: vercel --prod"
echo ""
echo "🌐 Your app will be deployed to Vercel!"
