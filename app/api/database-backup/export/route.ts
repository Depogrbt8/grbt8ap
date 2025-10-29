import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  // Dış sistem için ham JSON yedek üretir; hiçbir yere push etmez
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me'
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  const userAgent = request.headers.get('user-agent') || ''
  const isVercelCronUA = userAgent.toLowerCase().includes('vercel-cron')
  const isCron = (authHeader === `Bearer ${cronSecret}`) || !!vercelCronHeader || isVercelCronUA

  if (!isCron) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const timestamp = new Date().toISOString()
    const backupDate = new Date().toLocaleDateString('tr-TR')
    const backupTime = new Date().toLocaleTimeString('tr-TR')

    const { createOptimizedDatabaseBackup, monitorBackupProgress } = await import('@/lib/backupOptimizer')

    const backupResult = await monitorBackupProgress(async () => {
      return await createOptimizedDatabaseBackup()
    })

    if (!backupResult.result.success) {
      throw new Error(backupResult.result.error || 'Database backup başarısız')
    }

    const databaseData = backupResult.result.data.tables

    // Prisma schema'yı oku (varsa)
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    let schemaContent = ''
    if (fs.existsSync(schemaPath)) {
      schemaContent = fs.readFileSync(schemaPath, 'utf8')
    }

    const backupData = {
      metadata: {
        timestamp,
        date: backupDate,
        time: backupTime,
        version: '1.0',
        type: 'export_backup',
        source: 'grbt8ap_admin_panel'
      },
      database: databaseData,
      schema: {
        content: schemaContent
      },
      statistics: {
        totalUsers: databaseData.users?.length || 0,
        totalPassengers: databaseData.passengers?.length || 0,
        totalReservations: databaseData.reservations?.length || 0,
        totalPayments: databaseData.payments?.length || 0,
        optimization_stats: backupResult.result.stats,
        memory_usage: backupResult.memory
      }
    }

    return NextResponse.json({
      success: true,
      fileName: `admin_backup_${timestamp.replace(/[:.]/g, '-')}.json`,
      data: backupData
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


