// ============================================================================
// TỆP MÃ NGUỒN: web-store/next.config.ts
// MÔ TẢ: Tệp cấu hình/dữ liệu (next.config.ts) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
