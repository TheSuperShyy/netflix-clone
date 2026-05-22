/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
