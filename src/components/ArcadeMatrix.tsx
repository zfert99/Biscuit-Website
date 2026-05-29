"use client";

type CardCategory = "TOP RATED" | "NEW RELEASES" | "EXPLORABLES";

interface ArcadeCard {
  id: string;
  title: string;
  category: CardCategory;
  tags: string[];
  rating: number; // out of 5
  href: string;
}

const ARCADE_CARDS: ArcadeCard[] = [
  {
    id: "card-portfolio-1",
    title: "PROJECT_ALPHA",
    category: "TOP RATED",
    tags: ["React", "Node.js", "PostgreSQL"],
    rating: 5,
    href: "#",
  },
  {
    id: "card-portfolio-2",
    title: "PROJECT_BETA",
    category: "TOP RATED",
    tags: ["Next.js", "TypeScript", "AWS"],
    rating: 4,
    href: "#",
  },
  {
    id: "card-new-1",
    title: "PROJECT_GAMMA",
    category: "NEW RELEASES",
    tags: ["WebGL", "Three.js", "GLSL"],
    rating: 5,
    href: "#",
  },
  {
    id: "card-new-2",
    title: "PROJECT_DELTA",
    category: "NEW RELEASES",
    tags: ["Python", "ML", "FastAPI"],
    rating: 4,
    href: "#",
  },
  {
    id: "card-explore-1",
    title: "INTERACTIVE_BUDDY",
    category: "EXPLORABLES",
    tags: ["Physics", "Canvas", "Game"],
    href: "/games/interactive-buddy",
    rating: 5,
  },
  {
    id: "card-explore-2",
    title: "PARTICLE_SANDBOX",
    category: "EXPLORABLES",
    tags: ["WebGL", "Simulation"],
    href: "/games/particle-sandbox",
    rating: 4,
  },
];

const CATEGORY_COLORS: Record<CardCategory, { color: string; glow: string }> = {
  "TOP RATED":    { color: "var(--color-neon-yellow)", glow: "var(--glow-yellow)" },
  "NEW RELEASES": { color: "var(--color-neon-green)",  glow: "var(--glow-green)" },
  "EXPLORABLES":  { color: "var(--color-neon-blue)",   glow: "var(--glow-blue)" },
};

const CATEGORIES: CardCategory[] = ["TOP RATED", "NEW RELEASES", "EXPLORABLES"];

export default function ArcadeMatrix() {
  return (
    <section
      id="arcade-matrix"
      aria-label="Arcade project matrix"
      style={{
        gridArea: "matrix",
        background: "var(--color-bg-deep)",
        borderTop: "1px solid var(--color-border)",
        padding: "32px 24px 48px",
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "12px",
            color: "var(--color-neon-yellow)",
            textShadow: "var(--glow-yellow)",
            letterSpacing: "0.15em",
            marginBottom: "8px",
          }}
        >
          ★ THE ARCADE MATRIX ★
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
          }}
        >
          Select a project to view the full case study
        </p>
      </div>

      {/* Ticker / marquee */}
      <div
        aria-hidden="true"
        style={{
          overflow: "hidden",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "6px 0",
          marginBottom: "36px",
          background: "var(--color-bg-panel)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "80px",
            whiteSpace: "nowrap",
            animation: "marquee 20s linear infinite",
            width: "max-content",
          }}
        >
          {[...Array(2)].map((_, i) =>
            CATEGORIES.map((cat) => (
              <span
                key={`${cat}-${i}`}
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "6px",
                  color: CATEGORY_COLORS[cat].color,
                  letterSpacing: "0.12em",
                }}
              >
                ◆ {cat}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Category rows */}
      {CATEGORIES.map((category) => {
        const { color, glow } = CATEGORY_COLORS[category];
        const cards = ARCADE_CARDS.filter((c) => c.category === category);

        return (
          <div key={category} style={{ marginBottom: "40px" }}>
            {/* Category label */}
            <div
              className="section-label"
              style={{
                color,
                borderLeftColor: color,
                textShadow: glow,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {category}
              <span
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "6px",
                  color: "var(--color-text-dim)",
                  textShadow: "none",
                }}
              >
                ({cards.length} entries)
              </span>
            </div>

            {/* Card grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {cards.map((card) => (
                <ArcadeCard key={card.id} card={card} accentColor={color} glow={glow} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* --- Card component --- */

function ArcadeCard({
  card,
  accentColor,
  glow,
}: {
  card: ArcadeCard;
  accentColor: string;
  glow: string;
}) {
  return (
    <a
      id={card.id}
      href={card.href}
      aria-label={`View ${card.title} project`}
      style={{
        display: "block",
        textDecoration: "none",
        border: "2px dashed var(--color-border-bright)",
        background: "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,207,255,0.02) 8px, rgba(0,207,255,0.02) 16px)",
        padding: "0",
        position: "relative",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
        cursor: "pointer",
        overflow: "hidden",
        minHeight: "160px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = accentColor;
        el.style.boxShadow = glow;
        el.style.transform = "translateY(-2px)";
        el.style.background = `${accentColor}0a`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--color-border-bright)";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
        el.style.background = "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,207,255,0.02) 8px, rgba(0,207,255,0.02) 16px)";
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px dashed var(--color-border)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "8px",
            color: "var(--color-text-dim)",
            letterSpacing: "0.08em",
            textAlign: "center",
            lineHeight: "1.8",
          }}
        >
          [ THUMBNAIL ]
          <br />
          <span style={{ fontSize: "6px" }}>Sprint 2</span>
        </span>
      </div>

      {/* Card info */}
      <div style={{ padding: "12px 14px" }}>
        <h3
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "7px",
            color: accentColor,
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          {card.title}
        </h3>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
          {card.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--color-text-secondary)",
                background: "var(--color-border)",
                padding: "2px 6px",
                borderRadius: "1px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Star rating */}
        <div style={{ display: "flex", gap: "2px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                fontSize: "9px",
                color: star <= card.rating ? accentColor : "var(--color-text-dim)",
                textShadow: star <= card.rating ? glow : "none",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* "Play" arrow overlay */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          fontFamily: "var(--font-pixel)",
          fontSize: "8px",
          color: accentColor,
          opacity: 0.6,
        }}
      >
        ▶
      </div>
    </a>
  );
}
