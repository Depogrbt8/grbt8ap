/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*'
      }
    ]
  }
}

module.exports = nextConfig 