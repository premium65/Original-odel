/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_LOCAL_IMAGE_HOST || "localhost",
      },
      {
        protocol: "https",
        hostname: "api.goib.tech",
      },
      {
        protocol: "https",
        hostname: "api.goibtech.online",
      },
      {
        protocol: "https",
        hostname: "api.goibtech.site",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_IMAGE_HOST || "api.goibtech.site",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
