import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash, createHmac } from 'crypto'

interface PaymentSecurityConfig {
  maxAmount: number
  minAmount: number
  allowedCurrencies: string[]
  sessionTimeout: number // ms
  maxRetries: number
  encryptionKey: string
}

const defaultConfig: PaymentSecurityConfig = {
  maxAmount: 10000, // 10,000 birim
  minAmount: 1, // 1 birim
  allowedCurrencies: ['EUR', 'USD', 'TRY'],
  sessionTimeout: 30 * 60 * 1000, // 30 dakika
  maxRetries: 3,
  encryptionKey: process.env.PAYMENT_ENCRYPTION_KEY || 'default-key-change-in-production'
}

// Ödeme session'ları için store
const paymentSessions = new Map<string, {
  amount: number
  currency: string
  expires: number
  attempts: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
}>()

// Kart bilgilerini tokenize et (gerçek uygulamada PCI DSS uyumlu servis kullanılmalı)
export function tokenizeCardData(cardData: {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderName: string
}): string {
  // Kart numarasını mask'le
  const maskedNumber = cardData.number.replace(/\d(?=\d{4})/g, '*')
  
  // Token oluştur
  const tokenData = {
    maskedNumber,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    holderName: cardData.holderName,
    timestamp: Date.now()
  }
  
  const token = createHash('sha256')
    .update(JSON.stringify(tokenData) + defaultConfig.encryptionKey)
    .digest('hex')
  
  return token
}

// Ödeme session'ı oluştur
export function createPaymentSession(amount: number, currency: string): string {
  const sessionId = randomBytes(32).toString('hex')
  const expires = Date.now() + defaultConfig.sessionTimeout
  
  paymentSessions.set(sessionId, {
    amount,
    currency,
    expires,
    attempts: 0,
    status: 'pending'
  })
  
  return sessionId
}

// Ödeme session'ını doğrula
export function validatePaymentSession(sessionId: string): {
  isValid: boolean
  session?: any
  error?: string
} {
  const session = paymentSessions.get(sessionId)
  
  if (!session) {
    return { isValid: false, error: 'Invalid payment session' }
  }
  
  if (session.expires < Date.now()) {
    paymentSessions.delete(sessionId)
    return { isValid: false, error: 'Payment session expired' }
  }
  
  if (session.status !== 'pending') {
    return { isValid: false, error: 'Payment session already processed' }
  }
  
  return { isValid: true, session }
}

// Ödeme tutarını doğrula
export function validatePaymentAmount(amount: number, currency: string): {
  isValid: boolean
  error?: string
} {
  if (amount < defaultConfig.minAmount) {
    return { isValid: false, error: `Minimum amount is ${defaultConfig.minAmount}` }
  }
  
  if (amount > defaultConfig.maxAmount) {
    return { isValid: false, error: `Maximum amount is ${defaultConfig.maxAmount}` }
  }
  
  if (!defaultConfig.allowedCurrencies.includes(currency)) {
    return { isValid: false, error: `Currency ${currency} not supported` }
  }
  
  return { isValid: true }
}

// Kart numarasını doğrula (Luhn algoritması)
export function validateCardNumber(cardNumber: string): boolean {
  // Sadece rakamları al
  const digits = cardNumber.replace(/\D/g, '')
  
  if (digits.length < 13 || digits.length > 19) {
    return false
  }
  
  // Luhn algoritması
  let sum = 0
  let isEven = false
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// CVV doğrula
export function validateCVV(cvv: string, cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  
  // Visa, MasterCard, Discover: 3 haneli CVV
  if (['4', '5', '6'].includes(digits[0])) {
    return /^\d{3}$/.test(cvv)
  }
  
  // American Express: 4 haneli CVV
  if (digits.startsWith('34') || digits.startsWith('37')) {
    return /^\d{4}$/.test(cvv)
  }
  
  return false
}

// Expiry date doğrula
export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  const expiryYear = parseInt(year)
  const expiryMonth = parseInt(month)
  
  if (expiryYear < currentYear) {
    return false
  }
  
  if (expiryYear === currentYear && expiryMonth < currentMonth) {
    return false
  }
  
  if (expiryMonth < 1 || expiryMonth > 12) {
    return false
  }
  
  return true
}

// Ödeme işlemini başlat
export function initiatePayment(sessionId: string, cardToken: string): {
  success: boolean
  transactionId?: string
  error?: string
} {
  const validation = validatePaymentSession(sessionId)
  
  if (!validation.isValid) {
    return { success: false, error: validation.error }
  }
  
  const session = validation.session!
  
  // Deneme sayısını kontrol et
  if (session.attempts >= defaultConfig.maxRetries) {
    session.status = 'failed'
    return { success: false, error: 'Maximum retry attempts exceeded' }
  }
  
  // Deneme sayısını artır
  session.attempts++
  
  // Transaction ID oluştur
  const transactionId = randomBytes(16).toString('hex')
  
  // Gerçek ödeme işlemi burada yapılacak
  // Şimdilik başarılı olarak işaretle
  session.status = 'completed'
  
  return { success: true, transactionId }
}

// Ödeme işlemini iptal et
export function cancelPayment(sessionId: string): boolean {
  const session = paymentSessions.get(sessionId)
  
  if (!session || session.status !== 'pending') {
    return false
  }
  
  session.status = 'cancelled'
  return true
}

// Ödeme güvenlik middleware'i
export function createPaymentSecurityMiddleware(config: Partial<PaymentSecurityConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function paymentSecurityMiddleware(req: NextRequest) {
    // Sadece ödeme endpoint'lerinde çalış
    if (!req.url.includes('/api/payment')) {
      return NextResponse.next()
    }

    try {
      const body = await req.json()
      
      // Session ID kontrolü
      if (body.sessionId) {
        const validation = validatePaymentSession(body.sessionId)
        if (!validation.isValid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          )
        }
      }
      
      // Tutar kontrolü
      if (body.amount && body.currency) {
        const amountValidation = validatePaymentAmount(body.amount, body.currency)
        if (!amountValidation.isValid) {
          return NextResponse.json(
            { error: amountValidation.error },
            { status: 400 }
          )
        }
      }
      
      // Kart bilgileri kontrolü
      if (body.cardData) {
        const { number, cvv, expiryMonth, expiryYear } = body.cardData
        
        if (!validateCardNumber(number)) {
          return NextResponse.json(
            { error: 'Invalid card number' },
            { status: 400 }
          )
        }
        
        if (!validateCVV(cvv, number)) {
          return NextResponse.json(
            { error: 'Invalid CVV' },
            { status: 400 }
          )
        }
        
        if (!validateExpiryDate(expiryMonth, expiryYear)) {
          return NextResponse.json(
            { error: 'Invalid expiry date' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      )
    }
  }
}

// Ödeme logları
export function logPaymentEvent(event: string, data: any): void {
  console.log(`[PAYMENT] ${event}:`, {
    ...data,
    timestamp: new Date().toISOString()
  })
}

// Eski session'ları temizle
export function cleanupExpiredSessions(): void {
  const now = Date.now()
  paymentSessions.forEach((session, sessionId) => {
    if (session.expires < now) {
      paymentSessions.delete(sessionId)
    }
  })
}

// Periyodik temizlik (her 5 dakikada bir çalıştırılmalı)
setInterval(cleanupExpiredSessions, 5 * 60 * 1000)

