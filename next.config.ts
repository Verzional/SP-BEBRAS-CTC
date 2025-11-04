import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": [
      "./src/generated/client/libquery_engine-debian-openssl-3.0.x.so.node",
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
