import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createLog } from '../../../lib/logger'

// DELETE - Kampanya sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Kampanyayı bul
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Kampanya bulunamadı' },
        { status: 404 }
      )
    }

    // Kampanyayı sil
    await prisma.campaign.delete({
      where: { id }
    })

    await createLog({
      level: 'INFO',
      message: 'Kampanya silindi',
      details: `Kampanya: ${campaign.title}`
    })

    return NextResponse.json({
      success: true,
      message: 'Kampanya başarıyla silindi'
    })
  } catch (error) {
    console.error('Kampanya silme hatası:', error)
    
    await createLog({
      level: 'error',
      message: 'Kampanya silinemedi',
      details: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { success: false, error: 'Kampanya silinemedi' },
      { status: 500 }
    )
  }
}




