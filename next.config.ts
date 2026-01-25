import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the project root to avoid multi-lockfile warning.
    root: path.resolve(__dirname),
  },
  typedRoutes: false,
};

export default nextConfig;
