/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV !== "production";

const scriptSrc = isDevelopment
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  : "script-src 'self' 'unsafe-inline';";

const connectSrc = isDevelopment
  ? "connect-src 'self' https: http: ws: wss:;"
  : "connect-src 'self' https:;";

const contentSecurityPolicy = [
  "default-src 'self';",
  "img-src 'self' data: https:;",
  "style-src 'self' 'unsafe-inline';",
  scriptSrc,
  connectSrc,
  "font-src 'self' data:;",
  "frame-ancestors 'none';",
].join(" ");

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;