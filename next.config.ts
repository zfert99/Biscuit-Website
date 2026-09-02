import type { NextConfig } from "next";
import path from "path";
import createMDX from "@next/mdx";

// Baseline security headers on every route (AGENTS.md — Security & Infrastructure).
// A nonce-based CSP is a deliberate follow-up, not a blocker for these.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Enables `.mdx` imports for the build log. This is the @next/mdx setup, NOT
  // the pageExtensions colocation anti-pattern — log posts live in
  // src/content/log (outside app/), so no `.mdx` file becomes a route on its own.
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Multi-zone 301: the old puzzles.biscuitlab.net subdomain -> the /puzzles
    // subfolder, path-preserving and permanent (Vercel serves 308, SEO-equivalent
    // to 301). Scoped by a Host condition so it fires ONLY for that subdomain —
    // apex (biscuitlab.net) requests fall through to normal serving + the /puzzles
    // rewrite below. Folded into the hub instead of a separate redirect project
    // (safety review §4). Source and destination hosts differ, so no redirect loop.
    // Dormant until puzzles.biscuitlab.net is attached to THIS (hub) Vercel project;
    // until then no request reaches the hub with that Host, so the rule is a no-op.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "puzzles.biscuitlab.net" }],
        destination: "https://biscuitlab.net/puzzles/:path*",
        permanent: true,
      },
      // A log post's filename IS its URL, so retitling one moves it. This post was published,
      // sitemapped and briefly live under its original slug before being renamed, so the old URL
      // gets a permanent redirect rather than a 404. Add an entry here for any future rename.
      {
        source: "/log/idempotent-until-i-made-it-random",
        destination: "/log/one-column-four-jobs",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Multi-zone: serve Puzzle Lab under /puzzles by proxying to its origin. LIVE in
    // production — PUZZLES_ORIGIN points at the dedicated custom host
    // origin-puzzles.biscuitlab.net (Deployment Protection ON; custom domains are
    // exempt, so the proxy reaches it while the generated *.vercel.app alias stays
    // locked — safety review §1, correcting the earlier "*.vercel.app is fine" note).
    // Read at BUILD time, so the hub must be redeployed after PUZZLES_ORIGIN changes;
    // returns [] (no-op) when unset, e.g. local dev. Both entries are required — the
    // bare /puzzles path doesn't always match :path*.
    const origin = process.env.PUZZLES_ORIGIN?.replace(/\/$/, "");

    // BellTab, the second zone, by the same recipe: BELL_ORIGIN points at the
    // dedicated custom host origin-bell.biscuitlab.net (protection ON, custom
    // domains exempt). Dormant until the env var is set - which is the whole
    // cutover switch, since rewrites are read at build time. BellTab has no
    // auth and no legacy subdomain, so this is the easy half of what the
    // runbook describes; see belltab's Docs/roadmap.md Phase 7.
    const bellOrigin = process.env.BELL_ORIGIN?.replace(/\/$/, "");

    return [
      ...(origin
        ? [
            { source: "/puzzles", destination: `${origin}/puzzles` },
            { source: "/puzzles/:path*", destination: `${origin}/puzzles/:path*` },
          ]
        : []),
      ...(bellOrigin
        ? [
            { source: "/bell", destination: `${bellOrigin}/bell` },
            { source: "/bell/:path*", destination: `${bellOrigin}/bell/:path*` },
          ]
        : []),
    ];
  },
};

const withMDX = createMDX({
  options: {
    // String form is required for Turbopack (Next 16 default). remark-frontmatter
    // parses and strips the YAML block so it doesn't render as content.
    // remark-gfm adds GitHub-flavoured markdown — most importantly TABLES, which
    // plain CommonMark does not support: without it a pipe table silently collapses
    // into one run-on paragraph. Also brings strikethrough, autolinks and footnotes.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
  },
});

export default withMDX(nextConfig);
