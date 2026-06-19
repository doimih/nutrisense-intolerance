import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = await getRuntimeSettings();

  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly"; lastModified: Date }> = [
    { path: "",            priority: 1.0, changeFrequency: "daily",  lastModified: new Date("2025-06-17") },
    { path: "/pricing",    priority: 0.9, changeFrequency: "weekly", lastModified: new Date("2025-06-10") },
    { path: "/why-ai",     priority: 0.9, changeFrequency: "weekly", lastModified: new Date("2025-05-20") },
    { path: "/trust",      priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-05-20") },
    { path: "/about",      priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-05-20") },
    { path: "/faq",        priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/contact",    priority: 0.7, changeFrequency: "weekly", lastModified: new Date("2025-04-01") },
    { path: "/daily-plan", priority: 0.6, changeFrequency: "weekly", lastModified: new Date("2025-04-01") },
    { path: "/knowledge-hub",                             priority: 0.9, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/ce-este-nutriaid",            priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/cum-functioneaza-ai",         priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/analiza-meselor",             priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/analiza-simptomelor",         priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/plan-alimentar-ai",           priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/siguranta-alimentara",        priority: 0.8, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/pdf-uri-generate",            priority: 0.7, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/knowledge-hub/gdpr-confidentialitate",      priority: 0.7, changeFrequency: "weekly", lastModified: new Date("2025-06-01") },
    { path: "/legal/terms",               priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/privacy-policy",      priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/cookies-policy",      priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/data-retention",      priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/security-policy",     priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/medical-disclaimer",  priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
    { path: "/legal/account-deletion",    priority: 0.4, changeFrequency: "weekly", lastModified: new Date("2025-03-01") },
  ];

  return routes.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
