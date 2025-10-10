import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Bu endpoint sadece environment variable durumunu kontrol eder
    // Gerçek cron job kontrolü Vercel dashboard'dan yapılır
    
    const isEnabled = !!process.env.DATABASE_BACKUP_ENABLED
    
    return NextResponse.json({
      success: true,
      message: isEnabled 
        ? 'Otomatik database yedekleme aktif' 
        : 'Otomatik database yedekleme pasif',
      isActive: isEnabled,
      instructions: {
        step1: 'Vercel dashboard > Environment Variables',
        step2: 'DATABASE_BACKUP_ENABLED=true ekleyin',
        step3: 'Cron Jobs sekmesinden ayarlayın',
        step4: 'Schedule: 0 */2 * * * (Her 2 saatte bir)',
        step5: 'Endpoint: /api/database-backup/cron'
      }
    })

  } catch (error) {
    console.error('❌ Database backup toggle hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
