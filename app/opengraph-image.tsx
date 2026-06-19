import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "NutriAID Intolerances";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadFont(): ArrayBuffer {
  const fontPath = join(
    process.cwd(),
    "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf"
  );
  return readFileSync(fontPath).buffer as ArrayBuffer;
}

export default function Image() {
  const fontData = loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0e7490 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 90px",
          fontFamily: "NotoSans",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              color: "white",
            }}
          >
            🌿
          </div>
          <div style={{ display: "flex", color: "#6ee7b7", fontSize: "22px", fontWeight: 700, letterSpacing: "4px" }}>
            NUTRIAID INTOLERANCES
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize: "60px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "28px",
            maxWidth: "900px",
          }}
        >
          Descopera alimentele care iti provoaca simptome
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            color: "#a7f3d0",
            fontSize: "26px",
            fontWeight: 400,
            maxWidth: "750px",
            lineHeight: 1.5,
          }}
        >
          AI personalizat · Jurnal de mese · Analiza simptome · Planuri alimentare
        </div>

        {/* Tags row */}
        <div style={{ display: "flex", gap: "14px", marginTop: "48px" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Fara diagnostice
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            GDPR conform
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            7 zile gratuit
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NotoSans",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
