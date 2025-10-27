import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { createRateLimit } from '@/lib/rateLimit'
import { prisma } from '@/app/lib/prisma'
import config from '@/app/lib/config'
import { requireAdmin } from '@/lib/authMiddleware'
import { validateFileUpload, sanitizeText } from '@/lib/xssProtection'

// CORS middleware
function corsMiddleware(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', config.cors.allowedOrigins[0])
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return corsMiddleware(response)
}

export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const adminCheck = await requireAdmin(request)
    if (adminCheck) {
      return adminCheck
    }

    // Rate limit
    const rateLimitMiddleware = await createRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 20 })
    const rl = await rateLimitMiddleware(request)
    if ((rl as any)?.status === 429) {
      try {
        await prisma.systemLog.create({
          data: {
            level: 'warn',
            message: 'Rate limit blocked',
            source: 'rate_limit_block',
            metadata: JSON.stringify({ path: '/api/upload', ip: request.headers.get('x-forwarded-for') || 'unknown' })
          }
        })
      } catch {}
      return rl as NextResponse
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return corsMiddleware(NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      ))
    }

    // 🛡️ File Upload Validation - Güvenlik kontrolü
    const fileValidation = validateFileUpload(file)
    if (!fileValidation.isValid) {
      console.log('❌ [SECURITY] File validation hatası:', fileValidation.error)
      return corsMiddleware(NextResponse.json(
        { success: false, error: fileValidation.error },
        { status: 400 }
      ))
    }

    // Dosya boyutu kontrolü (2MB) - Base64 encoding %33 artırır
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return corsMiddleware(NextResponse.json(
        { success: false, error: `Dosya boyutu ${(file.size / 1024 / 1024).toFixed(1)}MB. Maksimum 2MB olmalı.` },
        { status: 413 } // Content Too Large
      ))
    }

    // Dosya tipi kontrolü - Sadece resim dosyaları
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedImageTypes.includes(file.type)) {
      return corsMiddleware(NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları kabul edilir (JPG, PNG, WEBP, GIF)' },
        { status: 400 }
      ))
    }

    // Dosya uzantısı kontrolü
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return corsMiddleware(NextResponse.json(
        { success: false, error: 'Geçersiz dosya uzantısı' },
        { status: 400 }
      ))
    }

    console.log('✅ [SECURITY] File upload validation tamamlandı')

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Dosya adını oluştur
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `campaign_${timestamp}.${extension}`

    // Neon database'de saklamak için base64'e çevir
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Base64 data URL'yi döndür (Neon database'de saklanacak)
    const fileUrl = dataUrl

    return corsMiddleware(NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    }))

  } catch (error) {
    console.error('Upload error:', error)
    return corsMiddleware(NextResponse.json(
      { success: false, error: 'Dosya yükleme hatası' },
      { status: 500 }
    ))
  }
}