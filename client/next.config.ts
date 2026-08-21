import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', 
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Outputs a Single-Page Application (SPA)
  // Optionally, you can change the output directory from 'out' to 'dist' or 'build'
  // distDir: 'dist', 
};

export default nextConfig;
