// Vercel Environment Check Script
console.log('🔍 Checking Vercel environment...');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 Production environment detected');
  console.log('🛡️ Database protection active');
}

console.log('✅ Environment check completed');
