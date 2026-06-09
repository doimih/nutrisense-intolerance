import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getRuntimeSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/dashboard/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
