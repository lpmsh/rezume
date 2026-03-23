import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },
  webpack: (config) => {
    // react-pdf needs canvas excluded in the browser bundle
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
