const bcrypt = require('bcryptjs')

async function checkPassword() {
  console.log('🔐 Şifre Hash Kontrolü')
  console.log('====================')
  
  const testPassword = 'admin123'
  const testHash = await bcrypt.hash(testPassword, 12)
  
  console.log(`Test şifre: ${testPassword}`)
  console.log(`Hash (salt 12): ${testHash}`)
  console.log('')
  
  // Farklı salt değerleri ile test et
  for (let salt = 10; salt <= 15; salt++) {
    const hash = await bcrypt.hash(testPassword, salt)
    console.log(`Salt ${salt}: ${hash}`)
  }
  
  console.log('')
  console.log('🔍 Hash karşılaştırma testi:')
  
  const testHashes = [
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4F.8QzK8a2', // Örnek hash
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4F.8QzK8a2', // Örnek hash
  ]
  
  for (const hash of testHashes) {
    const isValid = await bcrypt.compare(testPassword, hash)
    console.log(`Hash: ${hash.substring(0, 20)}... -> ${isValid ? '✅ Geçerli' : '❌ Geçersiz'}`)
  }
}

checkPassword()