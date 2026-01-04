import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app';
    
    // Ana sitedeki endpoint'e yönlendir
    const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${params.name}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch provider' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in admin panel hotel provider detail proxy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app';
    const body = await request.json();
    
    // Ana sitedeki endpoint'e yönlendir
    const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${params.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update provider' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in admin panel hotel provider update proxy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  // GÜVENLIK: Sadece admin erişimi
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://gurbetbiz.app';
    
    // Ana sitedeki endpoint'e yönlendir
    const response = await fetch(`${mainSiteUrl}/api/hotels/providers/${params.name}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to delete provider' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in admin panel hotel provider delete proxy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

