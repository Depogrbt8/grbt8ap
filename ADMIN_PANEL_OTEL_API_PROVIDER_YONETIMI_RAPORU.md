# ADMIN PANEL - OTEL API PROVIDER YÖNETİMİ RAPORU
## Gurbetbiz Admin Panel - Otel API Sağlayıcı Yönetim Sistemi

**Tarih:** 2024  
**Proje:** Gurbetbiz Admin Panel (grbt8ap)  
**Modül:** Otel API Provider Yönetimi  
**Durum:** Geliştirme Aşaması

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Mevcut Sistem Analizi](#mevcut-sistem-analizi)
3. [Veritabanı Modeli](#veritabanı-modeli)
4. [Ana Site API Endpoint'leri](#ana-site-api-endpointleri)
5. [Admin Panel Sayfaları](#admin-panel-sayfaları)
6. [Admin Panel Component'leri](#admin-panel-componentleri)
7. [Admin Panel API Proxy'leri](#admin-panel-api-proxyleri)
8. [Implementasyon Adımları](#implementasyon-adımları)
9. [Güvenlik ve Best Practices](#güvenlik-ve-best-practices)
10. [Test Senaryoları](#test-senaryoları)

---

## 🎯 GENEL BAKIŞ

### Amaç
Admin panelde otel API sağlayıcılarını (Amadeus, Expedia, Booking.com) yönetmek için kapsamlı bir sistem oluşturmak. Bu sistem sayesinde:
- API credentials güvenli şekilde saklanacak
- Provider'lar aktif/pasif yapılabilecek
- Test/Production modu kontrol edilebilecek
- Health check ve monitoring yapılabilecek
- Multi-provider desteği yönetilebilecek

### Temel Özellikler
- ✅ API Provider listesi ve yönetimi
- ✅ API credentials yönetimi (şifreli)
- ✅ Provider aktif/pasif durumu
- ✅ Test/Production modu
- ✅ Health check ve durum monitoring
- ✅ Provider ayarları (timeout, retry, priority)
- ✅ API test fonksiyonu
- ✅ Provider bazlı rezervasyon istatistikleri

---

## 🔍 MEVCUT SİSTEM ANALİZİ

### Admin Panel Yapısı (grbt8ap)

**Mevcut Durum:**
- **Ana Site (grbt8):** API endpoint'leri sağlıyor (`/api/hotels/bookings/`, `/api/hotels/metrics/`)
- **Admin Panel (grbt8ap):** Ana sitedeki API'leri proxy ediyor
- **Veritabanı:** Her iki proje de aynı Prisma schema'yı kullanıyor (PostgreSQL)
- **Pattern:** Admin panel, ana sitedeki API endpoint'lerini proxy ediyor

**Mevcut Örnekler:**
- `/app/api/reservations/metrics/route.ts` - Ana siteden rezervasyon metriklerini çekiyor
- `/app/api/flights/metrics/route.ts` - Ana siteden uçuş metriklerini çekiyor
- `/app/rezervasyonlar/page.tsx` - Rezervasyon listesi sayfası

**Mevcut Otel API Yapısı:**
- `HotelBooking` modelinde `provider` alanı var (demo, amadeus, expedia, booking.com)
- `/api/hotels/bookings/route.ts` - Rezervasyon oluşturma (provider parametresi alıyor)
- `/api/hotels/bookings/metrics/route.ts` - Rezervasyon metrikleri

---

## 📊 VERİTABANI MODELİ

### Prisma Schema Eklentisi

**Her iki projede de (`grbt8` ve `grbt8ap`) `prisma/schema.prisma` dosyasına eklenecek:**

```prisma
// Otel API Sağlayıcı Yönetimi
model HotelApiProvider {
  id                String    @id @default(cuid())
  name              String    @unique // "amadeus", "expedia", "booking.com"
  displayName       String    // "Amadeus Hotel API", "Expedia Partner Solutions"
  isActive          Boolean   @default(false) // Provider aktif mi?
  isTestMode        Boolean   @default(true) // Test modunda mı?
  
  // API Credentials (Şifreli saklanacak)
  apiKey            String?   // Encrypted API key
  apiSecret         String?   // Encrypted API secret
  apiUrl            String?   // Base API URL (opsiyonel, default kullanılabilir)
  accessToken       String?   // OAuth token (varsa, encrypted)
  refreshToken      String?   // OAuth refresh token (varsa, encrypted)
  tokenExpiresAt    DateTime? // Token son kullanma tarihi
  
  // Provider Ayarları
  timeout           Int       @default(30000) // ms cinsinden timeout
  retryCount        Int       @default(3) // Retry sayısı
  retryDelay        Int       @default(1000) // ms cinsinden retry delay
  priority          Int       @default(1) // Multi-provider için öncelik (1=en yüksek)
  maxConcurrentRequests Int   @default(10) // Maksimum eşzamanlı istek sayısı
  
  // Monitoring ve Durum
  lastSyncAt        DateTime? // Son senkronizasyon zamanı
  lastTestAt        DateTime? // Son test zamanı
  healthStatus      String    @default("unknown") // "healthy", "degraded", "down", "unknown"
  healthCheckUrl    String?  // Health check endpoint (opsiyonel)
  errorCount        Int       @default(0) // Son 24 saatteki hata sayısı
  lastErrorAt       DateTime? // Son hata zamanı
  lastErrorMessage  String?  // Son hata mesajı
  
  // Metadata
  description       String?  // Provider açıklaması
  documentationUrl  String?  // API dokümantasyon URL'i
  supportEmail      String?  // Destek email'i
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  bookings          HotelBooking[] // Bu provider ile yapılan rezervasyonlar
  
  @@index([name])
  @@index([isActive])
  @@index([healthStatus])
  @@index([priority])
}

// HotelBooking modeline relation ekle (zaten var, sadece relation ekleniyor)
model HotelBooking {
  // ... mevcut alanlar
  provider            String?   // demo, amadeus, expedia, booking.com
  providerBookingId   String?   // External provider booking ID
  
  // Yeni relation (opsiyonel)
  apiProvider         HotelApiProvider? @relation(fields: [provider], references: [name])
}
```

### Migration

**Her iki projede de migration çalıştırılacak:**
```bash
npx prisma migrate dev --name add_hotel_api_provider
npx prisma generate
```

---

## 🔌 ANA SİTE API ENDPOINT'LERİ

### Dosya Yapısı (`grbt8/app/api/hotels/providers/`)

```
app/api/hotels/providers/
├── route.ts                    # GET: Liste, POST: Yeni provider
├── [name]/
│   ├── route.ts                # GET: Detay, PUT: Güncelleme, DELETE: Silme
│   ├── test/
│   │   └── route.ts            # POST: API test
│   ├── health/
│   │   └── route.ts            # GET: Health check
│   └── toggle/
│       └── route.ts            # POST: Aktif/Pasif toggle
└── stats/
    └── route.ts                # GET: Provider istatistikleri
```

### 1. Provider Listesi ve Oluşturma (`route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Şifreleme fonksiyonları
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'your-32-char-secret-key-here';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// GET: Provider listesi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const providers = await prisma.hotelApiProvider.findMany({
      orderBy: [
        { priority: 'asc' },
        { displayName: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        displayName: true,
        isActive: true,
        isTestMode: true,
        apiUrl: true,
        timeout: true,
        retryCount: true,
        priority: true,
        lastSyncAt: true,
        lastTestAt: true,
        healthStatus: true,
        errorCount: true,
        lastErrorAt: true,
        lastErrorMessage: true,
        description: true,
        documentationUrl: true,
        supportEmail: true,
        createdAt: true,
        updatedAt: true,
        // API key ve secret gösterilmez (güvenlik)
      }
    });

    return NextResponse.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Hotel API provider list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

// POST: Yeni provider oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      displayName,
      apiKey,
      apiSecret,
      apiUrl,
      accessToken,
      refreshToken,
      timeout,
      retryCount,
      retryDelay,
      priority,
      maxConcurrentRequests,
      healthCheckUrl,
      description,
      documentationUrl,
      supportEmail,
      isTestMode = true
    } = body;

    // Validasyon
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Name and displayName are required' },
        { status: 400 }
      );
    }

    // API key ve secret şifrele
    const encryptedApiKey = apiKey ? encrypt(apiKey) : null;
    const encryptedApiSecret = apiSecret ? encrypt(apiSecret) : null;
    const encryptedAccessToken = accessToken ? encrypt(accessToken) : null;
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    const provider = await prisma.hotelApiProvider.create({
      data: {
        name,
        displayName,
        apiKey: encryptedApiKey,
        apiSecret: encryptedApiSecret,
        apiUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        timeout: timeout || 30000,
        retryCount: retryCount || 3,
        retryDelay: retryDelay || 1000,
        priority: priority || 1,
        maxConcurrentRequests: maxConcurrentRequests || 10,
        healthCheckUrl,
        description,
        documentationUrl,
        supportEmail,
        isTestMode,
        isActive: false, // Yeni provider varsayılan olarak pasif
        healthStatus: 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        isActive: provider.isActive,
        isTestMode: provider.isTestMode,
        healthStatus: provider.healthStatus
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Hotel API provider create error:', error);
    
    // Unique constraint hatası
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Provider with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create provider' },
      { status: 500 }
    );
  }
}
```

### 2. Provider Detay, Güncelleme ve Silme (`[name]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Şifreleme fonksiyonları (yukarıdaki gibi)
// ...

// GET: Provider detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // API key ve secret gösterilmez, sadece varlığı belirtilir
    return NextResponse.json({
      success: true,
      data: {
        ...provider,
        apiKey: provider.apiKey ? '***encrypted***' : null,
        apiSecret: provider.apiSecret ? '***encrypted***' : null,
        accessToken: provider.accessToken ? '***encrypted***' : null,
        refreshToken: provider.refreshToken ? '***encrypted***' : null,
        bookingCount: provider._count.bookings
      }
    });
  } catch (error) {
    console.error('Hotel API provider detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

// PUT: Provider güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    // Sadece gönderilen alanları güncelle
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.apiUrl !== undefined) updateData.apiUrl = body.apiUrl;
    if (body.timeout !== undefined) updateData.timeout = body.timeout;
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount;
    if (body.retryDelay !== undefined) updateData.retryDelay = body.retryDelay;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.maxConcurrentRequests !== undefined) updateData.maxConcurrentRequests = body.maxConcurrentRequests;
    if (body.healthCheckUrl !== undefined) updateData.healthCheckUrl = body.healthCheckUrl;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.documentationUrl !== undefined) updateData.documentationUrl = body.documentationUrl;
    if (body.supportEmail !== undefined) updateData.supportEmail = body.supportEmail;
    if (body.isTestMode !== undefined) updateData.isTestMode = body.isTestMode;

    // API key ve secret şifreleme ile güncelle
    if (body.apiKey !== undefined) {
      updateData.apiKey = body.apiKey ? encrypt(body.apiKey) : null;
    }
    if (body.apiSecret !== undefined) {
      updateData.apiSecret = body.apiSecret ? encrypt(body.apiSecret) : null;
    }
    if (body.accessToken !== undefined) {
      updateData.accessToken = body.accessToken ? encrypt(body.accessToken) : null;
    }
    if (body.refreshToken !== undefined) {
      updateData.refreshToken = body.refreshToken ? encrypt(body.refreshToken) : null;
    }

    const provider = await prisma.hotelApiProvider.update({
      where: { name: params.name },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        isActive: provider.isActive,
        isTestMode: provider.isTestMode,
        healthStatus: provider.healthStatus
      }
    });
  } catch (error: any) {
    console.error('Hotel API provider update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

// DELETE: Provider silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    // Aktif provider silinemez
    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active provider. Please deactivate first.' },
        { status: 400 }
      );
    }

    await prisma.hotelApiProvider.delete({
      where: { name: params.name }
    });

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    console.error('Hotel API provider delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete provider' },
      { status: 500 }
    );
  }
}
```

### 3. Provider Test (`[name]/test/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// POST: API test
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // API key ve secret'ı decrypt et
    const apiKey = provider.apiKey ? decrypt(provider.apiKey) : null;
    const apiSecret = provider.apiSecret ? decrypt(provider.apiSecret) : null;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'API credentials not configured' },
        { status: 400 }
      );
    }

    // Test isteği gönder (provider'a göre farklı endpoint'ler)
    let testResult;
    try {
      // Örnek: Amadeus için test
      if (provider.name === 'amadeus') {
        const testUrl = provider.isTestMode 
          ? 'https://test.api.amadeus.com/v1/security/oauth2/token'
          : 'https://api.amadeus.com/v1/security/oauth2/token';
        
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: apiKey,
            client_secret: apiSecret
          }),
          signal: AbortSignal.timeout(provider.timeout)
        });

        testResult = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: response.ok ? await response.json() : await response.text()
        };
      }
      // Diğer provider'lar için benzer testler...

      // Test sonucunu kaydet
      await prisma.hotelApiProvider.update({
        where: { name: params.name },
        data: {
          lastTestAt: new Date(),
          healthStatus: testResult.success ? 'healthy' : 'down',
          errorCount: testResult.success ? 0 : provider.errorCount + 1,
          lastErrorAt: testResult.success ? null : new Date(),
          lastErrorMessage: testResult.success ? null : testResult.statusText
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          testResult,
          provider: {
            name: provider.name,
            displayName: provider.displayName,
            healthStatus: testResult.success ? 'healthy' : 'down'
          }
        }
      });
    } catch (testError: any) {
      // Test hatası
      await prisma.hotelApiProvider.update({
        where: { name: params.name },
        data: {
          lastTestAt: new Date(),
          healthStatus: 'down',
          errorCount: provider.errorCount + 1,
          lastErrorAt: new Date(),
          lastErrorMessage: testError.message
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Test failed',
        details: testError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Hotel API provider test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test provider' },
      { status: 500 }
    );
  }
}
```

### 4. Provider Toggle (`[name]/toggle/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST: Aktif/Pasif toggle
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Toggle işlemi
    const updatedProvider = await prisma.hotelApiProvider.update({
      where: { name: params.name },
      data: {
        isActive: !provider.isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        name: updatedProvider.name,
        displayName: updatedProvider.displayName,
        isActive: updatedProvider.isActive
      }
    });
  } catch (error) {
    console.error('Hotel API provider toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle provider' },
      { status: 500 }
    );
  }
}
```

### 5. Provider İstatistikleri (`stats/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Provider istatistikleri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('startDate');

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Provider bazlı rezervasyon istatistikleri
    const providerStats = await prisma.hotelBooking.groupBy({
      by: ['provider'],
      _count: true,
      _sum: {
        totalPrice: true
      },
      where: {
        ...dateFilter,
        provider: { not: null }
      }
    });

    // Provider durumları
    const providers = await prisma.hotelApiProvider.findMany({
      select: {
        name: true,
        displayName: true,
        isActive: true,
        healthStatus: true,
        errorCount: true,
        lastTestAt: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        providerStats: providerStats.map(item => ({
          provider: item.provider,
          bookingCount: item._count,
          totalRevenue: item._sum.totalPrice || 0
        })),
        providers: providers.map(p => ({
          name: p.name,
          displayName: p.displayName,
          isActive: p.isActive,
          healthStatus: p.healthStatus,
          errorCount: p.errorCount,
          lastTestAt: p.lastTestAt,
          bookingCount: p._count.bookings
        }))
      }
    });
  } catch (error) {
    console.error('Hotel API provider stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

---

## 🖥️ ADMIN PANEL SAYFALARI

### Dosya Yapısı (`grbt8ap/app/`)

```
app/
├── oteller/
│   ├── page.tsx                 # Otel rezervasyonları listesi (mevcut)
│   ├── [id]/
│   │   └── page.tsx             # Rezervasyon detayı (mevcut)
│   └── api-providers/           # YENİ: API Provider yönetimi
│       ├── page.tsx              # Provider listesi
│       ├── [name]/
│       │   └── page.tsx          # Provider detay ve düzenleme
│       └── yeni/
│           └── page.tsx          # Yeni provider ekleme
```

### 1. Provider Listesi Sayfası (`api-providers/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import HotelApiProviderList from '../components/hotels/HotelApiProviderList';
import HotelApiProviderFilters from '../components/hotels/HotelApiProviderFilters';
import Link from 'next/link';

export default function OtelApiProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isActive: '',
    healthStatus: '',
    search: ''
  });

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://gurbetbiz.app';
      const params = new URLSearchParams();
      if (filters.isActive) params.append('isActive', filters.isActive);
      if (filters.healthStatus) params.append('healthStatus', filters.healthStatus);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`${mainSiteUrl}/api/hotels/providers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Otel API Sağlayıcıları</h1>
            <Link
              href="/oteller/api-providers/yeni"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Yeni Provider Ekle
            </Link>
          </div>
          
          <HotelApiProviderFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <HotelApiProviderList 
            providers={providers} 
            loading={loading}
            onRefresh={fetchProviders}
          />
        </main>
      </div>
    </div>
  );
}
```

