"use client";

import { useState } from "react";

type FooterBtn = {
  id: string;
  icon: string;
  label: string;
  shortcut: string;
  color: string;
  glow: string;
  activeLabel?: string;
};

const FOOTER_BUTTONS: FooterBtn[] = [
  {
    id: "btn-mute",
    icon: "🔇",
    label: "Mute",
    shortcut: "M",
    color: "var(--color-neon-blue)",
    glow: "var(--glow-blue)",
    activeLabel: "Unmute",
  },
  {
    id: "btn-reset",
    icon: "🔄",
    label: "Reset",
    shortcut: "R",
    color: "var(--color-neon-yellow)",
    glow: "var(--glow-yellow)",
  },
  {
    id: "btn-accessibility",
    icon: "♿",
    label: "Accessibility",
    shortcut: "A",
    color: "var(--color-neon-green)",
    glow: "var(--glow-green)",
    activeLabel: "Low Quality",
  },
];

export default function FooterControls() {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setActiveStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <footer
      id="portal-footer"
      aria-label="Game control deck"
      style={{
        gridArea: "footer",
        position: "sticky",
        bottom: 0,
        zIndex: 40,
        background: "rgba(5, 8, 15, 0.97)",
        borderTop: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: "var(--footer-height)",
        gap: "12px",
      }}
    >
      {/* Left — status readout */}
      <div
        aria-live="polite"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "5px",
          color: "var(--color-text-dim)",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "var(--color-neon-green)", textShadow: "var(--glow-green)" }}>
          ● ONLINE
        </span>
        <span>FPS: 60</span>
        <span>ENTITIES: 0</span>
      </div>

      {/* Center — control buttons */}
      <div
        role="toolbar"
        aria-label="Quick controls"
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {FOOTER_BUTTONS.map((btn) => {
          const isActive = activeStates[btn.id] ?? false;
          const displayLabel = isActive && btn.activeLabel ? btn.activeLabel : btn.label;

          return (
            <button
              key={btn.id}
              id={btn.id}
              onClick={() => toggle(btn.id)}
              aria-pressed={isActive}
              aria-label={displayLabel}
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "6px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "5px 12px",
                border: `1px solid ${btn.color}`,
                background: isActive ? `${btn.color}22` : "transparent",
                color: btn.color,
                boxShadow: isActive ? btn.glow : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = `${btn.color}22`;
                el.style.boxShadow = btn.glow;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = isActive ? `${btn.color}22` : "transparent";
                el.style.boxShadow = isActive ? btn.glow : "none";
              }}
            >
              <span aria-hidden="true">{btn.icon}</span>
              {displayLabel}
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  opacity: 0.4,
                  marginLeft: "2px",
                }}
              >
                [{btn.shortcut}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Right — version tag */}
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "5px",
          color: "var(--color-text-dim)",
          letterSpacing: "0.1em",
          flexShrink: 0,
        }}
      >
        v0.1.0-sprint1
      </div>
    </footer>
  );
}
