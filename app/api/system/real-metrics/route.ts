import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basit sistem metrikleri (systeminformation olmadan)
    const metrics = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpu: {
        usage: 'N/A', // systeminformation olmadan CPU kullanımı alınamaz
        cores: require('os').cpus().length
      },
      disk: {
        usage: 'N/A' // systeminformation olmadan disk kullanımı alınamaz
      },
      network: {
        status: 'active'
      }
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })

  } catch (error) {
    console.error('Real metrics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Sistem metrikleri alınamadı'
    }, { status: 500 })
  }
}