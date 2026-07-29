# Multi-Zone Migration Runbook (Phase 3)

The cross-repo runbook for serving Puzzle Lab under **`biscuitlab.net/puzzles`**
instead of the `puzzles.biscuitlab.net` subdomain. This is the operational
sequence; the *rationale* is in `Docs/BiscuitLab_Hub_Plan.md` Part 7, and the
Puzzle-Generator-side code changes are in that repo's
`Docs/multi-zone-migration-plan.md`.

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

- **The rewrite target must be a *distinct* origin hostname**, not
  `puzzles.biscuitlab.net` — otherwise the 301 source and the rewrite target are
  the same host and you get an infinite redirect loop. Use the Vercel production
  URL or a dedicated `origin-puzzles.biscuitlab.net`.
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

### 2. Flip the project-card link (`src/content/projects.ts`)

Change the Puzzle Lab entry's `href` from the subdomain to the internal path:

```diff
-    href: "https://puzzles.biscuitlab.net",
+    href: "/puzzles",
```

(That makes `ProjectCard` render it as an internal `next/link` automatically.)

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
4. **[PG infra]** Ensure a distinct origin hostname for the rewrite target;
   add `X-Robots-Tag: noindex` on that origin.
5. **[PG code]** `basePath: '/puzzles'`, `metadataBase`, cron path, and
   `BETTER_AUTH_URL`/Google redirect updates (PG plan §3). Cutover PR.
6. **[hub code]** Add the rewrite (§1) + set `PUZZLES_ORIGIN`.
7. **[you · DNS]** `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*`, 301
   permanent.
8. **[hub code]** Flip the project-card `href` (§2); add the sitemap index (§3).
9. **[you · SEO]** Search Console + Bing on the apex; IndexNow; validate JSON-LD
   in the Rich Results Test.

**Gate (the one that matters):** `biscuitlab.net/puzzles` serves the app with
assets + auth intact, `puzzles.biscuitlab.net` 301s without looping, and a
passkey registered at step 2 still works.

**Rollback:** remove the hub rewrite + the 301, revert `basePath` and
`BETTER_AUTH_URL`. Under ten minutes, because the rpID moved first. Keep
`PASSKEY_RP_ID=biscuitlab.net` (valid on the subdomain too).

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
3. Confirm the origin host returns `noindex` and the 301s are resolving in GSC.
