/**
 * Admin Panel SEO Güvenlik Ayarları
 * Bu dosya admin panelinin arama motorlarından gizlenmesi için gerekli ayarları içerir
 */

export const adminSeoConfig = {
  // Admin paneli rotaları
  adminRoutes: [
    '/ayarlar',
    '/ayarlar/admin-yonetimi',
    '/dis-apiler',
    '/email',
    '/apiler',
    '/kampanyalar',
    '/kullanici',
    '/sistem',
    '/raporlar',
    '/istatistikler',
    '/rezervasyonlar',
    '/ucuslar',
    '/odemeler'
  ],

  // API rotaları
  apiRoutes: [
    '/api',
    '/api/external',
    '/api/email',
    '/api/admin'
  ],

  // Sistem dosyaları
  systemRoutes: [
    '/_next',
    '/static',
    '/public'
  ],

  // SEO Meta Tags
  seoMetaTags: {
    robots: 'noindex, nofollow, noarchive, nosnippet',
    googlebot: 'noindex, nofollow',
    bingbot: 'noindex, nofollow',
    yandex: 'noindex, nofollow'
  },

  // HTTP Headers
  securityHeaders: {
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

/**
 * Admin paneli rotasını kontrol eder
 */
export function isAdminRoute(pathname: string): boolean {
  return adminSeoConfig.adminRoutes.some(route => 
    pathname.startsWith(route)
  )
}

/**
 * API rotasını kontrol eder
 */
export function isApiRoute(pathname: string): boolean {
  return adminSeoConfig.apiRoutes.some(route => 
    pathname.startsWith(route)
  )
}

/**
 * Sistem rotasını kontrol eder
 */
export function isSystemRoute(pathname: string): boolean {
  return adminSeoConfig.systemRoutes.some(route => 
    pathname.startsWith(route)
  )
}

/**
 * Admin paneli için güvenli meta tags döndürür
 */
export function getAdminMetaTags() {
  return {
    robots: adminSeoConfig.seoMetaTags.robots,
    googlebot: adminSeoConfig.seoMetaTags.googlebot,
    bingbot: adminSeoConfig.seoMetaTags.bingbot,
    yandex: adminSeoConfig.seoMetaTags.yandex
  }
}

/**
 * Admin paneli için güvenli headers döndürür
 */
export function getAdminHeaders() {
  return adminSeoConfig.securityHeaders
}
