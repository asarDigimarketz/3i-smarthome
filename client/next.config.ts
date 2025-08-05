// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   devIndicators: false,
//   // images: {
//   //   // domains: process.env.NEXT_PUBLIC_API_URL
//   //   //   ? [process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, "")]
//   //   //   : ["localhost:3000"],
//   // },
//   domains: ["localhost", "127.0.0.1"],
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["localhost", "127.0.0.1"],
  },
};

export default nextConfig;
