import { NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const settings = await getRuntimeSettings();
  const p = settings.pricing;

  const plans = [
    {
      code: "basic",
      label: { ro: "Basic", en: "Basic" },
      price: { ro: `${p.basic.amount} EUR / lună`, en: `${p.basic.amount} EUR / month` },
      features: {
        ro: ["Înregistrare mese", "Înregistrare simptome", "Corelații de bază", "Istoric"],
        en: ["Meal logging", "Symptom logging", "Basic correlations", "History"],
      },
    },
    {
      code: "pro",
      label: { ro: "Pro", en: "Pro" },
      price: { ro: `${p.pro.amount} EUR / lună`, en: `${p.pro.amount} EUR / month` },
      highlight: true,
      features: {
        ro: ["Tot din Basic", "Analiză AI avansată", "Recomandări personalizate", "Planuri alimentare", "Rapoarte zilnice"],
        en: ["Everything in Basic", "Advanced AI analysis", "Personalized guidance", "Meal plans", "Daily reports"],
      },
    },
    {
      code: "pro_plus",
      label: { ro: "Pro+", en: "Pro+" },
      price: { ro: `${p.pro_plus.amount} EUR / lună`, en: `${p.pro_plus.amount} EUR / month` },
      features: {
        ro: ["Tot din Pro", "Analiză AI extinsă", "Predicții avansate", "Suport prioritar"],
        en: ["Everything in Pro", "Extended AI analysis", "Advanced predictions", "Priority support"],
      },
    },
  ];

  return NextResponse.json({ plans });
}
