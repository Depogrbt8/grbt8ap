#!/bin/bash

echo "🚀 GurbetBiz Admin Panel - Production Deployment"
echo "================================================"

# Environment check
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  NODE_ENV is not set to production"
    echo "📝 Please set NODE_ENV=production before running this script"
    exit 1
fi

# Check required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️  Building the application..."
npm run build

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 public/uploads

echo "✅ Deployment completed successfully!"
echo "🌐 Your admin panel is ready at: $NEXTAUTH_URL"
echo ""
echo "📋 Next steps:"
echo "1. Start the server: npm start"
echo "2. Set up reverse proxy (nginx/apache)"
echo "3. Configure SSL certificate"
echo "4. Set up monitoring and logging"




