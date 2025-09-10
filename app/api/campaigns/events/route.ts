import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // SSE header'ları
      controller.enqueue('data: {"type":"connected"}\n\n')
      
      // Kampanya güncellemelerini dinle
      const interval = setInterval(() => {
        controller.enqueue('data: {"type":"ping"}\n\n')
      }, 30000) // 30 saniyede bir ping
      
      // Cleanup
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}

// Kampanya güncellendiğinde çağrılacak fonksiyon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Ana site'e güncelleme gönder
    const response = await fetch('http://localhost:3000/api/campaigns/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SSE güncelleme hatası:', error)
    return NextResponse.json({ success: false, error: 'Güncelleme hatası' })
  }
}

