import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Kampanya güncellendi, cache'i temizle
    console.log('Kampanya güncellendi:', body)
    
    // Burada cache temizleme işlemi yapılabilir
    // Şimdilik sadece log atıyoruz
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refresh API hatası:', error)
    return NextResponse.json({ success: false, error: 'Refresh hatası' })
  }
}

