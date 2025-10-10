import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SourceStatus {
  key: string
  title: string
  subtitle: string
  active: boolean
  pulledInfo: string
}

export async function GET() {
  try {
    // Önce local sistem log'larından en güncel backup zamanını al (anlık ve güvenilir)
    const lastBackup = await getLastBackupDate()

    // Gerçek durumları kontrol et
    const statusChecks = await checkAllStatuses()

    const sources: SourceStatus[] = [
      {
        key: 'github-hourly',
        title: 'GitHub Her Saat',
        subtitle: statusChecks.githubApi ? 'Aktif' : 'Pasif',
        active: statusChecks.githubApi,
        pulledInfo: `${lastBackup.text} • ${lastBackup.origin}`,
      },
      {
        key: 'gitlab-daily',
        title: 'GitLab Günlük',
        subtitle: statusChecks.gitlabApi ? 'Aktif' : 'Pasif',
        active: statusChecks.gitlabApi,
        pulledInfo: await getLastGitLabDate(),
      },
      {
        key: 'cronbackup-repo',
        title: 'Ana Site 6 Saat',
        subtitle: statusChecks.cronbackupRepo ? 'Aktif' : 'Pasif',
        active: statusChecks.cronbackupRepo,
        pulledInfo: await getLastCronbackupDate(),
      },
      {
        key: 'cron-status',
        title: 'Vercel Cron',
        subtitle: statusChecks.vercelCron ? 'Aktif' : 'Pasif',
        active: statusChecks.vercelCron,
        pulledInfo: '0 * * * *',
      },
    ]

    return NextResponse.json({ success: true, data: sources })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Tüm durumları kontrol eden fonksiyon
async function checkAllStatuses() {
  const statusChecks = {
    githubApi: false,
    githubRepo: false,
    gitlabApi: false,
    gitlabRepo: false,
    cronbackupRepo: false,
    databaseConnection: false,
    vercelCron: false
  }

  try {
    // 1. GitHub API durumu kontrolü
    try {
      const githubToken = process.env.GITHUB_BACKUP_TOKEN
      if (githubToken) {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        statusChecks.githubApi = response.ok
      }
    } catch (error) {
      console.log('GitHub API kontrolü başarısız:', error)
    }

    // 2. GitHub Repository durumu kontrolü
    try {
      const githubToken = process.env.GITHUB_BACKUP_TOKEN
      if (githubToken) {
        const response = await fetch('https://api.github.com/repos/grbt8yedek/adminhersaat', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        statusChecks.githubRepo = response.ok
      }
    } catch (error) {
      console.log('GitHub Repository kontrolü başarısız:', error)
    }

    // 3. Database bağlantı durumu kontrolü
    try {
      await prisma.user.count()
      statusChecks.databaseConnection = true
    } catch (error) {
      console.log('Database bağlantı kontrolü başarısız:', error)
      statusChecks.databaseConnection = false
    }

    // 3. GitLab API durumu kontrolü
    try {
      const gitlabToken = process.env.GITLAB_BACKUP_TOKEN
      if (gitlabToken) {
        const response = await fetch('https://gitlab.com/api/v4/user', {
          headers: {
            'PRIVATE-TOKEN': gitlabToken,
            'Accept': 'application/json'
          }
        })
        statusChecks.gitlabApi = response.ok
      }
    } catch (error) {
      console.log('GitLab API kontrolü başarısız:', error)
    }

    // 4. GitLab Repository durumu kontrolü
    try {
      const gitlabToken = process.env.GITLAB_BACKUP_TOKEN
      if (gitlabToken) {
        const response = await fetch('https://gitlab.com/api/v4/projects/Depogrbt8%2Fgunlukyedek', {
          headers: {
            'PRIVATE-TOKEN': gitlabToken,
            'Accept': 'application/json'
          }
        })
        statusChecks.gitlabRepo = response.ok
      }
    } catch (error) {
      console.log('GitLab Repository kontrolü başarısız:', error)
    }

    // 5. Database bağlantı durumu kontrolü
    try {
      await prisma.user.count()
      statusChecks.databaseConnection = true
    } catch (error) {
      console.log('Database bağlantı kontrolü başarısız:', error)
      statusChecks.databaseConnection = false
    }

    // 5. Cronbackup Repository durumu kontrolü
    try {
      const githubToken = process.env.GITHUB_BACKUP_TOKEN
      if (githubToken) {
        const response = await fetch('https://api.github.com/repos/grbt8yedek/cronbackup', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        statusChecks.cronbackupRepo = response.ok
      }
    } catch (error) {
      console.log('Cronbackup Repository kontrolü başarısız:', error)
    }

    // 6. Database bağlantı durumu kontrolü
    try {
      await prisma.user.count()
      statusChecks.databaseConnection = true
    } catch (error) {
      console.log('Database bağlantı kontrolü başarısız:', error)
      statusChecks.databaseConnection = false
    }

    // 7. Vercel Cron durumu (her zaman aktif - Vercel'de çalışıyor)
    statusChecks.vercelCron = true

  } catch (error) {
    console.error('Durum kontrolü hatası:', error)
  }

  return statusChecks
}

// En son backup zamanını belirleyen fonksiyon: Önce GitHub, sonra SystemLog fallback
async function getLastBackupDate(): Promise<{ text: string, origin: 'GitHub' | 'Webhook' | 'Local' | 'Hata' | 'Yok' }> {
  try {
    // 1) GitHub API birincil kaynak (repo gerçekten güncellendi mi?)
    const githubToken = process.env.GITHUB_BACKUP_TOKEN
    if (!githubToken) {
      return { text: 'Token yok', origin: 'Hata' }
    }

    const cacheBuster = Date.now()
    const response = await fetch(`https://api.github.com/repos/grbt8yedek/adminhersaat/commits?t=${cacheBuster}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    })

    if (response.ok) {
      const commits = await response.json()
      if (Array.isArray(commits) && commits.length > 0) {
        const latestCommit = commits[0]
        const commitDate = new Date(latestCommit.commit.committer.date)
        if (!isNaN(commitDate.getTime())) {
          return { text: commitDate.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Paris'
          }), origin: 'GitHub' }
        }
      }
    }

    // 2) Fallback: Webhook kaydı (en doğru anlık push bilgisi)
    try {
      const lastWebhook = await prisma.systemLog.findFirst({
        where: { source: 'backup_github_webhook', level: 'info' },
        orderBy: { timestamp: 'desc' }
      })
      if (lastWebhook) {
        const ts = (() => {
          try {
            const meta = lastWebhook.metadata ? JSON.parse(lastWebhook.metadata) : null
            return meta?.commitTimestamp || lastWebhook.timestamp
          } catch {
            return lastWebhook.timestamp
          }
        })()
        return { text: new Date(ts).toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Paris'
        }), origin: 'Webhook' }
      }
    } catch (e) {
      console.log('Webhook log okunamadı:', e)
    }

    // 3) Fallback: SystemLog (uygulama içi backup tamamlama kaydı)
    try {
      const lastLog = await prisma.systemLog.findFirst({
        where: { source: 'backup_github', level: 'info' },
        orderBy: { timestamp: 'desc' }
      })

      if (lastLog) {
        return { text: new Date(lastLog.timestamp).toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Paris'
        }), origin: 'Local' }
      }
    } catch (e) {
      console.log('SystemLog okunamadı:', e)
    }

    return { text: 'Kayıt bulunamadı', origin: 'Yok' }

  } catch (error) {
    console.error('GitHub commit tarihi alınamadı:', error)
    return { text: 'Hata', origin: 'Hata' }
  }
}

// GitLab repo'dan en son commit tarihini çeken fonksiyon
async function getLastGitLabDate(): Promise<string> {
  try {
    const gitlabToken = process.env.GITLAB_BACKUP_TOKEN
    if (!gitlabToken) {
      return 'Token yok'
    }

    // GitLab API'den en son commit'i çek (cache-busting ile)
    const cacheBuster = Date.now()
    const response = await fetch(`https://gitlab.com/api/v4/projects/Depogrbt8%2Fgunlukyedek/repository/commits?per_page=1&t=${cacheBuster}`, {
      headers: {
        'PRIVATE-TOKEN': gitlabToken,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      return 'API Hatası'
    }

    const commits = await response.json()
    if (!Array.isArray(commits) || commits.length === 0) {
      return 'Commit yok'
    }

    // En son commit'i al
    const latestCommit = commits[0]

    // Commit tarihini al
    const commitDate = new Date(latestCommit.created_at)

    // Geçersiz tarih kontrolü
    if (isNaN(commitDate.getTime())) {
      return 'Tarih hatası'
    }

    // Avrupa Paris saati ile tam tarih formatı
    return commitDate.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    })

  } catch (error) {
    console.error('GitLab commit tarihi alınamadı:', error)
    return 'Hata'
  }
}

// Cronbackup repo'dan en son commit tarihini çeken fonksiyon
async function getLastCronbackupDate(): Promise<string> {
  try {
    const githubToken = process.env.GITHUB_BACKUP_TOKEN
    if (!githubToken) {
      return 'Token yok'
    }

    // GitHub API'den en son commit'i çek (cache-busting ile)
    const cacheBuster = Date.now()
    const response = await fetch(`https://api.github.com/repos/grbt8yedek/cronbackup/commits?t=${cacheBuster}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      return 'API Hatası'
    }

    const commits = await response.json()
    if (!Array.isArray(commits) || commits.length === 0) {
      return 'Commit yok'
    }

    // En son commit'i al
    const latestCommit = commits[0]

    // Commit tarihini al
    const commitDate = new Date(latestCommit.commit.committer.date)

    // Geçersiz tarih kontrolü
    if (isNaN(commitDate.getTime())) {
      return 'Tarih hatası'
    }

    // Avrupa Paris saati ile tam tarih formatı
    return commitDate.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    })

  } catch (error) {
    console.error('Cronbackup commit tarihi alınamadı:', error)
    return 'Hata'
  }
}


