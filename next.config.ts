import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Uploaded media is served by the /uploads route handler, so next/image
  // only needs to know about the local origin and optional remote CDNs.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  serverExternalPackages: ["sharp", "@prisma/client", "bcryptjs", "nodemailer"],
  // Serverless bundlers (Netlify/Vercel) sometimes miss Prisma's native engine.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/*.node", "./node_modules/.prisma/client/schema.prisma"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
