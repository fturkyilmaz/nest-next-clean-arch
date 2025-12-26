import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Enable transpilation of monorepo packages
  transpilePackages: ["@diet/ui", "@domain", "@application"],
  // Experimental features for better monorepo support
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
 images: { remotePatterns: [ { protocol: "https", hostname: "avatars.githubusercontent.com", port: "", pathname: "/**",  }, ], },
};
  
export default nextConfig;
