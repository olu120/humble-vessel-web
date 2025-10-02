// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow both the CMS host and the root site just in case
    domains: [
      "cms.humblevesselfoundationandclinic.org",
      "humblevesselfoundationandclinic.org",
    ],
    // Future-proof matching + any path under WP uploads
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.humblevesselfoundationandclinic.org",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      // If your ACF ever returns files from the root domain:
      {
        protocol: "https",
        hostname: "humblevesselfoundationandclinic.org",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      // Safety net: allow *any* path on the CMS host
      {
        protocol: "https",
        hostname: "cms.humblevesselfoundationandclinic.org",
        port: "",
        pathname: "/**",
      },
    ],
    // Optional, keeps Next from warning if you set quality on <Image>
    qualities: [60, 70, 80, 90, 100],
    formats: ["image/webp", "image/avif"],
  },
};

console.log("✅ next.config.mjs loaded — images.domains:", nextConfig.images.domains);

export default nextConfig;
