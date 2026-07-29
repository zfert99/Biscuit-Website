# Multi-Zone Migration Runbook (Phase 3)

The cross-repo runbook for serving Puzzle Lab under **`biscuitlab.net/puzzles`**
instead of the `puzzles.biscuitlab.net` subdomain. This is the operational
sequence; the *rationale* is in `Docs/BiscuitLab_Hub_Plan.md` Part 7, and the
Puzzle-Generator-side code changes are in that repo's
`Docs/multi-zone-migration-plan.md`.

> **Validated & corrected** against
> `Docs/research/multi-zone-migration-validation.md` (2026-07). Three items from
> the first draft were wrong and are fixed below: the Host-based origin `noindex`
> (self-defeating — it fires on the proxied response too), the `.biscuitlab.net`
> cookie (unnecessary/risky — same apex host after cutover), and the project-card
> link (cross-zone links must be `<a>`, not `<Link>`).

Two repos are involved:

- **`Biscuit-Website`** (this hub) — adds the rewrite + the project-card link + the
  sitemap index.
- **`Puzzle-Generator`** (Puzzle Lab) — the rpID move, `basePath`, and public
  metadata.

> **Status: not started — blocked on 0c.** The rpID move must land and be
> verified before anything else. Do not begin until Puzzle Lab's security PR #25
> is merged.

---

## Architecture

```
Browser → biscuitlab.net/puzzles/*  ──rewrite──▶  <PUZZLES_ORIGIN>/puzzles/*   (Puzzle Lab)
Browser → puzzles.biscuitlab.net/*  ──301────────▶  biscuitlab.net/puzzles/*
```

Two rules that keep it from breaking:

- **The rewrite target must be a host *distinct* from `puzzles.biscuitlab.net`**
  — otherwise the 301 source and the rewrite target are the same host and you get
  an infinite redirect loop. The deployment's own **`*.vercel.app` URL suffices**
  (Vercel auto-`noindex`es it); a dedicated `origin-puzzles.biscuitlab.net` is
  unnecessary extra surface (validation doc §1).
- **The rpID must already be `biscuitlab.net` before cutover** (see below), or
  passkeys break at the move.

## The rpID prerequisite (why this is fiddly)

Puzzle Lab derives its passkey rpID from `BETTER_AUTH_URL`, so it's
`puzzles.biscuitlab.net` today. A passkey is bound to its rpID, and WebAuthn
requires the rpID to be a suffix of the serving origin. After cutover the origin
is `biscuitlab.net`, where `puzzles.biscuitlab.net` is **not** a valid rpID — auth
would break entirely. Moving the rpID to the apex first (while still on the
subdomain, which allows it) lets re-registered passkeys survive the move.

Full explanation + the exact code diff:
`Puzzle-Generator/Docs/multi-zone-migration-plan.md` §1–2.

---

## Hub-side changes

### 1. The rewrite (`next.config.ts`)

Point `/puzzles` at the Puzzle Lab origin. Add alongside the existing
`headers()`/MDX config:

```ts
const PUZZLES_ORIGIN = process.env.PUZZLES_ORIGIN; // no trailing slash

const nextConfig: NextConfig = {
  // ...existing pageExtensions, turbopack, headers()
  async rewrites() {
    if (!PUZZLES_ORIGIN) return [];
    return [
      { source: "/puzzles", destination: `${PUZZLES_ORIGIN}/puzzles` },
      { source: "/puzzles/:path*", destination: `${PUZZLES_ORIGIN}/puzzles/:path*` },
    ];
  },
};
```

Both entries are needed — the bare `/puzzles` path doesn't always match
`:path*`. Set `PUZZLES_ORIGIN` in the hub's Vercel env to the distinct origin
hostname. Verify `/puzzles/_next/*` assets resolve.

### 2. Point the project-card link at `/puzzles` — as a cross-zone `<a>`

The Puzzle Lab entry's `href` becomes `/puzzles`, but **it must render as a plain
`<a>`, not `next/link`**: `/puzzles` lives in a different zone, and Next's soft
navigation / prefetch breaks across zone boundaries (validation doc §2c). Today
`ProjectCard` picks `<a>` only for `http(s)` hrefs, so it would wrongly use
`<Link>` for `/puzzles`. Fix it with an explicit cross-zone flag rather than a
URL-shape heuristic:

```diff
 // src/content/projects.ts
-    href: "https://puzzles.biscuitlab.net",
+    href: "/puzzles",
+    crossZone: true,   // rendered as <a> (hard nav) — different Next zone
```

```diff
 // src/components/ProjectCard.tsx
-  const isExternal = project.href.startsWith("http");
+  const isExternal = project.href.startsWith("http") || project.crossZone;
```

(Same applies to any hub↔puzzles links added later, e.g. in `SiteHeader`.)

### 3. Hand-rolled sitemap index (`app/sitemap.xml/route.ts`)

Deferred from Phase 4 to here because it references the puzzle zone. Next.js
won't generate a top-level index for you (audit C4). Once `/puzzles/sitemap.xml`
exists (Puzzle Lab ships one), replace the hub's auto `sitemap.ts` with a
`route.ts` that returns a `<sitemapindex>` listing the hub's own sitemap and
`https://biscuitlab.net/puzzles/sitemap.xml`. Only `<lastmod>` carries weight.

