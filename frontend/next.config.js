/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io'],
    unoptimized: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  // Optimize for production
  compress: true,
}

module.exports = nextConfig