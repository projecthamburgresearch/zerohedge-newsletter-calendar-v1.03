/** @type {import('next').NextConfig} */
const basePath = process.env.NODE_ENV === 'production' ? '/zerohedge-newsletter-calendar-v1.02' : '';

const nextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

module.exports = nextConfig 