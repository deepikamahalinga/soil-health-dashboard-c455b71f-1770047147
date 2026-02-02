/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)

  // Static generation settings
  output: 'standalone',
  generateBuildId: async () => {
    // You can set a custom build ID here if needed
    return 'build-' + Date.now()
  },

  // Path aliases
  experimental: {
    appDir: true,
    serverActions: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Image optimization
  images: {
    domains: ['your-image-domain.com'], // Add domains for next/image
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/:path*`, // Proxy to backend
      },
    ]
  },

  // i18n configuration
  i18n: {
    locales: ['en', 'fr', 'de'], // Add your supported locales
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Build optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    
    // Enable styled-components if needed
    styledComponents: false,
    
    // Emotion configuration if needed
    emotion: false,
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add custom webpack configs here if needed
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ]
  },

  // Redirects if needed
  async redirects() {
    return []
  },

  poweredByHeader: false,
}

module.exports = nextConfig