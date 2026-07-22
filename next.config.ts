import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: multiple lockfiles exist higher in the tree.
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
