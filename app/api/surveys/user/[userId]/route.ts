import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Neon PostgreSQL'den kullanıcının anket cevaplarını getir
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Neon PostgreSQL'den kullanıcının anket cevaplarını getir
    const surveyResponses = await prisma.surveyResponse.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 1 // En son anket cevabını al
    })

    if (!surveyResponses || surveyResponses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Anket cevabı bulunamadı'
      }, { status: 404 })
    }

    const surveyResponse = surveyResponses[0]

    // JSON string'i parse et ve düzenli format'a çevir
    let formattedAnswers: Array<{question: string, answer: string}> = []
    try {
      const parsedAnswers = JSON.parse(surveyResponse.answers)
      
      // Eğer array ise, her birini işle
      if (Array.isArray(parsedAnswers)) {
        parsedAnswers.forEach((item: any, index: number) => {
          if (typeof item === 'string') {
            // Basit string cevaplar
            formattedAnswers.push({
              question: `Soru ${index + 1}`,
              answer: item
            })
          } else if (typeof item === 'object' && item.answer) {
            // Object formatındaki cevaplar
            formattedAnswers.push({
              question: item.question || `Soru ${index + 1}`,
              answer: item.answer
            })
          } else if (typeof item === 'object') {
            // JSON object'leri kontrol et - havalimanı bilgileri için
            let processedAnswer = item
            
            // Havalimanı bilgileri için özel işlem
            if (item.departure && item.return) {
              const departureName = item.departure.name || item.departure.city
              const returnName = item.return.name || item.return.city
              processedAnswer = `${departureName}, ${returnName}`
            } else if (item.gender && item.ageRange) {
              // Demografik bilgiler için
              processedAnswer = `${item.gender}, ${item.ageRange} yaş`
            } else if (item.emailPermission !== undefined && item.phonePermission !== undefined) {
              // İzin bilgileri için
              const permissions = []
              if (item.emailPermission) permissions.push('E-posta')
              if (item.phonePermission) permissions.push('Telefon')
              processedAnswer = permissions.length > 0 ? permissions.join(', ') : 'İzin yok'
            } else {
              // Diğer JSON'lar için string'e çevir
              processedAnswer = JSON.stringify(item)
            }
            
            formattedAnswers.push({
              question: `Soru ${index + 1}`,
              answer: processedAnswer
            })
          }
        })
      } else if (typeof parsedAnswers === 'object') {
        // Object formatındaki cevaplar
        Object.entries(parsedAnswers).forEach(([key, value]) => {
          formattedAnswers.push({
            question: key,
            answer: String(value)
          })
        })
      }
    } catch (error) {
      console.error('Anket cevapları parse edilemedi:', error)
      // Parse edilemezse raw data'yı göster
      formattedAnswers = [{
        question: 'Ham Veri',
        answer: surveyResponse.answers
      }]
    }

    return NextResponse.json({
      success: true,
      data: formattedAnswers
    })

  } catch (error: any) {
    console.error('Error fetching survey response:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Ana siteden gelen anket cevaplarını admin panelde kaydet
export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const body = await request.json()
    const { answers, completedAt, userAgent, ipAddress } = body

    // Neon PostgreSQL'de anket cevabını kaydet
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        completedAt: new Date(completedAt),
        userAgent: userAgent || '',
        ipAddress: ipAddress || '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Anket cevabı admin paneline kaydedildi',
      id: surveyResponse.id
    })

  } catch (error: any) {
    console.error('Error saving survey response:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}