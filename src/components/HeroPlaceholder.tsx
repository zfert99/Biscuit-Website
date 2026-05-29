"use client";

export default function HeroPlaceholder() {
  return (
    <section
      id="hero-zone"
      aria-label="Hero game canvas area"
      style={{
        gridArea: "hero",
        background: "var(--color-bg-deep)",
        position: "relative",
        minHeight: "480px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 207, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 207, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "fade-up 0.6s ease both",
        }}
      />

      {/* Corner decorations */}
      <CornerBracket position="top-left" />
      <CornerBracket position="top-right" />
      <CornerBracket position="bottom-left" />
      <CornerBracket position="bottom-right" />

      {/* Center wireframe content */}
      <div
        className="wireframe-box"
        style={{
          padding: "40px 48px",
          textAlign: "center",
          maxWidth: "520px",
          width: "90%",
          animation: "fade-up 0.5s ease 0.2s both",
        }}
      >
        <div
          className="corner-tag"
          style={{ top: "8px", left: "12px", fontSize: "7px" }}
        >
          hero_canvas.tsx
        </div>

        {/* Blinking cursor icon */}
        <div
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "28px",
            marginBottom: "20px",
            animation: "blink-cursor 1s step-end infinite",
            color: "var(--color-neon-green)",
            textShadow: "var(--glow-green)",
          }}
        >
          ✛
        </div>

        <h1
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "9px",
            lineHeight: "1.8",
            color: "var(--color-neon-green)",
            textShadow: "var(--glow-green)",
            letterSpacing: "0.08em",
            marginBottom: "16px",
          }}
        >
          HERO CANVAS ENGINE
        </h1>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            lineHeight: "1.7",
            marginBottom: "20px",
          }}
        >
          [ Tower Defense Arena — Sprint 3 ]
          <br />
          React Three Fiber + Rapier Physics
          <br />
          WebGL Canvas mounts here
        </p>

        {/* Fake loading bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "var(--color-border)",
            borderRadius: "2px",
            overflow: "hidden",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              width: "32%",
              height: "100%",
              background: "var(--color-neon-green)",
              boxShadow: "var(--glow-green)",
              borderRadius: "2px",
            }}
          />
        </div>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "6px",
            color: "var(--color-text-dim)",
            marginTop: "6px",
            letterSpacing: "0.1em",
          }}
        >
          LOADING... 32%
        </p>
      </div>

      {/* Floating coordinate labels (decorative) */}
      <CoordLabel label="0, 0" position={{ top: "12px", left: "12px" }} />
      <CoordLabel label="MAX, 0" position={{ top: "12px", right: "12px" }} />
      <CoordLabel label="0, MAX" position={{ bottom: "12px", left: "12px" }} />
    </section>
  );
}

/* --- Sub-components --- */

function CornerBracket({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const styles: Record<string, React.CSSProperties> = {
    "top-left":     { top: 0,    left: 0,  borderTop: "2px solid var(--color-neon-blue)", borderLeft: "2px solid var(--color-neon-blue)" },
    "top-right":    { top: 0,    right: 0, borderTop: "2px solid var(--color-neon-blue)", borderRight: "2px solid var(--color-neon-blue)" },
    "bottom-left":  { bottom: 0, left: 0,  borderBottom: "2px solid var(--color-neon-blue)", borderLeft: "2px solid var(--color-neon-blue)" },
    "bottom-right": { bottom: 0, right: 0, borderBottom: "2px solid var(--color-neon-blue)", borderRight: "2px solid var(--color-neon-blue)" },
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: "24px",
        height: "24px",
        ...styles[position],
        boxShadow: "var(--glow-blue)",
      }}
    />
  );
}

function CoordLabel({
  label,
  position,
}: {
  label: string;
  position: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        fontFamily: "var(--font-pixel)",
        fontSize: "5px",
        color: "var(--color-text-dim)",
        letterSpacing: "0.05em",
        ...position,
      }}
    >
      ({label})
    </span>
  );
}
