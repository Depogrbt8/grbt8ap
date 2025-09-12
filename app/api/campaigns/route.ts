import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { createLog } from '../../lib/logger'

// CORS middleware
function corsMiddleware(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return corsMiddleware(response)
}

// GET - Kampanya listesi
export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        position: 'asc'
      }
    })

    const response = NextResponse.json({
      success: true,
      data: campaigns
    })

    return corsMiddleware(response)
  } catch (error) {
    console.error('Kampanya listesi getirme hatası:', error)
    
    await createLog({
      level: 'ERROR',
      message: 'Kampanya listesi getirilemedi',
      source: 'api',
      metadata: error instanceof Error ? error.message : 'Unknown error'
    })

    const response = NextResponse.json(
      { success: false, error: 'Kampanya listesi getirilemedi' },
      { status: 500 }
    )

    return corsMiddleware(response)
  }
}

// POST - Yeni kampanya oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const campaignData: any = {
      title: body.title,
      description: body.description || '',
      altText: body.altText || '',
      linkUrl: body.linkUrl || '',
      status: body.status || 'active',
      position: body.position || 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      clickCount: 0,
      viewCount: 0
    }

    // imageUrl sadece boş değilse ekle
    if (body.imageUrl && body.imageUrl.trim() !== '') {
      campaignData.imageUrl = body.imageUrl
    }
    
    const campaign = await prisma.campaign.create({
      data: campaignData
    })

    await createLog({
      level: 'INFO',
      message: 'Yeni kampanya oluşturuldu',
      source: 'api',
      metadata: `Kampanya: ${campaign.title}`
    })

    const response = NextResponse.json({
      success: true,
      data: campaign
    })

    return corsMiddleware(response)
  } catch (error) {
    console.error('Kampanya oluşturma hatası:', error)
    
    await createLog({
      level: 'ERROR',
      message: 'Kampanya oluşturulamadı',
      source: 'api',
      metadata: error instanceof Error ? error.message : 'Unknown error'
    })

    const response = NextResponse.json(
      { success: false, error: 'Kampanya oluşturulamadı' },
      { status: 500 }
    )

    return corsMiddleware(response)
  }
}

// PUT - Kampanya güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      const response = NextResponse.json(
        { success: false, error: 'Kampanya ID gerekli' },
        { status: 400 }
      )
      return corsMiddleware(response)
    }

    const campaignData: any = {
      title: body.title,
      description: body.description || '',
      altText: body.altText || '',
      linkUrl: body.linkUrl || '',
      status: body.status || 'active',
      position: body.position || 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null
    }

    // imageUrl sadece boş değilse ekle
    if (body.imageUrl && body.imageUrl.trim() !== '') {
      campaignData.imageUrl = body.imageUrl
    }

    const campaign = await prisma.campaign.update({
      where: { id: body.id },
      data: campaignData
    })

    await createLog({
      level: 'INFO',
      message: 'Kampanya güncellendi',
      source: 'api',
      metadata: `Kampanya: ${campaign.title}`
    })

    // Ana site'e güncelleme bildirimi gönder
    try {
      await fetch('http://localhost:3000/api/campaigns/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'campaign_updated',
          campaignId: campaign.id,
          title: campaign.title
        })
      })
    } catch (error) {
      console.error('Ana site güncelleme hatası:', error)
    }

    const response = NextResponse.json({
      success: true,
      data: campaign
    })

    return corsMiddleware(response)
  } catch (error) {
    console.error('Kampanya güncelleme hatası:', error)
    
    await createLog({
      level: 'ERROR',
      message: 'Kampanya güncellenemedi',
      source: 'api',
      metadata: error instanceof Error ? error.message : 'Unknown error'
    })

    const response = NextResponse.json(
      { success: false, error: 'Kampanya güncellenemedi' },
      { status: 500 }
    )

    return corsMiddleware(response)
  }
}
