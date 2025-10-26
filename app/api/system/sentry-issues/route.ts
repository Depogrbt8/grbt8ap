import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      return adminCheck
    }

    // Sentry API token kontrolü
    const SENTRY_ORG = process.env.SENTRY_ORG
    const SENTRY_PROJECT = process.env.SENTRY_PROJECT
    const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN

    if (!SENTRY_ORG || !SENTRY_PROJECT || !SENTRY_AUTH_TOKEN) {
      // Sentry yapılandırılmamışsa boş dizi dön
      return NextResponse.json({
        success: true,
        issues: [],
        message: 'Sentry yapılandırılmamış'
      })
    }

    // Sentry API'den bugünkü hataları getir
    const response = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/`,
      {
        headers: {
          'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Sentry API hatası')
    }

    const sentryData = await response.json()
    
    // Bugünkü tarih
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Bugünkü hataları filtrele
    const todayIssues = sentryData
      .filter((issue: any) => {
        const lastSeen = new Date(issue.lastSeen)
        return lastSeen >= today
      })
      .slice(0, 10) // En fazla 10 tane
      .map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        level: issue.level,
        count: issue.count,
        userCount: issue.userCount,
        lastSeen: issue.lastSeen,
        severity: issue.level === 'error' || issue.level === 'fatal' ? 'error' : 'warning'
      }))

    return NextResponse.json({
      success: true,
      issues: todayIssues,
      total: todayIssues.length
    })

  } catch (error: any) {
    console.error('Sentry issues API hatası:', error)
    return NextResponse.json({
      success: false,
      issues: [],
      error: error.message
    }, { status: 500 })
  }
}

