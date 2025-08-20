/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],

    domains: [
      process.env.NEXT_PUBLIC_API_URL?.replace(/https?:\/\//, "") ||
        "api3ismarthome.mntfuture.com",
    ],
    unoptimized: true,
  },

  output: "standalone",

  // Enable static file serving through public folder
  useFileSystemPublicRoutes: true,
};

export default nextConfig;
