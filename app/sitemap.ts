import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nutriaid-i.eu";

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
