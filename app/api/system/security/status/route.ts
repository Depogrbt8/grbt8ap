import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    // 1. Rate limit blokları (son 24 saat)
    const rateLimitBlocks = await prisma.systemLog.count({
      where: {
        source: 'rate_limit_block',
        level: 'warn',
        timestamp: { gte: last24h }
      }
    })

    // 2. Webhook hataları (son 24 saat)
    const webhookErrors = await prisma.systemLog.count({
      where: {
        source: 'webhook_invalid_signature',
        level: 'warn',
        timestamp: { gte: last24h }
      }
    })

    // 3. Son backup durumu
    const lastBackup = await prisma.systemLog.findFirst({
      where: {
        OR: [
          { source: 'backup_github' },
          { source: 'backup_github_webhook' }
        ],
        level: 'info'
      },
      orderBy: { timestamp: 'desc' }
    })

    // 4. Toplam sistem logları (son 24 saat)
    const totalLogs = await prisma.systemLog.count({
      where: {
        timestamp: { gte: last24h }
      }
    })

    // 5. Hata logları (son 24 saat)
    const errorLogs = await prisma.systemLog.count({
      where: {
        level: 'ERROR',
        timestamp: { gte: last24h }
      }
    })

    // 6. Son tehdit zamanı
    const lastThreat = await prisma.systemLog.findFirst({
      where: {
        OR: [
          { source: 'rate_limit_block' },
          { source: 'webhook_invalid_signature' }
        ],
        level: 'warn'
      },
      orderBy: { timestamp: 'desc' }
    })

    // 7. Aktif saldırı tahmini (son 1 saat içindeki bloklar)
    const recentBlocks = await prisma.systemLog.count({
      where: {
        source: 'rate_limit_block',
        level: 'warn',
        timestamp: { gte: lastHour }
      }
    })

    // Güvenlik skoru hesapla (100 üzerinden)
    let overallScore = 100
    if (rateLimitBlocks > 50) overallScore -= 10
    if (webhookErrors > 5) overallScore -= 15
    if (errorLogs > 10) overallScore -= 10
    if (!lastBackup) overallScore -= 20
    if (recentBlocks > 10) overallScore -= 15

    // Son tehdit zamanı formatla
    const lastThreatTime = lastThreat ? 
      formatTimeAgo(lastThreat.timestamp) : 'Yok'

    const securityData = {
      overallScore: Math.max(overallScore, 0),
      message: overallScore >= 90 ? 'Güvenlik durumu iyi' :
               overallScore >= 70 ? 'Güvenlik durumu orta' :
               'Güvenlik durumu risk altında',
      
      realTimeThreats: {
        activeAttacks: recentBlocks,
        blockedRequests: rateLimitBlocks + webhookErrors,
        lastThreat: lastThreatTime
      },
      
      rateLimitingStatus: {
        active: true,
        blockedRequests: rateLimitBlocks
      },

      // İstatistikler
      stats: {
        totalLogs,
        errorLogs,
        webhookErrors,
        lastBackup: lastBackup ? formatTimeAgo(lastBackup.timestamp) : 'Yok'
      }
    }

    return NextResponse.json({
      success: true,
      data: securityData
    })
  } catch (error: any) {
    console.error('Güvenlik durumu alınamadı:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  return `${diffDays} gün önce`
}