---

## Master sequence (both repos, in order)

Prereq: **merge Puzzle Lab PR #25** (security hardening; already scopes
`trustedOrigins`).

1. **[PG code]** Decouple rpID/origin via `PASSKEY_RP_ID` (PG plan §2). Small PR.
2. **[you · Vercel]** Set `PASSKEY_RP_ID=biscuitlab.net` in Puzzle Lab
   **production**; redeploy; verify a fresh passkey registers **and**
   authenticates on `puzzles.biscuitlab.net`. ← the rpID move, on its own.
3. **[you · DNS]** Registrar + DNS ready (see blocker steps below); add
   `biscuitlab.net` to the hub's Vercel project.
4. **[PG code]** Cutover PR: `basePath: '/puzzles'`; `metadataBase =
   https://biscuitlab.net/puzzles` + per-page canonicals; `serverActions.
   allowedOrigins: ['biscuitlab.net']`; cron path → `/puzzles/api/cron/daily`;
   `BETTER_AUTH_URL=https://biscuitlab.net/puzzles` + client
   `baseURL: '.../puzzles/api/auth'` + `trustedOrigins`; **host-only cookies**
   (no `.biscuitlab.net`); Google OAuth redirect/origins updated (PG plan §3).
   The rewrite target is the origin's `*.vercel.app` URL — **no dedicated origin
   host and no Host-based `noindex`** (validation doc §1).
5. **[hub code]** Add the rewrite (§1) + set `PUZZLES_ORIGIN` to the origin's
   `*.vercel.app` URL.
6. **[you · DNS]** `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*`, 301
   permanent — a separate redirect project is cleanest (or `basePath: false`).
7. **[hub code]** Point the project card at `/puzzles` as a cross-zone `<a>`
   (§2); add the sitemap index (§3).
8. **[you · SEO]** Search Console + Bing on the apex; IndexNow; validate JSON-LD
   + rendered canonicals in the Rich Results Test.

**Gate (the one that matters):** `biscuitlab.net/puzzles` serves the app with
assets + auth intact, `puzzles.biscuitlab.net` 301s without looping, a passkey
registered at step 2 still works, and every Puzzle Lab page's canonical points at
`biscuitlab.net/puzzles/*`.

**Rollback:** remove the hub rewrite + the 301, revert `basePath`,
`BETTER_AUTH_URL`, `metadataBase`, and the cron path. `basePath` is build-time
inlined, so this needs a redeploy, not just a flag. Under ~ten minutes, because
the rpID moved first. Keep `PASSKEY_RP_ID=biscuitlab.net` (valid on the subdomain
too).

---

## Blocker steps you need to do (0c + migration)

These need account access / a live domain, so they're yours. Detailed
step-by-step is in this repo's chat handoff and summarized here.

### A. Puzzle Lab rpID move (do first)

1. Merge PG PR #25, then the small `PASSKEY_RP_ID` PR (PG plan §2).
2. Vercel → Puzzle Lab project → Settings → Environment Variables → add
   `PASSKEY_RP_ID = biscuitlab.net` (Production). Redeploy.
3. On `puzzles.biscuitlab.net`: delete any existing passkey, register a new one,
   sign out, sign back in with it. If that round-trips, the move is done.

### B. Registrar + DNS

1. Registrar: keep/transfer `biscuitlab.net` (and `zfertig.com`) at **Porkbun or
   Spaceship** — **not** Cloudflare Registrar (it forces Cloudflare nameservers;
   audit C1). If a domain sits at Wix, mind the 60-day ICANN transfer lock.
2. Delegate the domain's **nameservers to Vercel** (Vercel → Domains → add
   `biscuitlab.net` → follow the nameserver instructions). **No** Cloudflare
   proxy in front of Vercel.
3. Add `biscuitlab.net` to the **hub's** Vercel project as its production domain.

### C. Search Console, Bing, analytics (can run in parallel)

1. Google Search Console → add a **Domain property** for `biscuitlab.net`
   (verify via the DNS TXT record Vercel/your registrar lets you add). Keep the
   existing `puzzles.biscuitlab.net` property to watch the 301s resolve.
2. Bing Webmaster Tools → add `biscuitlab.net` (you can import from GSC).
3. Analytics: enable **Vercel Analytics** on the hub project (Web Vitals) and add
   **Plausible or Umami** for traffic (audit A6).

### D. After cutover

1. Submit the sitemap index in GSC + Bing; set up **IndexNow** (host the
   `{key}.txt`, POST changed URLs).
2. Run the **Rich Results Test** on the hub + a log post to confirm the JSON-LD.
3. Confirm every Puzzle Lab page's rendered `<link rel="canonical">` points at
   `biscuitlab.net/puzzles/*` (canonical-first — there is no Host-based origin
   `noindex`) and that the 301s are resolving in GSC. Do **not** use the
   Change-of-Address tool — it's domain-level only, not path-level (validation
   doc §7).
