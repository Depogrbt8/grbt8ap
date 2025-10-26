import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authMiddleware'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  category: string
}

// Manuel API endpoint listesi
const apis: ApiEndpoint[] = [
  // Auth
  { method: 'GET', endpoint: '/api/auth/providers', category: 'Auth' },
  { method: 'GET', endpoint: '/api/auth/session', category: 'Auth' },
  { method: 'POST', endpoint: '/api/auth/signin', category: 'Auth' },
  { method: 'POST', endpoint: '/api/auth/signout', category: 'Auth' },
  { method: 'POST', endpoint: '/api/auth/send-2fa-code', category: 'Auth' },
  { method: 'POST', endpoint: '/api/auth/verify-2fa-code', category: 'Auth' },
  
  // Admin
  { method: 'GET', endpoint: '/api/admin', category: 'Admin' },
  { method: 'POST', endpoint: '/api/admin', category: 'Admin' },
  { method: 'GET', endpoint: '/api/admin/[id]', category: 'Admin' },
  { method: 'PUT', endpoint: '/api/admin/[id]', category: 'Admin' },
  { method: 'DELETE', endpoint: '/api/admin/[id]', category: 'Admin' },
  { method: 'GET', endpoint: '/api/admin/permissions', category: 'Admin' },
  
  // Users
  { method: 'GET', endpoint: '/api/users', category: 'Users' },
  { method: 'GET', endpoint: '/api/users/[id]', category: 'Users' },
  { method: 'PUT', endpoint: '/api/users/[id]', category: 'Users' },
  { method: 'GET', endpoint: '/api/users/metrics', category: 'Users' },
  { method: 'GET', endpoint: '/api/users/export', category: 'Users' },
  { method: 'POST', endpoint: '/api/users/sync', category: 'Users' },
  { method: 'POST', endpoint: '/api/users/bulk', category: 'Users' },
  
  // Reservations
  { method: 'GET', endpoint: '/api/reservations', category: 'Reservations' },
  { method: 'GET', endpoint: '/api/reservations/metrics', category: 'Reservations' },
  
  // Passengers
  { method: 'GET', endpoint: '/api/passengers', category: 'Passengers' },
  { method: 'GET', endpoint: '/api/passengers/[id]', category: 'Passengers' },
  { method: 'POST', endpoint: '/api/passengers', category: 'Passengers' },
  { method: 'PUT', endpoint: '/api/passengers/[id]', category: 'Passengers' },
  { method: 'DELETE', endpoint: '/api/passengers/[id]', category: 'Passengers' },
  
  // Email
  { method: 'GET', endpoint: '/api/email/logs', category: 'Email' },
  { method: 'GET', endpoint: '/api/email/templates', category: 'Email' },
  { method: 'POST', endpoint: '/api/email/send', category: 'Email' },
  { method: 'GET', endpoint: '/api/email/stats', category: 'Email' },
  { method: 'POST', endpoint: '/api/email/test', category: 'Email' },
  { method: 'POST', endpoint: '/api/email/trigger', category: 'Email' },
  
  // System
  { method: 'GET', endpoint: '/api/system/status', category: 'System' },
  { method: 'GET', endpoint: '/api/system/health-score', category: 'System' },
  { method: 'GET', endpoint: '/api/system/real-metrics', category: 'System' },
  { method: 'GET', endpoint: '/api/system/main-site-status', category: 'System' },
  { method: 'GET', endpoint: '/api/system/logs', category: 'System' },
  { method: 'POST', endpoint: '/api/system/clear-cache', category: 'System' },
  { method: 'POST', endpoint: '/api/system/cleanup-logs', category: 'System' },
  { method: 'GET', endpoint: '/api/system/security/status', category: 'System' },
  { method: 'GET', endpoint: '/api/system/maintenance-mode', category: 'System' },
  { method: 'POST', endpoint: '/api/system/maintenance-mode', category: 'System' },
  { method: 'POST', endpoint: '/api/system/maintenance-mode/disable', category: 'System' },
  
  // Database Backup
  { method: 'POST', endpoint: '/api/database-backup/github', category: 'Backup' },
  { method: 'POST', endpoint: '/api/database-backup/gitlab', category: 'Backup' },
  { method: 'GET', endpoint: '/api/database-backup/sources', category: 'Backup' },
  { method: 'POST', endpoint: '/api/database-backup/toggle', category: 'Backup' },
  { method: 'GET', endpoint: '/api/database-backup/status', category: 'Backup' },
  { method: 'POST', endpoint: '/api/backup/auto', category: 'Backup' },
  { method: 'POST', endpoint: '/api/restore/database', category: 'Backup' },
  
  // Survey
  { method: 'GET', endpoint: '/api/surveys/user/[userId]', category: 'Survey' },
  { method: 'POST', endpoint: '/api/surveys/user/[userId]', category: 'Survey' },
  
  // Dashboard
  { method: 'GET', endpoint: '/api/dashboard/stats', category: 'Dashboard' },
  
  // Billing
  { method: 'GET', endpoint: '/api/billing-info', category: 'Billing' },
  
  // External
  { method: 'GET', endpoint: '/api/external/list', category: 'External' },
  { method: 'POST', endpoint: '/api/external/list', category: 'External' },
  { method: 'GET', endpoint: '/api/external/proxy', category: 'External' },
  { method: 'POST', endpoint: '/api/external/proxy', category: 'External' },
  
  // Integrations
  { method: 'GET', endpoint: '/api/integrations/biletdukkani', category: 'Integration' },
  { method: 'POST', endpoint: '/api/integrations/biletdukkani', category: 'Integration' },
  
  // Flights
  { method: 'GET', endpoint: '/api/flights/metrics', category: 'Flights' },
  
  // Revenue
  { method: 'GET', endpoint: '/api/revenue/metrics', category: 'Revenue' },
  
  // Statistics
  { method: 'GET', endpoint: '/api/statistics', category: 'Statistics' },
  
  // Security
  { method: 'GET', endpoint: '/api/security/analysis', category: 'Security' },
  
  // SEO
  { method: 'GET', endpoint: '/api/seo', category: 'SEO' },
  { method: 'POST', endpoint: '/api/seo', category: 'SEO' },
  
  // Upload
  { method: 'POST', endpoint: '/api/upload', category: 'Upload' },
  
  // Email Tracking
  { method: 'GET', endpoint: '/api/email/track/open', category: 'Tracking' },
  { method: 'GET', endpoint: '/api/email/track/click', category: 'Tracking' },
  { method: 'GET', endpoint: '/api/email/track', category: 'Tracking' },
  
  // Health
  { method: 'GET', endpoint: '/api/health', category: 'Health' },
  
  // Create Admin
  { method: 'POST', endpoint: '/api/create-admin-emergency', category: 'Admin' },
  { method: 'POST', endpoint: '/api/create-first-admin', category: 'Admin' },
  { method: 'POST', endpoint: '/api/create-admin-table', category: 'Admin' },
  { method: 'GET', endpoint: '/api/check-admins', category: 'Admin' },
  { method: 'GET', endpoint: '/api/check-specific-admins', category: 'Admin' },
  
  // API Stats
  { method: 'GET', endpoint: '/api/apiler/stats', category: 'API' },
]

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
  try {
    // Endpoint'e göre sırala
    const sortedApis = apis.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'tr')
      }
      return a.endpoint.localeCompare(b.endpoint)
    })

    // Unique kategorileri al
    const categorySet = new Set(sortedApis.map(a => a.category))
    const categories = Array.from(categorySet).sort((a, b) => a.localeCompare(b, 'tr'))

    return NextResponse.json({
      success: true,
      data: {
        apis: sortedApis,
        totalApis: sortedApis.length,
        categories
      }
    })

  } catch (error) {
    console.error('API listesi alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'API listesi alınamadı',
      apis: [],
      totalApis: 0,
      categories: []
    })
  }
}
