import type {
  GuidanceRequest,
  GuidanceResult,
  GuidanceHistoryEntry,
} from "@/types/guidance";
import { INTOLERANCE_LABELS } from "@/types/profile";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_GUIDANCE_DATA: Record<
  string,
  { recommended: string[]; avoid: string[] }
> = {
  lactoza: {
    recommended: [
      "Lapte vegetal (migdale, ovăz, soia, cocos)",
      "Brânzeturi maturate (cantitate mică)",
      "Iaurt fără lactoză",
      "Fructe proaspete",
      "Legume",
      "Carne slabă",
      "Pește",
      "Ouă",
      "Leguminoase",
    ],
    avoid: [
      "Lapte de vacă, oaie, capră",
      "Smântână și frișcă",
      "Înghețată convențională",
      "Brânzeturi moi proaspete",
      "Unt în cantități mari",
    ],
  },
  gluten: {
    recommended: [
      "Orez alb și brun",
      "Quinoa",
      "Porumb și mămăligă",
      "Cartofi",
      "Paste fără gluten",
      "Pâine fără gluten (certificată)",
      "Hrișcă",
      "Mei",
      "Tapioca",
    ],
    avoid: [
      "Grâu (pâine, paste convenționale)",
      "Orz și secară",
      "Ovăz neatentat (contaminare încrucișată)",
      "Bere convențională",
      "Sosuri cu amidon de grâu",
    ],
  },
  nuci: {
    recommended: [
      "Semințe de floarea soarelui",
      "Semințe de dovleac",
      "Semințe de susan",
      "Fructe proaspete",
      "Legume variate",
    ],
    avoid: [
      "Migdale, caju, nuci, alune",
      "Unt de arahide și alte paste din nuci",
      "Produse de patiserie cu nuci",
      "Granola cu nuci",
    ],
  },
  histamina: {
    recommended: [
      "Carne proaspătă (nu procesată)",
      "Pește proaspăt (nu conservat)",
      "Ouă (albuș cu moderație)",
      "Cereale: orez, porumb, mei",
      "Legume: morcovi, broccoli, cartofi dulci",
      "Fructe cu histamină redusă: mere, pere, struguri",
    ],
    avoid: [
      "Brânzeturi maturate",
      "Vin roșu și bere",
      "Roșii, spanac, vinete",
      "Ciocolată și cacao",
      "Alimente fermentate (varză murată, miso)",
      "Conserve de pește",
    ],
  },
  fodmap: {
    recommended: [
      "Legume: morcovi, castraveți, salată verde, dovlecei",
      "Fructe: banane, căpșuni, portocale, kiwi",
      "Carne și pește",
      "Ouă",
      "Lactate fără lactoză",
      "Orez, quinoa, ovăz (porțio mică)",
    ],
    avoid: [
      "Ceapă și usturoi",
      "Fasole, linte, năut",
      "Mere, pere, mango",
      "Lactate cu lactoză",
      "Grâu în cantități mari",
      "Ciuperci",
    ],
  },
};

