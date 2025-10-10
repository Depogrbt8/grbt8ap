import { NextRequest, NextResponse } from 'next/server'
import resendService from '@/app/lib/resend'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, resetToken } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email zorunludur'
      }, { status: 400 })
    }

    const resetLink = `https://anasite.grbt8.store/sifre-sifirla?token=${resetToken || 'sample-token'}`

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Şifre Sıfırlama - Gurbetbiz</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 5px; letter-spacing: -1px; }
        .logo .biz { color: #000000; }
        .content { padding: 40px 30px; background: #ffffff; }
        .button { display: inline-block; background: linear-gradient(135deg, #4ade80, #22c55e); color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 12px; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">gurbet<span class="biz">biz</span></div>
        </div>
        <div class="content">
          <h2>Şifre Sıfırlama Talebi</h2>
          
          <p>Merhaba${name ? ` <strong>${name}</strong>` : ''},</p>
          
          <p>Gurbetbiz hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
          
          <p><strong>Güvenlik Uyarısı:</strong> Bu talebi siz yapmadıysanız, bu emaili görmezden gelin.</p>

          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>

          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Şifremi Sıfırla</a>
          </div>

          <p>Yukarıdaki buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${resetLink}
          </p>

          <p><strong>Önemli Bilgiler:</strong></p>
          <ul>
            <li>Bu link 1 saat süreyle geçerlidir</li>
            <li>Tek kullanımlıktır</li>
            <li>Güvenliğiniz için linki kimseyle paylaşmayın</li>
          </ul>

          <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
          <p>İyi günler dileriz!</p>
        </div>
        <div class="footer">
          <p>© 2024 Gurbetbiz. Tüm hakları saklıdır.</p>
          <p>Bu email otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    </body>
    </html>
    `

    const result = await resendService.sendEmail({
      to: email,
      subject: '🔐 Şifre Sıfırlama Talebi - Gurbetbiz',
      html,
      from: 'Gurbetbiz <noreply@grbt8.store>'
    })

    // Email log kaydet
    try {
      await prisma.emailLog.create({
        data: {
          emailId: result.messageId,
          recipientEmail: email,
          recipientName: name,
          subject: '🔐 Şifre Sıfırlama Talebi - Gurbetbiz',
          templateName: 'Şifre Sıfırlama',
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.error,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    } catch (logError) {
      console.error('Email log kaydedilemedi:', logError)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Şifre sıfırlama emaili ${email} adresine gönderildi`,
        data: {
          messageId: result.messageId,
          recipient: email,
          template: 'password-reset',
          resetLink
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Şifre sıfırlama email hatası:', error)
    return NextResponse.json({
      success: false,
      error: 'Email gönderilirken hata oluştu'
    }, { status: 500 })
  }
}
