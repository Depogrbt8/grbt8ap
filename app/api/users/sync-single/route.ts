import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();
    
    if (!user) {
      return NextResponse.json({ error: 'User data is required' }, { status: 400 });
    }

    // Admin panelinde bu kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (existingUser) {
      // Kullanıcı varsa güncelle
      await prisma.user.update({
        where: { email: user.email },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          countryCode: user.countryCode,
          phone: user.phone,
          birthDay: user.birthDay,
          birthMonth: user.birthMonth,
          birthYear: user.birthYear,
          gender: user.gender,
          identityNumber: user.identityNumber,
          isForeigner: user.isForeigner,
          emailVerified: user.emailVerified,
          image: user.image,
          lastLoginAt: user.lastLoginAt,
          status: user.status,
          role: user.role,
          canDelete: user.canDelete,
          updatedAt: new Date()
        }
      });
      
      // Hoş geldiniz tetikleme (güncellemede atlama)
      return NextResponse.json({ success: true, message: 'Kullanıcı güncellendi', action: 'updated' });
    } else {
      // Kullanıcı yoksa oluştur
      await prisma.user.create({
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          countryCode: user.countryCode,
          phone: user.phone,
          birthDay: user.birthDay,
          birthMonth: user.birthMonth,
          birthYear: user.birthYear,
          gender: user.gender,
          identityNumber: user.identityNumber,
          isForeigner: user.isForeigner,
          emailVerified: user.emailVerified,
          image: user.image,
          lastLoginAt: user.lastLoginAt,
          status: user.status,
          role: user.role,
          canDelete: user.canDelete,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
      
      // Hoş geldiniz email tetikle
      try {
        await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || ''}/api/email/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() })
        });
      } catch {}

      return NextResponse.json({ success: true, message: 'Kullanıcı oluşturuldu', action: 'created' });
    }

  } catch (error) {
    console.error('Single user sync error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı senkronizasyonu sırasında hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