function buildGuidance(req: GuidanceRequest): GuidanceResult {
  const recommended = new Set<string>();
  const avoid = new Set<string>();

  req.intolerances.forEach((intol) => {
    const data = MOCK_GUIDANCE_DATA[intol];
    if (data) {
      data.recommended.forEach((f) => recommended.add(f));
      data.avoid.forEach((f) => avoid.add(f));
    }
  });

  // Default foods if no specific intolerance selected
  if (req.intolerances.length === 0) {
    ["Legume variate", "Fructe proaspete", "Cereale integrale", "Proteine slabe"].forEach(
      (f) => recommended.add(f)
    );
  }

  const mealExamples = [
    {
      name: "Mic dejun echilibrat",
      ingredients: [
        req.intolerances.includes("lactoza")
          ? "Porridge cu lapte de ovăz"
          : "Iaurt cu fructe de pădure",
        "Fructe proaspete de sezon",
        "Semințe de chia sau in",
      ],
      notes: "Bogat în fibre, potrivit pentru dimineți active.",
    },
    {
      name: "Prânz nutritiv",
      ingredients: [
        req.intolerances.includes("gluten") ? "Orez brun cu legume" : "Paste integrale",
        "Piept de pui sau tofu la grătar",
        "Salată verde cu dressing de lămâie",
      ],
      notes: "Echilibrat în macronutrienți, ușor de preparat.",
    },
    {
      name: "Cină ușoară",
      ingredients: [
        "Supă cremă de legume (fără ingrediente alergene)",
        "Pâine fără gluten sau biscuiți din orez",
        "O porție mică de proteină slabă",
      ],
      notes: "Ușor de digerat, ideal înainte de somn.",
    },
  ];

  const tips =
    req.detailLevel === "basic"
      ? [
          "Citește întotdeauna etichetele produselor alimentare.",
          "Introduce alimentele noi treptat pentru a observa reacțiile.",
        ]
      : req.detailLevel === "detailed"
      ? [
          "Citește întotdeauna etichetele, inclusiv mențiunile de tip 'poate conține urme de...'.",
          "Introduce alimentele noi câte unul pe rând, la 3–4 zile distanță.",
          "Ține un jurnal alimentar pentru a corela simptomele cu alimentele.",
          "Consultă un nutriționist pentru un plan personalizat.",
        ]
      : [
          "Citește etichetele produselor, inclusiv ingredientele ascunse.",
          "Introduce alimentele noi câte unul, la 3–4 zile distanță.",
          "Ține un jurnal alimentar detaliat, notând orele meselor și simptomele.",
          "Consultă un nutriționist sau alergolog pentru evaluare profesionistă.",
          "Atenție la contaminarea încrucișată la prepararea mâncării.",
          "Hidratarea adecvată (1.5–2L apă/zi) ajută digestia.",
          "Gătitul la domiciliu reduce riscul expunerii la alergeni ascunși.",
        ];

  return {
    id: `guidance_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    intolerances: req.intolerances,
    dietaryPreference: req.dietaryPreference,
    recommendedFoods: Array.from(recommended),
    avoidFoods: Array.from(avoid),
    mealExamples,
    generalTips: tips,
    disclaimer:
      "Aceste recomandări au caracter informativ general și nu constituie sfaturi medicale. Consultați un medic sau nutriționist înainte de a face modificări semnificative în alimentație.",
  };
}

export async function generateGuidance(
  req: GuidanceRequest
): Promise<GuidanceResult> {
  await delay(1200);

  const result = buildGuidance(req);

  // Store in history
  if (typeof window !== "undefined") {
    const history: GuidanceHistoryEntry[] = JSON.parse(
      localStorage.getItem("ns_guidance_history") || "[]"
    );
    const entry: GuidanceHistoryEntry = {
      id: result.id,
      generatedAt: result.generatedAt,
      intolerances: result.intolerances,
      dietaryPreference: result.dietaryPreference,
      summary: `Recomandări pentru: ${result.intolerances.map((i) => INTOLERANCE_LABELS[i]).join(", ") || "fără restricții specifice"}`,
    };
    history.unshift(entry);
    localStorage.setItem("ns_guidance_history", JSON.stringify(history.slice(0, 20)));
    localStorage.setItem(`ns_guidance_${result.id}`, JSON.stringify(result));
  }

  return result;
}

export async function getHistory(): Promise<GuidanceHistoryEntry[]> {
  await delay(400);

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ns_guidance_history");
    if (stored) return JSON.parse(stored) as GuidanceHistoryEntry[];
  }

  // Return mock history
  return [
    {
      id: "guidance_mock_001",
      generatedAt: "2024-05-28T14:30:00Z",
      intolerances: ["lactoza", "gluten"],
      dietaryPreference: "normal",
      summary: "Recomandări pentru: Lactoză, Gluten",
    },
    {
      id: "guidance_mock_002",
      generatedAt: "2024-05-20T09:15:00Z",
      intolerances: ["histamina"],
      dietaryPreference: "normal",
      summary: "Recomandări pentru: Histamină",
    },
  ];
}

export async function getGuidanceById(
  id: string
): Promise<GuidanceResult | null> {
  await delay(300);

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`ns_guidance_${id}`);
    if (stored) return JSON.parse(stored) as GuidanceResult;
  }

  return null;
}
