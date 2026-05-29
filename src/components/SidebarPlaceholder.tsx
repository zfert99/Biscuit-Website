"use client";

const PARODY_ADS = [
  {
    id: "ad-flash-update",
    color: "var(--color-neon-yellow)",
    glow: "var(--glow-yellow)",
    icon: "⚠",
    title: "FLASH PLAYER UPDATE",
    body: "Your Flash Player is out of date. Click to update now!",
    cta: "UPDATE NOW",
  },
  {
    id: "ad-poptropica",
    color: "var(--color-neon-green)",
    glow: "var(--glow-green)",
    icon: "🏝",
    title: "POPTROPICA™",
    body: "New island unlocked! Login to claim your free credits.",
    cta: "PLAY FREE",
  },
  {
    id: "ad-download",
    color: "var(--color-neon-pink)",
    glow: "var(--glow-pink)",
    icon: "⬇",
    title: "DOWNLOAD ACCELERATOR",
    body: "Speed up your downloads by 300%! Limited time offer.",
    cta: "DOWNLOAD",
  },
];

export default function SidebarPlaceholder() {
  return (
    <aside
      id="portal-sidebar"
      aria-label="Game stats and upgrades panel"
      style={{
        gridArea: "sidebar",
        background: "var(--color-bg-panel)",
        borderLeft: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Score / Bandwidth Meter */}
      <SidebarSection
        id="sidebar-score"
        label="bandwidth_meter.tsx"
        accentColor="var(--color-neon-green)"
        glow="var(--glow-green)"
      >
        <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "22px",
              color: "var(--color-neon-green)",
              textShadow: "var(--glow-green)",
              lineHeight: 1,
              marginBottom: "8px",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            0000
          </div>
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "6px",
              color: "var(--color-text-dim)",
              letterSpacing: "0.12em",
            }}
          >
            BANDWIDTH BYTES
          </div>

          {/* Score bar */}
          <div
            style={{
              marginTop: "12px",
              height: "8px",
              background: "var(--color-border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "0%",
                height: "100%",
                background: "var(--color-neon-green)",
                boxShadow: "var(--glow-green)",
                borderRadius: "2px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "5px",
              color: "var(--color-text-dim)",
              marginTop: "4px",
              letterSpacing: "0.1em",
            }}
          >
            WAVE 1 / ∞
          </div>
        </div>
      </SidebarSection>

      {/* Upgrade Panel */}
      <SidebarSection
        id="sidebar-upgrades"
        label="upgrade_panel.tsx"
        accentColor="var(--color-neon-blue)"
        glow="var(--glow-blue)"
      >
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "6px",
            color: "var(--color-text-secondary)",
            lineHeight: "2",
            letterSpacing: "0.06em",
            marginBottom: "8px",
          }}
        >
          CURSOR SKINS UNLOCKED:
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { name: "DEFAULT PTR", cost: "0 bw", unlocked: true, color: "var(--color-text-primary)" },
            { name: "LASER SIGHT", cost: "500 bw", unlocked: false, color: "var(--color-neon-blue)" },
            { name: "PIXEL WAND",  cost: "1200 bw", unlocked: false, color: "var(--color-neon-pink)" },
            { name: "GOLD CROWN",  cost: "5000 bw", unlocked: false, color: "var(--color-neon-yellow)" },
          ].map((skin) => (
            <div
              key={skin.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 8px",
                border: `1px solid ${skin.unlocked ? "var(--color-neon-green)" : "var(--color-border)"}`,
                background: skin.unlocked ? "rgba(0, 255, 135, 0.05)" : "transparent",
                opacity: skin.unlocked ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "6px",
                  color: skin.color,
                  letterSpacing: "0.06em",
                }}
              >
                {skin.unlocked ? "▶ " : "🔒 "}
                {skin.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: skin.unlocked ? "var(--color-neon-green)" : "var(--color-text-dim)",
                }}
              >
                {skin.cost}
              </span>
            </div>
          ))}
        </div>
      </SidebarSection>

      {/* Parody Flash Ads */}
      <SidebarSection
        id="sidebar-ads"
        label="parody_ads.tsx"
        accentColor="var(--color-neon-pink)"
        glow="var(--glow-pink)"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PARODY_ADS.map((ad) => (
            <ParodyAd key={ad.id} ad={ad} />
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

/* --- Sub-components --- */

function SidebarSection({
  id,
  label,
  accentColor,
  glow,
  children,
}: {
  id: string;
  label: string;
  accentColor: string;
  glow: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border)",
        position: "relative",
      }}
    >
      <div
        className="section-label"
        style={{ color: accentColor, borderLeftColor: accentColor, marginBottom: "10px" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ParodyAd({
  ad,
}: {
  ad: (typeof PARODY_ADS)[number];
}) {
  return (
    <div
      id={ad.id}
      style={{
        border: `1px solid ${ad.color}`,
        boxShadow: `inset 0 0 8px ${ad.color}22, ${ad.glow}`,
        padding: "10px",
        background: `${ad.color}0a`,
        position: "relative",
        animation: "fade-up 0.4s ease both",
        cursor: "pointer",
      }}
    >
      {/* Close button — will spawn spam waves in Sprint 7 */}
      <button
        aria-label={`Close ${ad.title} ad`}
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "none",
          border: "none",
          color: ad.color,
          fontFamily: "var(--font-pixel)",
          fontSize: "8px",
          cursor: "pointer",
          lineHeight: 1,
          padding: "2px",
        }}
      >
        ✕
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{ad.icon}</span>
        <div>
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "6px",
              color: ad.color,
              letterSpacing: "0.08em",
              marginBottom: "4px",
              textShadow: ad.glow,
            }}
          >
            {ad.title}
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--color-text-secondary)",
              lineHeight: "1.5",
              marginBottom: "6px",
            }}
          >
            {ad.body}
          </p>
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "6px",
              color: "var(--color-bg-deep)",
              background: ad.color,
              display: "inline-block",
              padding: "3px 8px",
              letterSpacing: "0.06em",
            }}
          >
            {ad.cta} &gt;&gt;
          </div>
        </div>
      </div>
    </div>
  );
}
