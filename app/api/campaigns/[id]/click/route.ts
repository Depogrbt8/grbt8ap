import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// CORS middleware
function corsMiddleware(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4000')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return corsMiddleware(response)
}

// POST - Kampanya tıklama sayacını artır
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Kampanyayı bul ve tıklama sayısını artır
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    })

    const response = NextResponse.json({
      success: true,
      data: { clickCount: campaign.clickCount }
    })

    return corsMiddleware(response)
  } catch (error) {
    console.error('Tıklama sayacı güncelleme hatası:', error)
    
    const response = NextResponse.json(
      { success: false, error: 'Tıklama sayacı güncellenemedi' },
      { status: 500 }
    )

    return corsMiddleware(response)
  }
}