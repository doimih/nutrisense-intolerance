import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getRuntimeSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/dashboard/", "/superadmin/", "/backend/"],
      },
      // Allow AI search & citation bots to index public content (GEO)
      { userAgent: "GPTBot",          allow: "/" },
      { userAgent: "ChatGPT-User",    allow: "/" },
      { userAgent: "anthropic-ai",    allow: "/" },
      { userAgent: "Claude-Web",      allow: "/" },
      { userAgent: "PerplexityBot",   allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Gemini-Web",      allow: "/" },
      { userAgent: "cohere-ai",       allow: "/" },
      { userAgent: "CCBot",           allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
