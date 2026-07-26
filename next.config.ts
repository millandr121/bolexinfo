import type { NextConfig } from "next";

/**
 * Static-first configuration targeting Cloudflare Pages.
 * Every route is statically generated; there is no server runtime
 * requirement, which keeps the archive rebuildable decades from now.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: {
    // Static export: images are pre-optimized by the pipeline (WebP + original
    // preserved). Cloudflare Images/Polish handles delivery-time optimization.
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
