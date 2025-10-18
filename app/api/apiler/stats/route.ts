import { NextRequest, NextResponse } from 'next/server'
import { glob } from 'glob'
import path from 'path'
import fs from 'fs'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  category: string
}

export async function GET(request: NextRequest) {
  try {
    // Gerçek API dosyalarını tara
    const apiDir = path.join(process.cwd(), 'app', 'api')
    const routeFiles = glob.sync('**/route.ts', { 
      cwd: apiDir,
      absolute: true 
    })

    const apis: ApiEndpoint[] = []

    // Her route dosyasını oku ve HTTP metodlarını tespit et
    for (const file of routeFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const relativePath = file.replace(apiDir, '')
      const endpoint = '/api' + relativePath.replace('/route.ts', '').replace(/\\/g, '/')
      
      // Kategoriyi belirle
      const pathParts = endpoint.split('/').filter(p => p)
      const category = pathParts[1] || 'Diğer'

      // HTTP metodlarını tespit et
      const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = []
      if (/export\s+async\s+function\s+GET/m.test(content)) methods.push('GET')
      if (/export\s+async\s+function\s+POST/m.test(content)) methods.push('POST')
      if (/export\s+async\s+function\s+PUT/m.test(content)) methods.push('PUT')
      if (/export\s+async\s+function\s+DELETE/m.test(content)) methods.push('DELETE')
      if (/export\s+async\s+function\s+PATCH/m.test(content)) methods.push('PATCH')

      // Her metod için ayrı entry ekle
      methods.forEach(method => {
        apis.push({
          method,
          endpoint,
          category: category.charAt(0).toUpperCase() + category.slice(1)
        })
      })
    }

    // Endpoint'e göre sırala
    apis.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'tr')
      }
      return a.endpoint.localeCompare(b.endpoint)
    })

    return NextResponse.json({
      success: true,
      data: {
        apis,
        totalApis: apis.length,
        categories: Array.from(new Set(apis.map(a => a.category))).sort((a, b) => a.localeCompare(b, 'tr'))
      }
    })

  } catch (error) {
    console.error('API listesi alınamadı:', error)
    return NextResponse.json({
      success: false,
      error: 'API listesi alınamadı',
      apis: [],
      totalApis: 0,
      categories: []
    })
  }
}
