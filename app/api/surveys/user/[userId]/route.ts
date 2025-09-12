import { NextResponse } from 'next/server'

// Ana sitedeki SQLite veritabanından kullanıcının anket cevaplarını getir
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Vercel production ortamında SQLite erişimi yok
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        message: 'Bu özellik production ortamında kullanılamaz'
      }, { status: 501 })
    }

    // Local development için SQLite bağlantısı
    const Database = require('better-sqlite3')
    const db = new Database('/Users/incesu/Desktop/grbt8/prisma/dev.db')
    
    // Kullanıcının en son anket cevabını getir
    const stmt = db.prepare(`
      SELECT * FROM SurveyResponse 
      WHERE userId = ? 
      ORDER BY completedAt DESC 
      LIMIT 1
    `)
    
    const surveyResponse = stmt.get(userId)
    db.close()

    if (!surveyResponse) {
      return NextResponse.json({
        success: false,
        message: 'Anket cevabı bulunamadı'
      }, { status: 404 })
    }

    // JSON string'i parse et ve düzenli format'a çevir
    let formattedAnswers = []
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
      error: error.message
    }, { status: 500 })
  }
}
