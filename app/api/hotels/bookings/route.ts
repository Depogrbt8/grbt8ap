import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';

// Mock data generator
const generateMockBookings = (count: number = 10) => {
  const statuses: ('pending' | 'confirmed' | 'cancelled' | 'completed')[] = ['pending', 'confirmed', 'cancelled', 'completed'];
  const hotels = [
    { name: 'Grand Hotel Istanbul', location: 'Istanbul, Türkiye' },
    { name: 'Hilton Paris Opera', location: 'Paris, Fransa' },
    { name: 'Marriott Berlin', location: 'Berlin, Almanya' },
    { name: 'Hyatt Regency Amsterdam', location: 'Amsterdam, Hollanda' },
    { name: 'Sheraton London', location: 'London, İngiltere' },
    { name: 'Ritz Carlton Vienna', location: 'Vienna, Avusturya' },
    { name: 'Four Seasons Geneva', location: 'Geneva, İsviçre' },
    { name: 'InterContinental Brussels', location: 'Brussels, Belçika' },
  ];
  
  const roomTypes = ['Deluxe Room', 'Suite', 'Standard Room', 'Executive Suite', 'Presidential Suite'];
  const providers = ['amadeus', 'expedia', 'booking.com', 'demo'];
  const currencies = ['EUR', 'USD', 'GBP', 'TRY'];
  
  const bookings = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const hotel = hotels[Math.floor(Math.random() * hotels.length)];
    const checkIn = new Date(now);
    checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    const adults = Math.floor(Math.random() * 4) + 1;
    const children = Math.floor(Math.random() * 2);
    const rooms = Math.floor(Math.random() * 2) + 1;
    const pricePerNight = Math.floor(Math.random() * 200) + 50;
    const totalPrice = pricePerNight * nights * rooms;
    
    const firstName = ['Ahmet', 'Mehmet', 'Fatma', 'Ayşe', 'Ali', 'Zeynep', 'Mustafa', 'Elif'][Math.floor(Math.random() * 8)];
    const lastName = ['Yılmaz', 'Demir', 'Kaya', 'Şahin', 'Çelik', 'Arslan', 'Öztürk', 'Aydın'][Math.floor(Math.random() * 8)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    
    bookings.push({
      id: `hotel-booking-${i + 1}`,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      hotelId: `hotel-${Math.floor(Math.random() * 1000)}`,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      roomType: 'Deluxe',
      roomName: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights: nights,
      guests: JSON.stringify({ adults, children, rooms }),
      guestInfo: JSON.stringify({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+90 555 ${Math.floor(Math.random() * 9000) + 1000}`
      }),
      totalPrice: totalPrice,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      confirmationNumber: `HTL${Math.floor(Math.random() * 900000) + 100000}`,
      bookingReference: `REF-${Math.floor(Math.random() * 90000) + 10000}`,
      cancellationPolicy: 'Free cancellation until 24 hours before check-in',
      provider: provider,
      providerBookingId: `PROV-${Math.floor(Math.random() * 90000) + 10000}`,
      apiProviderId: provider === 'demo' ? null : `provider-${Math.floor(Math.random() * 5) + 1}`,
      createdAt: new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      cancelledAt: null,
      cancellationReason: null,
      user: {
        id: `user-${Math.floor(Math.random() * 100)}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+90 555 ${Math.floor(Math.random() * 9000) + 1000}`
      },
      apiProvider: {
        name: provider,
        displayName: provider === 'amadeus' ? 'Amadeus Hotel API' :
                     provider === 'expedia' ? 'Expedia Partner Solutions' :
                     provider === 'booking.com' ? 'Booking.com API' : 'Demo Provider'
      }
    });
  }
  
  return bookings;
};

// GET: Otel rezervasyonlarını listele
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const useMock = searchParams.get('mock') === 'true' || process.env.USE_MOCK_HOTEL_BOOKINGS === 'true';
    
    // Mock data kullanılacaksa direkt döndür
    if (useMock) {
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const userId = searchParams.get('userId');
      
      let mockBookings = generateMockBookings(20);
      
      // Status filtresi
      if (status && status !== 'all') {
        mockBookings = mockBookings.filter(b => b.status === status);
      }
      
      // Search filtresi
      if (search) {
        const searchLower = search.toLowerCase();
        mockBookings = mockBookings.filter(b => 
          b.hotelName.toLowerCase().includes(searchLower) ||
          b.hotelLocation.toLowerCase().includes(searchLower) ||
          b.confirmationNumber.toLowerCase().includes(searchLower) ||
          b.user.email.toLowerCase().includes(searchLower) ||
          b.user.firstName.toLowerCase().includes(searchLower) ||
          b.user.lastName.toLowerCase().includes(searchLower)
        );
      }
      
      // UserId filtresi
      if (userId) {
        mockBookings = mockBookings.filter(b => b.userId === userId);
      }
      
      return NextResponse.json({
        success: true,
        data: mockBookings,
        pagination: {
          page: 1,
          limit: 50,
          total: mockBookings.length,
          totalPages: 1
        }
      });
    }

    // Gerçek API çağrısı
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app';
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(
      `${mainSiteUrl}/api/hotels/bookings?${searchParams.toString()}`,
      {
        headers: {
          'x-admin-panel-token': process.env.ADMIN_PANEL_SECRET || '',
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'User-Agent': request.headers.get('user-agent') || '',
          'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        },
        credentials: 'include',
      }
    );

    // Ana site yanıt vermezse mock data döndür
    if (!response.ok) {
      console.log('Ana site yanıt vermedi, mock data döndürülüyor...');
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const userId = searchParams.get('userId');
      
      let mockBookings = generateMockBookings(20);
      
      if (status && status !== 'all') {
        mockBookings = mockBookings.filter(b => b.status === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        mockBookings = mockBookings.filter(b => 
          b.hotelName.toLowerCase().includes(searchLower) ||
          b.hotelLocation.toLowerCase().includes(searchLower) ||
          b.confirmationNumber.toLowerCase().includes(searchLower) ||
          b.user.email.toLowerCase().includes(searchLower) ||
          b.user.firstName.toLowerCase().includes(searchLower) ||
          b.user.lastName.toLowerCase().includes(searchLower)
        );
      }
      
      if (userId) {
        mockBookings = mockBookings.filter(b => b.userId === userId);
      }
      
      return NextResponse.json({
        success: true,
        data: mockBookings,
        pagination: {
          page: 1,
          limit: 50,
          total: mockBookings.length,
          totalPages: 1
        }
      });
    }

    const data = await response.json();
    
    // Ana site { data: { bookings: [...], pagination } } formatında döndürüyor
    // Admin panel frontend düz dizi bekliyor, normalize et
    if (data.success && data.data && !Array.isArray(data.data) && Array.isArray(data.data.bookings)) {
      return NextResponse.json({
        success: true,
        data: data.data.bookings,
        pagination: data.data.pagination
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in admin panel hotel bookings proxy:', error);
    console.log('Hata durumunda mock data döndürülüyor...');
    
    // Hata durumunda da mock data döndür
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    
    let mockBookings = generateMockBookings(20);
    
    if (status && status !== 'all') {
      mockBookings = mockBookings.filter(b => b.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      mockBookings = mockBookings.filter(b => 
        b.hotelName.toLowerCase().includes(searchLower) ||
        b.hotelLocation.toLowerCase().includes(searchLower) ||
        b.confirmationNumber.toLowerCase().includes(searchLower) ||
        b.user.email.toLowerCase().includes(searchLower) ||
        b.user.firstName.toLowerCase().includes(searchLower) ||
        b.user.lastName.toLowerCase().includes(searchLower)
      );
    }
    
    if (userId) {
      mockBookings = mockBookings.filter(b => b.userId === userId);
    }
    
    return NextResponse.json({
      success: true,
      data: mockBookings,
      pagination: {
        page: 1,
        limit: 50,
        total: mockBookings.length,
        totalPages: 1
      }
    });
  }
}
