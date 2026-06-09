import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = await getRuntimeSettings();

  const routes = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/legal/terms",
    "/legal/privacy-policy",
    "/legal/cookies-policy",
    "/legal/data-retention",
    "/legal/security-policy",
    "/legal/medical-disclaimer",
    "/legal/account-deletion",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
