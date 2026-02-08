import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authMiddleware'

// Neon PostgreSQL'den kullanıcının anket cevaplarını getir
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
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

    // Soru etiketleri (ana sitedeki anket sırasına göre)
    const QUESTION_LABELS: Record<number, string> = {
      1: 'Ülke',
      2: 'Memleket',
      3: 'Havalimanları',
      4: 'Ulaşım',
      5: 'Okul Çocuğu',
      6: 'Araç Kiralama',
      7: 'Otel Tercihi',
      8: 'Telefon Hattı',
      9: 'Cinsiyet / Yaş',
      10: 'İletişim İzni',
    }

    // JSON string içindeki özel objeleri okunabilir metne çevir
    function formatJsonAnswer(raw: string): string {
      try {
        const obj = JSON.parse(raw)
        if (typeof obj !== 'object' || obj === null) return raw

        // Havalimanı bilgileri
        if (obj.departure && obj.return) {
          const dep = obj.departure.name || obj.departure.city || obj.departure.code || ''
          const ret = obj.return.name || obj.return.city || obj.return.code || ''
          const depCode = obj.departure.code ? ` (${obj.departure.code})` : ''
          const retCode = obj.return.code ? ` (${obj.return.code})` : ''
          return `${dep}${depCode} → ${ret}${retCode}`
        }
        // Demografik bilgiler
        if (obj.gender !== undefined && obj.ageRange !== undefined) {
          return `${obj.gender}, ${obj.ageRange} yaş`
        }
        // İzin bilgileri
        if (obj.emailPermission !== undefined || obj.phonePermission !== undefined) {
          const perms: string[] = []
          if (obj.emailPermission) perms.push('E-posta')
          if (obj.phonePermission) perms.push('Telefon')
          return perms.length > 0 ? `${perms.join(', ')} izni var` : 'İzin yok'
        }
        return raw
      } catch {
        return raw
      }
    }

    // JSON string'i parse et ve düzenli format'a çevir
    let formattedAnswers: Array<{question: string, answer: string}> = []
    try {
      const parsedAnswers = JSON.parse(surveyResponse.answers)
      
      if (Array.isArray(parsedAnswers)) {
        parsedAnswers.forEach((item: any, index: number) => {
          const qId = item?.questionId ?? (index + 1)
          const label = QUESTION_LABELS[qId] || `Soru ${qId}`

          if (typeof item === 'string') {
            formattedAnswers.push({ question: label, answer: item })
          } else if (typeof item === 'object' && item.answer !== undefined) {
            // answer alanı string ise JSON olabilir, parse et
            const rawAnswer = typeof item.answer === 'string' ? item.answer : JSON.stringify(item.answer)
            formattedAnswers.push({ question: label, answer: formatJsonAnswer(rawAnswer) })
          } else if (typeof item === 'object') {
            formattedAnswers.push({ question: label, answer: formatJsonAnswer(JSON.stringify(item)) })
          }
        })
      } else if (typeof parsedAnswers === 'object') {
        Object.entries(parsedAnswers).forEach(([key, value]) => {
          formattedAnswers.push({ question: key, answer: String(value) })
        })
      }
    } catch (error) {
      console.error('Anket cevapları parse edilemedi:', error)
      formattedAnswers = [{ question: 'Ham Veri', answer: surveyResponse.answers }]
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
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck
  
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