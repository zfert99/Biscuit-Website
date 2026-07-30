import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Explicit AI-crawler decision (hub plan Part 8 / audit A4):
 * - Citation / live-fetch bots are allowed, so the hub can appear in AI answers.
 * - Training crawlers (GPTBot, CCBot, Google-Extended) are left allowed too;
 *   flip them to `disallow` here if you'd rather not feed model training — the
 *   SEO cost of blocking them is minimal.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
    ],
    // Both zones' sitemaps, advertised from the apex robots.txt (the domain owner).
    // This is the multi-zone discovery model — two independent sitemaps rather than a
    // hand-rolled root index: at this scale an index adds a drift-prone file for no
    // crawl benefit, and it would collide with the hub's `app/sitemap.ts` special file.
    // The puzzle zone's sitemap lives in the Puzzle-Generator repo and is served through
    // the /puzzles rewrite. See Docs/research/sitemap-architecture-multi-zone.md.
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/puzzles/sitemap.xml`],
    host: site.url,
  };
}
