/**
 * Site-wide constants: canonical base, identity, and the links used for the
 * reciprocal `sameAs` entity graph. Kept in one place so metadata, JSON-LD, and
 * the footer never drift. See Docs/BiscuitLab_Hub_Plan.md Parts 6 & 8.
 */
export const site = {
  name: "Biscuit Lab",
  url: "https://biscuitlab.net",
  description: "A small lab: the projects, and the build log behind them.",
  /** The person the work belongs to. The bio lives on zfertig.com, not here. */
  author: {
    name: "Zack Fertig",
    url: "https://zfertig.com",
    // sameAs targets that connect this hostname to one entity. Add LinkedIn here
    // once its canonical URL is confirmed.
    sameAs: ["https://zfertig.com", "https://github.com/zfert99"],
  },
} as const;

/**
 * Site-wide JSON-LD graph: Organization, WebSite, and the Person whose
 * reciprocal `sameAs` (mirrored on zfertig.com) ties the hostnames into one
 * entity rather than two strangers. See hub plan Part 8. No SearchAction — the
 * hub has no site search to point it at.
 */
export function siteJsonLd() {
  const personId = `${site.author.url}#person`;
  const orgId = `${site.url}#org`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.author.name,
        url: site.author.url,
        sameAs: site.author.sameAs,
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url: site.url,
        founder: { "@id": personId },
      },
      {
        "@type": "WebSite",
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": orgId },
      },
    ],
  };
}

/** BreadcrumbList — still produces rich results (audit A5). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/** Article for a log post, with the real author entity (E-E-A-T; audit A5). */
export function articleJsonLd(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
}) {
  const url = `${site.url}/log/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@id": `${site.author.url}#person` },
    publisher: { "@id": `${site.url}#org` },
    mainEntityOfPage: url,
    url,
  };
}

