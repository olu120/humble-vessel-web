// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.humblevesselfoundationandclinic.org' },
      { protocol: "https", hostname: "images.ctfassets.net" },
    ],
  },
};
export default nextConfig;
