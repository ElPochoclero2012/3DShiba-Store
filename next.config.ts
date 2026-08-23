import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    // Default 1MB: una foto de celular tira 500 en Vercel. El plan Hobby corta en ~4.5MB.
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
}

export default nextConfig
