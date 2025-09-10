import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('userIds')

    let users = []

    if (userIds) {
      const userIdArray = userIds.split(',')
      users = await prisma.user.findMany({
        where: {
          id: { in: userIdArray }
        }
      })
    } else {
      users = await prisma.user.findMany()
    }

    // Kullanıcı verilerini formatla
    const formattedUsers = users.map(user => ({
      'Müşteri No': user.id,
      'Ad': user.firstName,
      'Soyad': user.lastName,
      'Email': user.email,
      'Telefon': user.phone || '-',
      'Kayıt Tarihi': new Date(user.createdAt).toLocaleDateString('tr-TR'),
      'Son Güncelleme': new Date(user.updatedAt).toLocaleDateString('tr-TR')
    }))

    // CSV oluştur
    const headers = Object.keys(formattedUsers[0] || {})
    const csvContent = [
      headers.join(','),
      ...formattedUsers.map(user => 
        headers.map(header => {
          const value = user[header as keyof typeof user] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kullanicilar_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Dışa aktarma başarısız' 
      },
      { status: 500 }
    )
  }
}
