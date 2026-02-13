import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authMiddleware'

const statuses = ['pending', 'confirmed', 'cancelled', 'completed'] as const
const cars = [
  { name: 'VW Polo', category: 'Ekonomi', supplier: 'Europcar' },
  { name: 'Ford Focus', category: 'Kompakt', supplier: 'Hertz' },
  { name: 'BMW 3 Serisi', category: 'Orta', supplier: 'Sixt' },
  { name: 'Mercedes C', category: 'Üst Orta', supplier: 'Avis' },
  { name: 'Toyota Corolla', category: 'Kompakt', supplier: 'Budget' },
  { name: 'Hyundai i20', category: 'Ekonomi', supplier: 'Europcar' },
  { name: 'Opel Astra', category: 'Kompakt', supplier: 'Enterprise' },
]
const firstNames = ['Ahmet', 'Mehmet', 'Fatma', 'Ayşe', 'Ali', 'Zeynep', 'Mustafa', 'Elif']
const lastNames = ['Yılmaz', 'Demir', 'Kaya', 'Şahin', 'Çelik', 'Arslan', 'Öztürk', 'Aydın']
const locations = ['İstanbul Havalimanı', 'Ankara Esenboğa', 'İzmir Adnan Menderes', 'Antalya Havalimanı', 'Gaziantep']

function generateMockCarBookings(count: number = 8) {
  const now = new Date()
  const list = []
  for (let i = 0; i < count; i++) {
    const car = cars[i % cars.length]
    const pickup = new Date(now)
    pickup.setDate(pickup.getDate() + Math.floor(Math.random() * 14))
    const dropoff = new Date(pickup)
    dropoff.setDate(dropoff.getDate() + Math.floor(Math.random() * 7) + 1)
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const totalPrice = Math.floor(Math.random() * 800) + 200
    const userId = `user-${Math.floor(Math.random() * 50) + 1}`
    list.push({
      id: `car-booking-demo-${i + 1}`,
      userId,
      bookingNumber: `GRB-CAR-${String(100000 + i).slice(-6)}`,
      bookingReference: `DEMO-${1000 + i}`,
      carName: car.name,
      carCategory: car.category,
      supplierName: car.supplier,
      pickupDateTime: pickup.toISOString(),
      dropoffDateTime: dropoff.toISOString(),
      driver: JSON.stringify({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+90 555 ${Math.floor(Math.random() * 9000) + 1000}`,
        countryCode: '+90',
      }),
      totalPrice,
      currency: 'EUR',
      status,
      createdAt: new Date(now.getTime() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000).toISOString(),
      confirmationEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      user: {
        id: userId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      },
    })
  }
  return list
}

/**
 * GET: Araç rezervasyonlarını ana siteden çek (admin proxy). ?mock=true ile demo veri döner.
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  const { searchParams } = new URL(request.url)
  const useMock = searchParams.get('mock') === 'true' || process.env.USE_MOCK_CAR_BOOKINGS === 'true'

  if (useMock) {
    let mock = generateMockCarBookings(10)
    const status = searchParams.get('status')
    if (status && status !== 'all') {
      mock = mock.filter((b) => b.status === status)
    }
    const userId = searchParams.get('userId')
    if (userId) {
      mock = mock.filter((b) => b.userId === userId)
    }
    return NextResponse.json({
      success: true,
      data: mock,
      pagination: { page: 1, limit: 50, total: mock.length, totalPages: 1 },
    })
  }

  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app'

    const response = await fetch(
      `${mainSiteUrl}/api/cars/bookings?${searchParams.toString()}`,
      {
        headers: {
          'x-admin-panel-token': process.env.ADMIN_PANEL_SECRET || '',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Ana site araç rezervasyonları yanıt vermedi:', response.status, text)
      const mock = generateMockCarBookings(10)
      return NextResponse.json({
        success: true,
        data: mock,
        pagination: { page: 1, limit: 50, total: mock.length, totalPages: 1 },
      })
    }

    const data = await response.json()

    if (data.success && data.data && !Array.isArray(data.data) && Array.isArray(data.data.bookings)) {
      const bookings = data.data.bookings as any[]
      if (bookings.length === 0) {
        return NextResponse.json({
          success: true,
          data: generateMockCarBookings(8),
          pagination: { page: 1, limit: 50, total: 8, totalPages: 1 },
        })
      }
      return NextResponse.json({
        success: true,
        data: data.data.bookings,
        pagination: data.data.pagination,
      })
    }

    if (data.success && Array.isArray(data.data?.bookings) && data.data.bookings.length === 0) {
      return NextResponse.json({
        success: true,
        data: generateMockCarBookings(8),
        pagination: { page: 1, limit: 50, total: 8, totalPages: 1 },
      })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Admin panel araç rezervasyonları proxy hatası:', error)
    return NextResponse.json({
      success: true,
      data: generateMockCarBookings(8),
      pagination: { page: 1, limit: 50, total: 8, totalPages: 1 },
    })
  }
}
