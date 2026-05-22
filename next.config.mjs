/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['@vidstack/react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 180, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'archive.org' },
      { protocol: 'https', hostname: '*.archive.org' },
      { protocol: 'https', hostname: 'download.blender.org' },
      { protocol: 'https', hostname: 'studio.blender.org' },
      { protocol: 'https', hostname: 'orange.blender.org' },
      { protocol: 'https', hostname: 'mango.blender.org' },
      { protocol: 'https', hostname: 'durian.blender.org' },
      { protocol: 'https', hostname: 'peach.blender.org' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
