import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the warning
  // PDF.js works fine without the webpack canvas/encoding aliases in Turbopack
  turbopack: {},
};

export default nextConfig;
