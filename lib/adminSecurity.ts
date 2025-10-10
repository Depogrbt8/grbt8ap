import { NextRequest, NextResponse } from 'next/server'
import { createRateLimit, rateLimitConfigs } from './rateLimit'
import { createCSRFProtection, generateCSRFToken, createCSRFResponse } from './csrfProtection'
import { createBruteForceProtection, resetLoginAttempts, validatePasswordStrength, hashPassword, verifyPassword, enableTwoFactor, verifyTwoFactorToken } from './authSecurity'
import { sanitizeInput, addSecurityHeaders, createXSSProtection } from './xssProtection'
import { createSecurityEvent, detectXSSAttempt, detectSQLInjection, detectSuspiciousActivity, getSecurityDashboardData, getAlerts } from './securityMonitoring'

// Admin paneli için güvenlik middleware'leri
export const adminSecurityMiddlewares = {
  // Admin için orta seviye rate limiting
  adminRateLimit: createRateLimit(rateLimitConfigs.admin),
  
  // Login sayfası için sıkı rate limiting
  loginRateLimit: createRateLimit(rateLimitConfigs.login),
  
  // CSRF koruması
  csrfProtection: createCSRFProtection(),
  
  // Brute force koruması
  bruteForceProtection: createBruteForceProtection(),
  
  // XSS koruması
  xssProtection: createXSSProtection()
}

