import { NextRequest, NextResponse } from 'next/server'

// BiletDukkani API entegrasyonu örneği
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    if (!from || !to || !date) {
      return NextResponse.json({
        success: false,
        error: 'Kalkış, varış ve tarih bilgileri gerekli'
      }, { status: 400 })
    }

    // BiletDukkani API'sine proxy üzerinden istek
    const proxyUrl = new URL('/api/external/proxy', request.url)
    proxyUrl.searchParams.set('api', 'biletdukkani')
    proxyUrl.searchParams.set('endpoint', '/flights/search')
    proxyUrl.searchParams.set('method', 'GET')

    // Query parametrelerini ekle
    proxyUrl.searchParams.set('from', from)
    proxyUrl.searchParams.set('to', to)
    proxyUrl.searchParams.set('date', date)

    const response = await fetch(proxyUrl.toString())
    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: data.error || 'BiletDukkani API hatası'
      }, { status: response.status })
    }

    // Veriyi işle ve formatla
    const flights = data.data.flights?.map((flight: any) => ({
      id: flight.id,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departure: {
        airport: flight.departure.airport,
        time: flight.departure.time,
        city: flight.departure.city
      },
      arrival: {
        airport: flight.arrival.airport,
        time: flight.arrival.time,
        city: flight.arrival.city
      },
      price: flight.price,
      currency: flight.currency,
      duration: flight.duration,
      stops: flight.stops
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        flights,
        searchParams: { from, to, date },
        source: 'BiletDukkani',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('BiletDukkani entegrasyon hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}

// Rezervasyon oluşturma örneği
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightId, passengerInfo, paymentInfo } = body

    if (!flightId || !passengerInfo || !paymentInfo) {
      return NextResponse.json({
        success: false,
        error: 'Uçuş ID, yolcu bilgileri ve ödeme bilgileri gerekli'
      }, { status: 400 })
    }

    // BiletDukkani API'sine rezervasyon isteği
    const proxyUrl = new URL('/api/external/proxy', request.url)
    proxyUrl.searchParams.set('api', 'biletdukkani')
    proxyUrl.searchParams.set('endpoint', '/bookings/create')
    proxyUrl.searchParams.set('method', 'POST')

    const bookingData = {
      flightId,
      passenger: passengerInfo,
      payment: paymentInfo,
      timestamp: new Date().toISOString()
    }

    const response = await fetch(proxyUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Rezervasyon oluşturulamadı'
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: data.data.bookingId,
        confirmationCode: data.data.confirmationCode,
        status: data.data.status,
        passenger: passengerInfo,
        source: 'BiletDukkani',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Rezervasyon hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası'
    }, { status: 500 })
  }
}
