import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const recentLogs = await prisma.systemLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        level: true,
        message: true,
        source: true,
        timestamp: true,
        metadata: true
      }
    })

    return NextResponse.json({
      success: true,
      data: recentLogs
    })
  } catch (error: any) {
    console.error('Recent logs error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