### 2. Provider Detay ve Düzenleme Sayfası (`api-providers/[name]/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import HotelApiProviderForm from '../../components/hotels/HotelApiProviderForm';
import HotelApiProviderTest from '../../components/hotels/HotelApiProviderTest';

export default function OtelApiProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerName = params.name as string;
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'test'>('details');

  useEffect(() => {
    fetchProvider();
  }, [providerName]);

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://gurbetbiz.app';
      const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${providerName}`);
      const data = await response.json();
      
      if (data.success) {
        setProvider(data.data);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData: any) => {
    try {
      const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://gurbetbiz.app';
      const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${providerName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchProvider();
        alert('Provider başarıyla güncellendi');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Güncelleme hatası');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="text-center">Yükleniyor...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="text-center">Provider bulunamadı</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Geri Dön
            </button>
            <h1 className="text-2xl font-bold">{provider.displayName}</h1>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Detaylar ve Ayarlar
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                API Test
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <HotelApiProviderForm
              provider={provider}
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'test' && (
            <HotelApiProviderTest
              providerName={providerName}
              provider={provider}
            />
          )}
        </main>
      </div>
    </div>
  );
}
```

### 3. Yeni Provider Ekleme Sayfası (`api-providers/yeni/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import HotelApiProviderForm from '../../components/hotels/HotelApiProviderForm';

