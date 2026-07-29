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
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
