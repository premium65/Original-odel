/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: process.env.NEXT_PUBLIC_LOCAL_IMAGE_HOST,
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
                protocol: 'https',
                hostname: 'api.goibtech.site',
              },
        {
          protocol: "https",
          hostname: process.env.NEXT_PUBLIC_API_IMAGE_HOST,
        },
      ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
     // Enable experimental features if needed (e.g., app directory)
     experimental: {
        appDir: true,
      },
        // Example: Setting up custom redirects
        async redirects() {
            return [
              {
                source: '/',
                destination: '/login',
                permanent: true, // This is a permanent redirect
              },
            ];
          },
};

module.exports = nextConfig;