export default function YeniOtelApiProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (providerData: any) => {
    setLoading(true);
    try {
      const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://gurbetbiz.app';
      const response = await fetch(`${mainSiteUrl}/api/hotels/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerData)
      });
      
      const data = await response.json();
      if (data.success) {
        router.push(`/oteller/api-providers/${data.data.name}`);
      } else {
        alert(data.error || 'Provider oluşturma hatası');
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Provider oluşturma hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Geri Dön
            </button>
            <h1 className="text-2xl font-bold">Yeni API Provider Ekle</h1>
          </div>

          <HotelApiProviderForm
            provider={null}
            onSave={handleCreate}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
}
```

---

## 🧩 ADMIN PANEL COMPONENT'LERİ

### Dosya Yapısı (`grbt8ap/app/components/hotels/`)

```
components/hotels/
├── HotelApiProviderList.tsx         # Provider listesi component'i
├── HotelApiProviderCard.tsx         # Provider kartı
├── HotelApiProviderFilters.tsx      # Filtreleme component'i
├── HotelApiProviderForm.tsx         # Form component'i (create/edit)
├── HotelApiProviderTest.tsx         # API test component'i
└── HotelApiProviderStats.tsx        # İstatistikler component'i
```

### 1. Provider Listesi Component (`HotelApiProviderList.tsx`)

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import HotelApiProviderCard from './HotelApiProviderCard';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  healthStatus: string;
  lastTestAt: string | null;
  errorCount: number;
  priority: number;
}

interface HotelApiProviderListProps {
  providers: Provider[];
  loading: boolean;
  onRefresh: () => void;
}

export default function HotelApiProviderList({ 
  providers, 
  loading,
  onRefresh 
}: HotelApiProviderListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Henüz API provider eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map(provider => (
        <Link key={provider.id} href={`/oteller/api-providers/${provider.name}`}>
          <HotelApiProviderCard provider={provider} />
        </Link>
      ))}
    </div>
  );
}
```

### 2. Provider Kartı Component (`HotelApiProviderCard.tsx`)

```typescript
'use client';

