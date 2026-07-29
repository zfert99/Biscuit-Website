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
};

const withMDX = createMDX({
  options: {
    // String form is required for Turbopack (Next 16 default). remark-frontmatter
    // parses and strips the YAML block so it doesn't render as content.
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
