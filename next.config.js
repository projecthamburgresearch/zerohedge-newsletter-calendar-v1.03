/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/zerohedge-newsletter-calendar-v1.02' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 