import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["localhost", "127.0.0.1"],
  },
};

export default nextConfig;
