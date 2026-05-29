"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Portfolio", href: "#matrix" },
  { label: "About Me", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      id="portal-header"
      style={{
        gridArea: "header",
        background: "rgba(5, 8, 15, 0.96)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        height: "var(--nav-height)",
      }}
    >
      {/* Brand Logo */}
      <Link
        href="/"
        id="nav-brand"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "10px",
          color: "var(--color-neon-green)",
          textShadow: "var(--glow-green)",
          textDecoration: "none",
          letterSpacing: "0.05em",
          animation: "flicker 8s infinite",
          whiteSpace: "nowrap",
        }}
      >
        &gt;_ BiscuittArcade
      </Link>

      {/* Desktop Nav */}
      <NavigationMenu.Root
        id="main-navigation"
        style={{ display: "flex", alignItems: "center", gap: "0" }}
        aria-label="Main navigation"
      >
        <NavigationMenu.List
          style={{
            display: "flex",
            listStyle: "none",
            gap: "4px",
            alignItems: "center",
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavigationMenu.Item key={link.href}>
              <NavigationMenu.Link asChild>
                <Link
                  href={link.href}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    fontFamily: "var(--font-pixel)",
                    fontSize: "7px",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    border: "1px solid transparent",
                    transition: "all 0.15s ease",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.color = "var(--color-neon-blue)";
                    el.style.borderColor = "var(--color-neon-blue)";
                    el.style.boxShadow = "var(--glow-blue)";
                    el.style.background = "rgba(0, 207, 255, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.color = "var(--color-text-secondary)";
                    el.style.borderColor = "transparent";
                    el.style.boxShadow = "none";
                    el.style.background = "transparent";
                  }}
                >
                  {link.label}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}

          {/* Resume Link — distinct CTA */}
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <a
                href="/zack_fertig_resume.pdf"
                id="nav-link-resume"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "7px",
                  color: "var(--color-neon-pink)",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  border: "1px solid var(--color-neon-pink)",
                  boxShadow: "var(--glow-pink)",
                  marginLeft: "8px",
                  transition: "all 0.15s ease",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255, 45, 120, 0.15)";
                  el.style.boxShadow = "0 0 16px #ff2d78, 0 0 40px #ff2d7866";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "transparent";
                  el.style.boxShadow = "var(--glow-pink)";
                }}
              >
                ▶ Resume.pdf
              </a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport />
      </NavigationMenu.Root>

      {/* Mobile hamburger (visible on small screens) */}
      <button
        id="nav-mobile-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        style={{
          display: "none",
          background: "none",
          border: "1px solid var(--color-neon-green)",
          color: "var(--color-neon-green)",
          padding: "4px 8px",
          fontFamily: "var(--font-pixel)",
          fontSize: "8px",
          cursor: "pointer",
        }}
        className="mobile-hamburger"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <style>{`
        @media (max-width: 768px) {
          #main-navigation { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
