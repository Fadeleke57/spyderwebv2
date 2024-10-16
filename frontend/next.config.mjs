/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // Match all paths under this domain
      },
      {
        protocol: "https",
        hostname: "robohash.org",
        pathname: "/**", // Match all paths under this domain
      },
    ],
  },
};

export default nextConfig;
