import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { backupData } = body

    if (!backupData || !backupData.tables) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz yedek veri formatı'
      })
    }

    console.log('🔄 Database restore başlatılıyor...')
    let restoredTables = 0
    let restoredRecords = 0

    // Önce mevcut verileri temizle (dikkatli!)
    console.log('🗑️ Mevcut veriler temizleniyor...')
    
    // Tablolar arası bağımlılıklar nedeniyle sıralı silme
    await prisma.surveyResponse.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.systemLog.deleteMany()
    await prisma.emailLog.deleteMany()
    await prisma.emailQueue.deleteMany()
    await prisma.emailTemplate.deleteMany()
    await prisma.emailSettings.deleteMany()
    await prisma.priceAlert.deleteMany()
    await prisma.searchFavorite.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.passenger.deleteMany()
    await prisma.reservation.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.systemSettings.deleteMany()
    
    console.log('✅ Mevcut veriler temizlendi')

    // Yedek verilerini geri yükle
    const tables = backupData.tables

    // User tablosunu geri yükle
    if (tables.User && Array.isArray(tables.User)) {
      for (const userData of tables.User) {
        await prisma.user.create({
          data: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            countryCode: userData.countryCode,
            phone: userData.phone,
            birthDay: userData.birthDay,
            birthMonth: userData.birthMonth,
            birthYear: userData.birthYear,
            gender: userData.gender,
            identityNumber: userData.identityNumber,
            isForeigner: userData.isForeigner || false,
            emailVerified: userData.emailVerified ? new Date(userData.emailVerified) : null,
            image: userData.image,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
            lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : null,
            status: userData.status || 'active',
            role: userData.role || 'user',
            canDelete: userData.canDelete !== false
          }
        })
        restoredRecords++
      }
      restoredTables++
      console.log(`✅ User tablosu geri yüklendi: ${tables.User.length} kayıt`)
    }

    // Campaign tablosunu geri yükle
    if (tables.Campaign && Array.isArray(tables.Campaign)) {
      for (const campaignData of tables.Campaign) {
        await prisma.campaign.create({
          data: {
            id: campaignData.id,
            title: campaignData.title,
            description: campaignData.description,
            imageUrl: campaignData.imageUrl,
            imageData: campaignData.imageData,
            altText: campaignData.altText || '',
            linkUrl: campaignData.linkUrl,
            status: campaignData.status || 'active',
            position: campaignData.position || 0,
            clickCount: campaignData.clickCount || 0,
            viewCount: campaignData.viewCount || 0,
            startDate: campaignData.startDate ? new Date(campaignData.startDate) : null,
            endDate: campaignData.endDate ? new Date(campaignData.endDate) : null,
            createdAt: new Date(campaignData.createdAt),
            updatedAt: new Date(campaignData.updatedAt),
            createdBy: campaignData.createdBy
          }
        })
        restoredRecords++
      }
      restoredTables++
      console.log(`✅ Campaign tablosu geri yüklendi: ${tables.Campaign.length} kayıt`)
    }

    // SystemSettings tablosunu geri yükle
    if (tables.SystemSettings && Array.isArray(tables.SystemSettings)) {
      for (const settingData of tables.SystemSettings) {
        await prisma.systemSettings.create({
          data: {
            id: settingData.id,
            backupEnabled: settingData.backupEnabled || false,
            backupSchedule: settingData.backupSchedule || '0 2 * * *',
            backupRetention: settingData.backupRetention || 7,
            backupDatabase: settingData.backupDatabase !== false,
            backupUploads: settingData.backupUploads !== false,
            backupLogs: settingData.backupLogs !== false,
            createdAt: new Date(settingData.createdAt),
            updatedAt: new Date(settingData.updatedAt)
          }
        })
        restoredRecords++
      }
      restoredTables++
      console.log(`✅ SystemSettings tablosu geri yüklendi: ${tables.SystemSettings.length} kayıt`)
    }

    console.log(`🎉 Database restore tamamlandı: ${restoredTables} tablo, ${restoredRecords} kayıt`)

    return NextResponse.json({
      success: true,
      message: 'Database başarıyla geri yüklendi',
      stats: {
        restoredTables,
        restoredRecords,
        backupDate: backupData.timestamp
      }
    })

  } catch (error) {
    console.error('❌ Database restore hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database geri yükleme başarısız: ' + (error instanceof Error ? error.message : 'Unknown error')
    })
  }
}
