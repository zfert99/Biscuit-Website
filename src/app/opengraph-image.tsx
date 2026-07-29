import { ImageResponse } from "next/og";

export const alt = "Biscuit Lab — a lab for small, finished things";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand-colour OG card. Uses the default font (loading the display face would
// mean bundling font data); the palette carries the identity.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#5A3E96",
          color: "#FBF3E3",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 36,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#F2B65A",
          }}
        >
          Biscuit Lab
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
          A lab for small, finished things.
        </div>
      </div>
    ),
    { ...size },
  );
}
