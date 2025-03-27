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
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "spydr-user-content.s3.**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "spydr-user-content-prod.s3.**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.duckduckgo.com",
        pathname: "/**",
      }
    ],
  },
  devIndicators: false,
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : "https://vercel.spydr.dev/:path*",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "https://vercel.spydr.dev/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "https://vercel.spydr.dev/openapi.json",
      },
    ];
  },
};

export default nextConfig;