import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  healthStatus: string;
  lastTestAt: string | null;
  errorCount: number;
  priority: number;
}

interface HotelApiProviderCardProps {
  provider: Provider;
}

export default function HotelApiProviderCard({ provider }: HotelApiProviderCardProps) {
  const getHealthIcon = () => {
    switch (provider.healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthColor = () => {
    switch (provider.healthStatus) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow cursor-pointer ${getHealthColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {provider.displayName}
          </h3>
          <p className="text-sm text-gray-500">{provider.name}</p>
        </div>
        {getHealthIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Durum:</span>
          <span className={`font-medium ${
            provider.isActive ? 'text-green-600' : 'text-gray-400'
          }`}>
            {provider.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Mod:</span>
          <span className={`font-medium ${
            provider.isTestMode ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {provider.isTestMode ? 'Test' : 'Production'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Öncelik:</span>
          <span className="font-medium text-gray-900">{provider.priority}</span>
        </div>

        {provider.errorCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hata Sayısı:</span>
            <span className="font-medium text-red-600">{provider.errorCount}</span>
          </div>
        )}

        {provider.lastTestAt && (
          <div className="text-xs text-gray-500 mt-2">
            Son test: {new Date(provider.lastTestAt).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Provider Form Component (`HotelApiProviderForm.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';

interface Provider {
  id?: string;
  name?: string;
  displayName?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  priority?: number;
  maxConcurrentRequests?: number;
  healthCheckUrl?: string;
  description?: string;
  documentationUrl?: string;
  supportEmail?: string;
  isTestMode?: boolean;
  isActive?: boolean;
}

interface HotelApiProviderFormProps {
  provider: Provider | null;
  onSave?: (data: Provider) => void;
  onUpdate?: (data: Partial<Provider>) => void;
  loading?: boolean;
}

export default function HotelApiProviderForm({ 
  provider, 
  onSave, 
  onUpdate,
  loading = false 
}: HotelApiProviderFormProps) {
  const [formData, setFormData] = useState<Provider>({
    name: provider?.name || '',
    displayName: provider?.displayName || '',
    apiKey: '',
    apiSecret: '',
    apiUrl: provider?.apiUrl || '',
    timeout: provider?.timeout || 30000,
    retryCount: provider?.retryCount || 3,
    retryDelay: provider?.retryDelay || 1000,
    priority: provider?.priority || 1,
    maxConcurrentRequests: provider?.maxConcurrentRequests || 10,
    healthCheckUrl: provider?.healthCheckUrl || '',
    description: provider?.description || '',
    documentationUrl: provider?.documentationUrl || '',
    supportEmail: provider?.supportEmail || '',
    isTestMode: provider?.isTestMode ?? true,
    isActive: provider?.isActive ?? false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    } else if (onUpdate) {
      onUpdate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider Adı (name) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!!provider} // Mevcut provider'da değiştirilemez
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="amadeus, expedia, booking.com"
          />
          <p className="text-xs text-gray-500 mt-1">Küçük harf, tire ile ayrılmış (örn: amadeus-hotel-api)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Görünen Ad (displayName) *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Amadeus Hotel API"
          />
        </div>

        {/* API Credentials */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">API Credentials</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key *
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            required={!provider} // Yeni provider'da zorunlu
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={provider ? 'Değiştirmek için yeni değer girin' : 'API Key'}
          />
          {provider && (
            <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız mevcut değer korunur</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Secret *
          </label>
          <input
            type="password"
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            required={!provider}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={provider ? 'Değiştirmek için yeni değer girin' : 'API Secret'}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API URL (Opsiyonel)
          </label>
          <input
            type="url"
            value={formData.apiUrl}
            onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="https://api.example.com"
          />
          <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa provider'ın varsayılan URL'i kullanılır</p>
        </div>

        {/* Ayarlar */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">Ayarlar</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeout (ms)
          </label>
          <input
            type="number"
            value={formData.timeout}
            onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retry Sayısı
          </label>
          <input
            type="number"
            value={formData.retryCount}
            onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retry Delay (ms)
          </label>
          <input
            type="number"
            value={formData.retryDelay}
            onChange={(e) => setFormData({ ...formData, retryDelay: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Öncelik (Priority)
          </label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">1 = En yüksek öncelik</p>
        </div>

        {/* Durum */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 mt-6">Durum</h2>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTestMode}
              onChange={(e) => setFormData({ ...formData, isTestMode: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Test Modu</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Kaydediliyor...' : provider ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </form>
  );
}
```

### 4. Provider Test Component (`HotelApiProviderTest.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HotelApiProviderTestProps {
  providerName: string;
  provider: any;
}

export default function HotelApiProviderTest({ providerName, provider }: HotelApiProviderTestProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://gurbetbiz.app';
      const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${providerName}/test`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Test sırasında bir hata oluştu'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">API Bağlantı Testi</h2>
        <p className="text-sm text-gray-600">
          Provider'ın API bağlantısını test edin. Bu işlem API credentials'ları kullanarak gerçek bir istek gönderir.
        </p>
      </div>

      <button
        onClick={handleTest}
        disabled={testing || !provider.apiKey}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Test Ediliyor...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Test Et
          </>
        )}
      </button>

      {!provider.apiKey && (
        <p className="text-sm text-red-600 mt-2">
          API credentials yapılandırılmamış. Lütfen önce API Key ve Secret ekleyin.
        </p>
      )}

      {testResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.success ? 'Test Başarılı' : 'Test Başarısız'}
            </span>
          </div>

          {testResult.data?.testResult && (
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Status:</strong> {testResult.data.testResult.status} {testResult.data.testResult.statusText}
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(testResult.data.testResult.data, null, 2)}
              </pre>
            </div>
          )}

          {testResult.error && (
            <p className="text-sm text-red-700 mt-2">
              <strong>Hata:</strong> {testResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 ADMIN PANEL API PROXY'LERİ

### Dosya Yapısı (`grbt8ap/app/api/hotels/providers/`)

```
app/api/hotels/providers/
├── route.ts                    # Proxy: Ana siteden provider listesi
├── [name]/
│   ├── route.ts                # Proxy: Provider detay/güncelleme
│   ├── test/
│   │   └── route.ts            # Proxy: API test
│   └── toggle/
│       └── route.ts            # Proxy: Aktif/Pasif toggle
└── stats/
    └── route.ts                # Proxy: Provider istatistikleri
```

### Örnek Proxy (`route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app';
    const { searchParams } = new URL(request.url);
    
    // Ana sitedeki endpoint'e yönlendir
    const response = await fetch(
      `${mainSiteUrl}/api/hotels/providers?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}` // Gerekirse
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch providers' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in admin panel hotel providers proxy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 İMPLEMENTASYON ADIMLARI

### Faz 1: Veritabanı ve Ana Site API (1-2 gün)

#### 1.1. Prisma Schema Güncelleme
- [ ] `grbt8/prisma/schema.prisma` - `HotelApiProvider` modeli ekle
- [ ] `grbt8ap/prisma/schema.prisma` - `HotelApiProvider` modeli ekle
- [ ] Migration çalıştır (her iki projede)
- [ ] `prisma generate` çalıştır

#### 1.2. Ana Site API Endpoint'leri
- [ ] `grbt8/app/api/hotels/providers/route.ts` - GET, POST
- [ ] `grbt8/app/api/hotels/providers/[name]/route.ts` - GET, PUT, DELETE
- [ ] `grbt8/app/api/hotels/providers/[name]/test/route.ts` - POST
- [ ] `grbt8/app/api/hotels/providers/[name]/toggle/route.ts` - POST
- [ ] `grbt8/app/api/hotels/providers/stats/route.ts` - GET

#### 1.3. Şifreleme Fonksiyonları
- [ ] `grbt8/lib/encryption.ts` - encrypt/decrypt fonksiyonları
- [ ] Environment variable: `API_ENCRYPTION_KEY`

### Faz 2: Admin Panel Sayfaları (2-3 gün)

#### 2.1. Sayfa Oluşturma
- [ ] `grbt8ap/app/oteller/api-providers/page.tsx` - Liste sayfası
- [ ] `grbt8ap/app/oteller/api-providers/[name]/page.tsx` - Detay sayfası
- [ ] `grbt8ap/app/oteller/api-providers/yeni/page.tsx` - Yeni provider sayfası

#### 2.2. Sidebar Menü
- [ ] Sidebar'a "API Provider'lar" menü öğesi ekle
- [ ] `/oteller/api-providers` linki ekle

### Faz 3: Admin Panel Component'leri (2-3 gün)

#### 3.1. Component Oluşturma
- [ ] `grbt8ap/app/components/hotels/HotelApiProviderList.tsx`
- [ ] `grbt8ap/app/components/hotels/HotelApiProviderCard.tsx`
- [ ] `grbt8ap/app/components/hotels/HotelApiProviderFilters.tsx`
- [ ] `grbt8ap/app/components/hotels/HotelApiProviderForm.tsx`
- [ ] `grbt8ap/app/components/hotels/HotelApiProviderTest.tsx`

### Faz 4: Admin Panel API Proxy'leri (1 gün)

#### 4.1. Proxy Endpoint'leri
- [ ] `grbt8ap/app/api/hotels/providers/route.ts`
- [ ] `grbt8ap/app/api/hotels/providers/[name]/route.ts`
- [ ] `grbt8ap/app/api/hotels/providers/[name]/test/route.ts`
- [ ] `grbt8ap/app/api/hotels/providers/[name]/toggle/route.ts`
- [ ] `grbt8ap/app/api/hotels/providers/stats/route.ts`

### Faz 5: Test ve İyileştirmeler (1-2 gün)

#### 5.1. Test Senaryoları
- [ ] Provider oluşturma testi
- [ ] Provider güncelleme testi
- [ ] Provider silme testi
- [ ] API test fonksiyonu testi
- [ ] Aktif/Pasif toggle testi
- [ ] Şifreleme/Şifre çözme testi

#### 5.2. UI/UX İyileştirmeleri
- [ ] Loading state'leri
- [ ] Error handling
- [ ] Success mesajları
- [ ] Responsive tasarım

---

## 🔒 GÜVENLİK VE BEST PRACTICES

### 1. API Credentials Güvenliği
- ✅ API key ve secret'lar şifreli saklanmalı (AES-256-CBC)
- ✅ Encryption key environment variable'da olmalı
- ✅ API credentials hiçbir zaman plain text olarak gösterilmemeli
- ✅ Admin panelde sadece "***encrypted***" gösterilmeli

### 2. Admin Kontrolü
- ✅ Tüm endpoint'lerde admin kontrolü yapılmalı
- ✅ `requireAdmin` middleware kullanılmalı
- ✅ Session kontrolü yapılmalı

### 3. Validation
- ✅ Provider name unique olmalı
- ✅ Zorunlu alanlar kontrol edilmeli
- ✅ API URL formatı validate edilmeli
- ✅ Timeout ve retry değerleri makul aralıkta olmalı

### 4. Error Handling
- ✅ Tüm hatalar loglanmalı
- ✅ Kullanıcıya anlaşılır hata mesajları gösterilmeli
- ✅ Sensitive bilgiler log'da gösterilmemeli

### 5. Environment Variables

**Ana Site (.env):**
```env
API_ENCRYPTION_KEY=your-32-character-hex-encryption-key-here
```

**Admin Panel (.env):**
```env
MAIN_SITE_URL=https://gurbetbiz.app
ADMIN_API_TOKEN=optional-api-token-for-security
```

---

## 🧪 TEST SENARYOLARI

### 1. Provider Oluşturma
- ✅ Yeni provider oluşturma
- ✅ Duplicate name kontrolü
- ✅ Zorunlu alanlar kontrolü
- ✅ API credentials şifreleme kontrolü

### 2. Provider Güncelleme
- ✅ Provider bilgileri güncelleme
- ✅ API credentials güncelleme
- ✅ Sadece gönderilen alanların güncellenmesi

### 3. Provider Silme
- ✅ Aktif provider silinememeli
- ✅ Pasif provider silinebilmeli
- ✅ İlişkili rezervasyonlar kontrol edilmeli

### 4. API Test
- ✅ Amadeus API testi
- ✅ Expedia API testi
- ✅ Hatalı credentials ile test
- ✅ Health status güncelleme

### 5. Provider Toggle
- ✅ Aktif → Pasif
- ✅ Pasif → Aktif
- ✅ Durum güncelleme

---

## 📝 ÖNEMLİ NOTLAR

1. **Veritabanı Senkronizasyonu:**
   - Her iki proje de aynı Prisma schema'yı kullanmalı
   - Migration'lar her iki projede de çalıştırılmalı

2. **API Güvenliği:**
   - Tüm endpoint'ler admin kontrolü yapmalı
   - API credentials şifreli saklanmalı
   - Encryption key güvenli tutulmalı

3. **Provider Test:**
   - Test fonksiyonu gerçek API çağrısı yapmalı
   - Test sonuçları kaydedilmeli
   - Health status güncellenmeli

4. **Multi-Provider Desteği:**
   - Priority sırasına göre provider seçilmeli
   - Aktif provider'lar arasından seçim yapılmalı
   - Fallback mekanizması olmalı

5. **Monitoring:**
   - Error count takip edilmeli
   - Last test time kaydedilmeli
   - Health status güncellenmeli

---

## ✅ BAŞARI KRİTERLERİ

### Minimum Viable Product (MVP)
- [ ] Provider oluşturma çalışıyor
- [ ] Provider listesi gösteriliyor
- [ ] Provider güncelleme çalışıyor
- [ ] API credentials şifreli saklanıyor
- [ ] Aktif/Pasif toggle çalışıyor

### Tam Özellikli Sistem
- [ ] API test fonksiyonu çalışıyor
- [ ] Health check monitoring var
- [ ] Provider istatistikleri gösteriliyor
- [ ] Multi-provider desteği var
- [ ] Error tracking ve logging var

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0  
**Durum:** Geliştirme Aşaması

---

*Bu rapor, mevcut admin panel yapısına göre hazırlanmıştır ve grbt8ap ajansı tarafından implement edilecektir.*

