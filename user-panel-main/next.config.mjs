// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC to minify your code
  eslint: {
    ignoreDuringBuilds: true,
},
  // Optionally, add custom configurations here
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
      }
    ],
  },
  // Enable experimental features if needed (e.g., app directory)
  experimental: {
    appDir: true,
  },

  // Example: Adding environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // Available on the client and server
  },
};

export default nextConfig;
