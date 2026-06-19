/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV !== "production";

const scriptSrc = isDevelopment
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;";

const connectSrc = isDevelopment
  ? "connect-src 'self' https: http: ws: wss:;"
  : "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https:;";

const contentSecurityPolicy = [
  "default-src 'self';",
  "img-src 'self' data: https:;",
  "style-src 'self' 'unsafe-inline';",
  scriptSrc,
  connectSrc,
  "font-src 'self' data:;",
  "upgrade-insecure-requests;",
  "block-all-mixed-content;",
  "frame-ancestors 'none';",
].join(" ");

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // Enable instrumentation.ts (stable in Next.js 14.1+, requires explicit opt-in until v15)
    instrumentationHook: true,
    // Keep Node-only packages out of the webpack browser bundle
    serverComponentsExternalPackages: ["postgres", "pdfkit"],
    // Copy pdfkit AFM font data into the standalone build (loaded at runtime via __dirname)
    outputFileTracingIncludes: {
      "**": ["./node_modules/pdfkit/js/data/**/*"],
    },
  },
  webpack(config, { dev, isServer }) {
    if (dev) {
      // Prevent flaky dev cache corruption on Windows that breaks CSS/chunk loading.
      config.cache = false;
    }
    // postgres.js uses native Node.js modules (net, tls, etc.) — must not be bundled
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, net: false, tls: false, fs: false };
    }
    config.externals = [...(config.externals ?? []), "postgres"];
    return config;
  },
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