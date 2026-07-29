import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/log";

/**
 * The hub's own URLs. Google ignores <priority> and <changefreq>, so only
 * <lastmod> is set. A sitemap *index* that also references the puzzle zone's
 * sitemap is deferred until the multi-zone migration lands (roadmap Phase 3),
 * since /puzzles/sitemap.xml doesn't exist until then (hub plan Part 8 / audit C4).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const mostRecent = posts[0]?.date ? new Date(posts[0].date) : new Date();

  return [
    { url: site.url, lastModified: mostRecent },
    { url: `${site.url}/log`, lastModified: mostRecent },
    ...posts.map((post) => ({
      url: `${site.url}/log/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
