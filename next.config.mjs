/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rightful-parakeet-354.convex.cloud',
        port: '', // leave empty for default
        pathname: '/api/storage/**', // allows access to all images under /api/storage
      },
    ],
  },
};

export default nextConfig;

