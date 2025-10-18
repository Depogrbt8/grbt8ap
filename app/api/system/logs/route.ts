import { NextRequest, NextResponse } from 'next/server'
import { getLogs, createLog } from '@/app/lib/logger'
import { requireAdmin } from '@/lib/authMiddleware'

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      return adminCheck
    }

    // Log isteğini kaydet
    await createLog({
      level: 'INFO',
      message: 'Sistem logları görüntülendi',
      source: 'api'
    })
    
    // Gerçek logları getir
    const logs = await getLogs(100)
    
    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        level: log.level,
        message: log.message,
        source: log.source,
        timestamp: log.timestamp.toISOString(),
        userId: log.userId,
        userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      })),
      totalLogs: logs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Log API hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Loglar alınamadı',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
