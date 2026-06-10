import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = await getRuntimeSettings();

  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" }> = [
    { path: "",            priority: 1.0, changeFrequency: "daily" },
    { path: "/pricing",    priority: 0.9, changeFrequency: "weekly" },
    { path: "/why-ai",     priority: 0.9, changeFrequency: "weekly" },
    { path: "/trust",      priority: 0.8, changeFrequency: "weekly" },
    { path: "/about",      priority: 0.8, changeFrequency: "weekly" },
    { path: "/faq",        priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact",    priority: 0.7, changeFrequency: "weekly" },
    { path: "/daily-plan", priority: 0.6, changeFrequency: "weekly" },
    { path: "/knowledge-hub",                             priority: 0.9, changeFrequency: "weekly" },
    { path: "/knowledge-hub/ce-este-nutriaid",            priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/cum-functioneaza-ai",         priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/analiza-meselor",             priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/analiza-simptomelor",         priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/plan-alimentar-ai",           priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/siguranta-alimentara",        priority: 0.8, changeFrequency: "weekly" },
    { path: "/knowledge-hub/pdf-uri-generate",            priority: 0.7, changeFrequency: "weekly" },
    { path: "/knowledge-hub/gdpr-confidentialitate",      priority: 0.7, changeFrequency: "weekly" },
    { path: "/legal/terms",               priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/privacy-policy",      priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/cookies-policy",      priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/data-retention",      priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/security-policy",     priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/medical-disclaimer",  priority: 0.4, changeFrequency: "weekly" },
    { path: "/legal/account-deletion",    priority: 0.4, changeFrequency: "weekly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
