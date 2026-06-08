import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriAID Intolerances",
    short_name: "NutriAID",
    description:
      "Monitorizează intoleranțele alimentare, jurnalul de simptome și recomandările generale.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
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
