interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  category: string
  metadata?: Record<string, any>
  timestamp?: string
}

interface LogConfig {
  maxLogs: number
  logFile: string
}

class Logger {
  private config: LogConfig

  constructor() {
    this.config = {
      maxLogs: 1000,
      logFile: 'shared/logs.json'
    }
  }

  private async readLogs(): Promise<LogEntry[]> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const logPath = path.resolve(process.cwd(), this.config.logFile)
      
      try {
        const data = await fs.readFile(logPath, 'utf-8')
        return JSON.parse(data)
      } catch (error) {
        // Log dosyası yoksa boş array döndür
        return []
      }
    } catch (error) {
      console.error('Log okuma hatası:', error)
      return []
    }
  }

  private async writeLogs(logs: LogEntry[]): Promise<void> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const logPath = path.resolve(process.cwd(), this.config.logFile)
      const logDir = path.dirname(logPath)
      
      // Dizin yoksa oluştur
      await fs.mkdir(logDir, { recursive: true })
      
      // Son N log'u tut
      const recentLogs = logs.slice(-this.config.maxLogs)
      
      await fs.writeFile(logPath, JSON.stringify(recentLogs, null, 2), 'utf-8')
    } catch (error) {
      console.error('Log yazma hatası:', error)
    }
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      const timestamp = new Date().toISOString()
      const logEntry: LogEntry = {
        ...entry,
        timestamp
      }

      // Console'a da yaz
      const logMessage = `[${logEntry.level.toUpperCase()}] ${logEntry.message}`
      const metadataStr = logEntry.metadata ? JSON.stringify(logEntry.metadata) : ''
      
      switch (logEntry.level) {
        case 'error':
          console.error(logMessage, metadataStr)
          break
        case 'warn':
          console.warn(logMessage, metadataStr)
          break
        case 'debug':
          console.debug(logMessage, metadataStr)
          break
        default:
          console.log(logMessage, metadataStr)
      }

      // Dosyaya yaz
      const logs = await this.readLogs()
      logs.push(logEntry)
      await this.writeLogs(logs)

    } catch (error) {
      console.error('Logger error:', error)
    }
  }

  async info(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
    await this.log({ level: 'info', message, category, metadata })
  }

  async warn(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
    await this.log({ level: 'warn', message, category, metadata })
  }

  async error(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
    await this.log({ level: 'error', message, category, metadata })
  }

  async debug(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
    await this.log({ level: 'debug', message, category, metadata })
  }
}

// Singleton instance
const logger = new Logger()

// Export functions
export async function createLog(entry: LogEntry): Promise<void> {
  await logger.log(entry)
}

export async function logInfo(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
  await logger.info(message, category, metadata)
}

export async function logWarn(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
  await logger.warn(message, category, metadata)
}

export async function logError(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
  await logger.error(message, category, metadata)
}

export async function logDebug(message: string, category: string = 'general', metadata?: Record<string, any>): Promise<void> {
  await logger.debug(message, category, metadata)
}

export default logger
