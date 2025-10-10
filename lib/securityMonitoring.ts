import { NextRequest, NextResponse } from 'next/server'

interface SecurityEvent {
  id: string
  type: 'BRUTE_FORCE' | 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'PAYMENT_FRAUD'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  source: string
  ip: string
  userAgent: string
  timestamp: number
  details: any
  resolved: boolean
}

interface AlertRule {
  id: string
  name: string
  condition: (events: SecurityEvent[]) => boolean
  threshold: number
  timeWindow: number // ms
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  enabled: boolean
}

// Security events store
const securityEvents: SecurityEvent[] = []
const alertRules: AlertRule[] = []

// Alert store
const alerts: Array<{
  id: string
  ruleId: string
  severity: string
  message: string
  timestamp: number
  acknowledged: boolean
  resolved: boolean
}> = []

// Security event oluştur
export function createSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  source: string,
  ip: string,
  userAgent: string,
  details: any
): SecurityEvent {
  const event: SecurityEvent = {
    id: generateEventId(),
    type,
    severity,
    source,
    ip,
    userAgent,
    timestamp: Date.now(),
    details,
    resolved: false
  }
  
  securityEvents.push(event)
  
  // Alert kurallarını kontrol et
  checkAlertRules()
  
  return event
}

// Alert kurallarını kontrol et
function checkAlertRules(): void {
  for (const rule of alertRules) {
    if (!rule.enabled) continue
    
    const recentEvents = securityEvents.filter(
      event => event.timestamp > Date.now() - rule.timeWindow
    )
    
    if (rule.condition(recentEvents)) {
      createAlert(rule)
    }
  }
}

// Alert oluştur
function createAlert(rule: AlertRule): void {
  const alertId = generateEventId()
  const alert = {
    id: alertId,
    ruleId: rule.id,
    severity: rule.severity,
    message: `Security Alert: ${rule.name}`,
    timestamp: Date.now(),
    acknowledged: false,
    resolved: false
  }
  
  alerts.push(alert)
  
  // Kritik alert'leri logla
  if (rule.severity === 'CRITICAL') {
    console.error(`[CRITICAL ALERT] ${rule.name}:`, alert)
  }
}

// Event ID oluştur
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Brute force detection
export function detectBruteForce(ip: string, timeWindow: number = 15 * 60 * 1000): boolean {
  const recentEvents = securityEvents.filter(
    event => 
      event.ip === ip && 
      event.type === 'BRUTE_FORCE' &&
      event.timestamp > Date.now() - timeWindow
  )
  
  return recentEvents.length >= 5 // 5 başarısız deneme
}

// XSS attempt detection
export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

// SQL injection detection
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/))/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
    /(or|and)\s+\d+\s*=\s*\d+/gi,
    /(or|and)\s+['"]\s*=\s*['"]/gi
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// Suspicious activity detection
export function detectSuspiciousActivity(ip: string, userAgent: string): boolean {
  // Bot user agent'ları
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ]
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent))
  
  // Çok hızlı istekler
  const recentRequests = securityEvents.filter(
    event => 
      event.ip === ip &&
      event.timestamp > Date.now() - 60000 // Son 1 dakika
  )
  
  const isRapidFire = recentRequests.length > 100
  
  return isBot || isRapidFire
}

// Payment fraud detection
export function detectPaymentFraud(transactionData: any): boolean {
  // Çok büyük tutar
  if (transactionData.amount > 50000) {
    return true
  }
  
  // Çok hızlı ardışık ödemeler
  const recentPayments = securityEvents.filter(
    event => 
      event.type === 'PAYMENT_FRAUD' &&
      event.timestamp > Date.now() - 300000 // Son 5 dakika
  )
  
  if (recentPayments.length > 3) {
    return true
  }
  
  return false
}

// Alert kurallarını tanımla
export function initializeAlertRules(): void {
  // Brute force alert
  alertRules.push({
    id: 'brute_force_alert',
    name: 'Brute Force Attack Detected',
    condition: (events) => {
      const bruteForceEvents = events.filter(e => e.type === 'BRUTE_FORCE')
      return bruteForceEvents.length >= 5
    },
    threshold: 5,
    timeWindow: 15 * 60 * 1000, // 15 dakika
    severity: 'HIGH',
    enabled: true
  })
  
  // XSS attempt alert
  alertRules.push({
    id: 'xss_alert',
    name: 'XSS Attack Attempt',
    condition: (events) => {
      const xssEvents = events.filter(e => e.type === 'XSS_ATTEMPT')
      return xssEvents.length >= 3
    },
    threshold: 3,
    timeWindow: 10 * 60 * 1000, // 10 dakika
    severity: 'MEDIUM',
    enabled: true
  })
  
  // Rate limit alert
  alertRules.push({
    id: 'rate_limit_alert',
    name: 'Rate Limit Exceeded',
    condition: (events) => {
      const rateLimitEvents = events.filter(e => e.type === 'RATE_LIMIT')
      return rateLimitEvents.length >= 10
    },
    threshold: 10,
    timeWindow: 5 * 60 * 1000, // 5 dakika
    severity: 'MEDIUM',
    enabled: true
  })
  
  // Payment fraud alert
  alertRules.push({
    id: 'payment_fraud_alert',
    name: 'Payment Fraud Detected',
    condition: (events) => {
      const fraudEvents = events.filter(e => e.type === 'PAYMENT_FRAUD')
      return fraudEvents.length >= 1
    },
    threshold: 1,
    timeWindow: 60 * 60 * 1000, // 1 saat
    severity: 'CRITICAL',
    enabled: true
  })
}

// Security dashboard verileri
export function getSecurityDashboardData(): {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  recentAlerts: any[]
  topThreats: Array<{ ip: string; count: number }>
} {
  const now = Date.now()
  const last24Hours = now - (24 * 60 * 60 * 1000)
  
  const recentEvents = securityEvents.filter(e => e.timestamp > last24Hours)
  
  // Event'leri tipe göre grupla
  const eventsByType: Record<string, number> = {}
  recentEvents.forEach(event => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
  })
  
  // Event'leri severity'ye göre grupla
  const eventsBySeverity: Record<string, number> = {}
  recentEvents.forEach(event => {
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
  })
  
  // Son alert'ler
  const recentAlerts = alerts
    .filter(a => a.timestamp > last24Hours)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
  
  // En tehlikeli IP'ler
  const ipCounts: Record<string, number> = {}
  recentEvents.forEach(event => {
    ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
  })
  
  const topThreats = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    totalEvents: recentEvents.length,
    eventsByType,
    eventsBySeverity,
    recentAlerts,
    topThreats
  }
}

// Alert'leri al
export function getAlerts(limit: number = 50): any[] {
  return alerts
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

// Alert'i acknowledge et
export function acknowledgeAlert(alertId: string): boolean {
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledged = true
    return true
  }
  return false
}

// Alert'i resolve et
export function resolveAlert(alertId: string): boolean {
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.resolved = true
    return true
  }
  return false
}

// Eski event'leri temizle
export function cleanupOldEvents(): void {
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 gün
  const initialLength = securityEvents.length
  
  // Eski event'leri kaldır
  for (let i = securityEvents.length - 1; i >= 0; i--) {
    if (securityEvents[i].timestamp < cutoff) {
      securityEvents.splice(i, 1)
    }
  }
  
  console.log(`Cleaned up ${initialLength - securityEvents.length} old security events`)
}

// Periyodik temizlik
setInterval(cleanupOldEvents, 24 * 60 * 60 * 1000) // Her gün

// Alert kurallarını başlat
initializeAlertRules()

