export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || "file:/Users/incesu/Desktop/grbt8/prisma/dev.db"
  },

  // API URLs
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004",
    mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3000"
  },

  // Environment
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || "20971520"), // 20MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:3004/api/upload"
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret",
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3004"
  },

  // CORS
  cors: {
    allowedOrigins: process.env.NODE_ENV === "production" 
      ? ["https://gurbetbiz.com", "https://admin.gurbetbiz.com"]
      : ["http://localhost:3000", "http://localhost:3004"]
  }
}

export default config
