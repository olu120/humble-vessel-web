import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.humblevesselfoundationandclinic.org' },
    ],
  },
};

export default nextConfig;
