import { prisma } from './prisma'

interface LogData {
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
  message: string
  source?: string
  userId?: string
  metadata?: string | object
}

export async function createLog(logData: LogData) {
  try {
    await prisma.systemLog.create({
      data: {
        level: logData.level,
        message: logData.message,
        source: logData.source || 'system',
        userId: logData.userId,
        metadata: typeof logData.metadata === 'object' 
          ? JSON.stringify(logData.metadata) 
          : logData.metadata
      }
    })
  } catch (error) {
    console.error('Log kaydetme hatası:', error)
  }
}

export async function getLogs(limit: number = 100) {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    return logs
  } catch (error) {
    console.error('Log okuma hatası:', error)
    return []
  }
}

export async function clearOldLogs(daysToKeep: number = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const deletedCount = await prisma.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })
    
    console.log(`${deletedCount.count} eski log kaydı silindi`)
    return deletedCount.count
  } catch (error) {
    console.error('Eski log silme hatası:', error)
    return 0
  }
}
