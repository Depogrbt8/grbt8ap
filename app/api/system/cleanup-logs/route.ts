import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'

export async function POST(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  try {
    // 90 günden eski logları sil
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const deletedCount = await prisma.emailLog.deleteMany({
      where: {
        sentAt: {
          lt: ninetyDaysAgo
        }
      }
    })

    // İstatistikler
    const totalLogs = await prisma.emailLog.count()
    const oldestLog = await prisma.emailLog.findFirst({
      orderBy: { sentAt: 'asc' },
      select: { sentAt: true }
    })

    return NextResponse.json({
      success: true,
      message: `${deletedCount.count} eski log kaydı silindi`,
      data: {
        deletedCount: deletedCount.count,
        totalRemainingLogs: totalLogs,
        oldestLogDate: oldestLog?.sentAt || null,
        cleanupDate: ninetyDaysAgo
      }
    })

  } catch (error: any) {
    console.error('Log temizleme hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Log temizleme işlemi başarısız'
    }, { status: 500 })
  }
}

// Cron job için GET endpoint
export async function GET(request: NextRequest) {
  return POST(request) // Aynı işlemi yap
}