// Admin login endpoint'i için güvenlik
export async function secureAdminLoginEndpoint(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, twoFactorCode } = body
    
    // Input sanitization
    const sanitizedEmail = sanitizeInput(email, 'email')
    const sanitizedPassword = sanitizeInput(password, 'string')
    const sanitizedTwoFactorCode = sanitizeInput(twoFactorCode, 'string')
    
    // XSS attempt detection
    if (detectXSSAttempt(email) || detectXSSAttempt(password)) {
      createSecurityEvent('XSS_ATTEMPT', 'HIGH', 'admin-login', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        email: sanitizedEmail,
        endpoint: '/api/admin/login'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // SQL injection detection
    if (detectSQLInjection(email) || detectSQLInjection(password)) {
      createSecurityEvent('SQL_INJECTION', 'CRITICAL', 'admin-login', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        email: sanitizedEmail,
        endpoint: '/api/admin/login'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // Suspicious activity detection
    if (detectSuspiciousActivity(req.ip || 'unknown', req.headers.get('user-agent') || '')) {
      createSecurityEvent('SUSPICIOUS_ACTIVITY', 'HIGH', 'admin-login', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        email: sanitizedEmail,
        endpoint: '/api/admin/login'
      })
    }
    
    // 2FA verification (eğer etkinse)
    if (twoFactorCode) {
      const isValid2FA = verifyTwoFactorToken(sanitizedEmail, sanitizedTwoFactorCode)
      if (!isValid2FA) {
        createSecurityEvent('BRUTE_FORCE', 'HIGH', 'admin-login', req.ip || 'unknown', req.headers.get('user-agent') || '', {
          email: sanitizedEmail,
          endpoint: '/api/admin/login',
          reason: 'Invalid 2FA code'
        })
        
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 400 }
        )
      }
    }
    
    // Gerçek admin login işlemi burada yapılacak
    // Şimdilik başarılı olarak işaretle
    resetLoginAttempts(req.ip || 'unknown')
    
    const response = NextResponse.json({ success: true })
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

// Admin user management endpoint'i için güvenlik
export async function secureAdminUserEndpoint(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId, userData } = body
    
    // Input sanitization
    const sanitizedAction = sanitizeInput(action, 'string')
    const sanitizedUserId = sanitizeInput(userId, 'string')
    const sanitizedUserData = sanitizeInput(userData, 'string')
    
    // XSS attempt detection
    const allInputs = [sanitizedAction, sanitizedUserId, JSON.stringify(sanitizedUserData)].join(' ')
    if (detectXSSAttempt(allInputs)) {
      createSecurityEvent('XSS_ATTEMPT', 'HIGH', 'admin-user', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        action: sanitizedAction,
        userId: sanitizedUserId,
        endpoint: '/api/admin/users'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // SQL injection detection
    if (detectSQLInjection(allInputs)) {
      createSecurityEvent('SQL_INJECTION', 'CRITICAL', 'admin-user', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        action: sanitizedAction,
        userId: sanitizedUserId,
        endpoint: '/api/admin/users'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // Gerçek user management işlemi burada yapılacak
    // Şimdilik başarılı olarak işaretle
    
    const response = NextResponse.json({ success: true })
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

// Admin system management endpoint'i için güvenlik
export async function secureAdminSystemEndpoint(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, parameters } = body
    
    // Input sanitization
    const sanitizedAction = sanitizeInput(action, 'string')
    const sanitizedParameters = sanitizeInput(parameters, 'string')
    
    // XSS attempt detection
    const allInputs = [sanitizedAction, JSON.stringify(sanitizedParameters)].join(' ')
    if (detectXSSAttempt(allInputs)) {
      createSecurityEvent('XSS_ATTEMPT', 'HIGH', 'admin-system', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        action: sanitizedAction,
        endpoint: '/api/admin/system'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // SQL injection detection
    if (detectSQLInjection(allInputs)) {
      createSecurityEvent('SQL_INJECTION', 'CRITICAL', 'admin-system', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        action: sanitizedAction,
        endpoint: '/api/admin/system'
      })
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // Gerçek system management işlemi burada yapılacak
    // Şimdilik başarılı olarak işaretle
    
    const response = NextResponse.json({ success: true })
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

// Admin 2FA setup endpoint'i
export async function setupAdmin2FA(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body
    
    const sanitizedUserId = sanitizeInput(userId, 'string')
    
    // 2FA'yı etkinleştir
    const { secret, qrCode } = enableTwoFactor(sanitizedUserId)
    
    const response = NextResponse.json({
      success: true,
      secret,
      qrCode
    })
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}

// Admin güvenlik durumu endpoint'i
export async function getAdminSecurityStatus(req: NextRequest) {
  try {
    const dashboardData = getSecurityDashboardData()
    const alerts = getAlerts(20)
    
    const response = NextResponse.json({
      success: true,
      data: {
        ...dashboardData,
        alerts
      }
    })
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get security status' },
      { status: 500 }
    )
  }
}

// Admin CSRF token endpoint'i
export async function getAdminCSRFToken(req: NextRequest) {
  const token = generateCSRFToken()
  const response = createCSRFResponse(token)
  return addSecurityHeaders(response)
}

// Admin için genel API endpoint'i güvenliği
export async function secureAdminAPIEndpoint(req: NextRequest) {
  try {
    // Request body'yi al
    const body = await req.text()
    
    if (body) {
      // XSS attempt detection
      if (detectXSSAttempt(body)) {
        createSecurityEvent('XSS_ATTEMPT', 'HIGH', 'admin-api', req.ip || 'unknown', req.headers.get('user-agent') || '', {
          endpoint: req.url,
          method: req.method
        })
        
        return NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        )
      }
      
      // SQL injection detection
      if (detectSQLInjection(body)) {
        createSecurityEvent('SQL_INJECTION', 'CRITICAL', 'admin-api', req.ip || 'unknown', req.headers.get('user-agent') || '', {
          endpoint: req.url,
          method: req.method
        })
        
        return NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        )
      }
    }
    
    // Suspicious activity detection
    if (detectSuspiciousActivity(req.ip || 'unknown', req.headers.get('user-agent') || '')) {
      createSecurityEvent('SUSPICIOUS_ACTIVITY', 'HIGH', 'admin-api', req.ip || 'unknown', req.headers.get('user-agent') || '', {
        endpoint: req.url,
        method: req.method
      })
    }
    
    const response = NextResponse.next()
    return addSecurityHeaders(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

