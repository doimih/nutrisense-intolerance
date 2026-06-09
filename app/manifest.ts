import type { MetadataRoute } from "next";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { pwa } = await getRuntimeSettings();

  return {
    name: pwa.appName || "NutriAID",
    short_name: pwa.appShortName || "NutriAID",
    description:
      "Monitorizează intoleranțele alimentare, jurnalul de simptome și recomandările generale.",
    start_url: "/",
    display: "standalone",
    background_color: pwa.backgroundColor || "#f8faf8",
    theme_color: pwa.themeColor || "#16a34a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    lang: "ro",
  };
}
