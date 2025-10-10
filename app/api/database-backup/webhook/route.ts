import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { createRateLimit, rateLimitConfigs } from '@/lib/rateLimit'

const prisma = new PrismaClient()
const rateLimit = createRateLimit({ windowMs: 60 * 1000, maxRequests: 20 })

// GitHub Webhook: push events
export async function POST(request: NextRequest) {
  // Rate limit
  const rl = await rateLimit(request)
  if ((rl as any)?.status === 429) {
    try {
      await prisma.systemLog.create({
        data: {
          level: 'warn',
          message: 'Rate limit blocked',
          source: 'rate_limit_block',
          metadata: JSON.stringify({ path: '/api/database-backup/webhook', ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown' })
        }
      })
    } catch {}
    return rl as NextResponse
  }
  const secret = process.env.GITHUB_WEBHOOK_SECRET || ''
  const githubEvent = request.headers.get('x-github-event') || ''
  const signature = request.headers.get('x-hub-signature-256') || ''
  const githubIp = request.headers.get('x-forwarded-for') || request.ip || ''

  try {
    if (!secret) {
      return NextResponse.json({ success: false, error: 'Webhook secret missing' }, { status: 500 })
    }

    if (githubEvent !== 'push') {
      return NextResponse.json({ success: true, message: 'Ignored event' })
    }

    const rawBody = await request.text()

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret)
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex')
    const isValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature || 'sha256='))
    if (!isValid) {
      try {
        await prisma.systemLog.create({
          data: {
            level: 'warn',
            message: 'Invalid webhook signature',
            source: 'webhook_invalid_signature',
            metadata: JSON.stringify({ path: '/api/database-backup/webhook', ip: githubIp })
          }
        })
      } catch {}
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const commit = payload.head_commit
    const repository = payload.repository?.full_name
    const ref = payload.ref
    const pusher = payload.pusher?.name

    // Persist minimal info for Sources API
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'GitHub push webhook received',
        source: 'backup_github_webhook',
        metadata: JSON.stringify({
          repository,
          ref,
          pusher,
          commitId: commit?.id,
          commitTimestamp: commit?.timestamp,
          commitMessage: commit?.message,
          added: commit?.added,
          removed: commit?.removed,
          modified: commit?.modified,
          remoteIp: githubIp
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


