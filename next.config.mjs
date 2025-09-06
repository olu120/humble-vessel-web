// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.humblevesselfoundationandclinic.org' },
    ],
  },
};
export default nextConfig;
