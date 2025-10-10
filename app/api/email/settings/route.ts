import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    // Veritabanından email ayarlarını çek
    let settings = await prisma.emailSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Eğer ayar yoksa, varsayılan ayarları oluştur
    if (!settings) {
      console.log('Email ayarları bulunamadı, varsayılan ayarlar oluşturuluyor...')
      
      settings = await prisma.emailSettings.create({
        data: {
          smtpHost: 'smtp.resend.com',
          smtpPort: 465,
          smtpUser: 'resend',
          smtpPassword: process.env.RESEND_API_KEY || '',
          fromEmail: 'noreply@grbt8.store',
          fromName: 'Gurbetbiz',
          dailyLimit: 1000,
          rateLimit: 100,
          isActive: true
        }
      })
    }

    // Şifreyi gizle
    const safeSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '••••••••' : ''
    }

    return NextResponse.json({
      success: true,
      data: safeSettings
    })

  } catch (error: any) {
    console.error('Email ayarları hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Ayarlar alınamadı'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName, dailyLimit, rateLimit } = body

    // Validation
    if (!smtpHost || !smtpPort || !smtpUser || !fromEmail) {
      return NextResponse.json({
        success: false,
        error: 'SMTP Host, Port, User ve From Email zorunludur'
      }, { status: 400 })
    }

    // Mevcut ayarları kontrol et
    const existingSettings = await prisma.emailSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    let savedSettings

    if (existingSettings) {
      // Mevcut ayarları güncelle
      savedSettings = await prisma.emailSettings.update({
        where: {
          id: existingSettings.id
        },
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          // Eğer password değiştirilmişse güncelle (••••••••  değilse)
          ...(smtpPassword && smtpPassword !== '••••••••' && { smtpPassword }),
          fromEmail,
          fromName: fromName || 'Gurbetbiz',
          dailyLimit: parseInt(dailyLimit) || 1000,
          rateLimit: parseInt(rateLimit) || 100,
          isActive: true
        }
      })
    } else {
      // Yeni ayarlar oluştur
      savedSettings = await prisma.emailSettings.create({
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPassword: smtpPassword || '',
          fromEmail,
          fromName: fromName || 'Gurbetbiz',
          dailyLimit: parseInt(dailyLimit) || 1000,
          rateLimit: parseInt(rateLimit) || 100,
          isActive: true
        }
      })
    }

    // Şifreyi gizle
    const safeSettings = {
      ...savedSettings,
      smtpPassword: '••••••••'
    }

    return NextResponse.json({
      success: true,
      message: 'Email ayarları başarıyla kaydedildi',
      data: safeSettings
    })

  } catch (error: any) {
    console.error('Email ayarları kaydetme hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Ayarlar kaydedilemedi: ' + error.message
    }, { status: 500 })
  }
}