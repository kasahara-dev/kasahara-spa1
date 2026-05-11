import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 今回追加する設定
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://localhost/api/:path*",
      },
    ];
  },
};

export default nextConfig;
