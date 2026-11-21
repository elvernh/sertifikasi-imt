import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // hide the Next.js badge in the corner during development
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // payment proof images can be bigger than the 1 MB default
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
