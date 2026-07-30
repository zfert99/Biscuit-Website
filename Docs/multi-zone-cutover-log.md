# Multi-Zone Cutover — Log & Status

Serving **Puzzle Lab** under **`biscuitlab.net/puzzles`** (subfolder) instead of
the `puzzles.biscuitlab.net` subdomain. This is the running record of the live
cutover: what's done, what broke, and what's left. Companion to
`Docs/multi-zone-migration-runbook.md` (the plan) and
`Docs/research/multi-zone-migration-validation.md` (the research).

**Last updated:** 2026-07-30, mid-cutover.

## TL;DR status

- ✅ **Core serving works** — `biscuitlab.net/puzzles` renders Puzzle Lab, assets load.
- ✅ **Prerequisites done** — passkey rpID moved to `biscuitlab.net`; DNS/apex live.
- ⛔ **OPEN blocker** — better-auth HTTP routes 404 under `basePath` (client
  sign-in / passkey / OAuth would break). **Root cause found; fix identified;
  not yet applied** (see below).
- ⏳ **Not done** — the 301 (domain not moved yet), the auth fix, browser auth
  verification, and the hub-side card/sitemap bits.

---

## Architecture (how it's wired)

```
Browser → biscuitlab.net/puzzles/*  ─rewrite→  <PUZZLES_ORIGIN>/puzzles/*   (Puzzle Lab, basePath '/puzzles')
Browser → puzzles.biscuitlab.net/*  ─301(pending)→  biscuitlab.net/puzzles/*
```

- **Hub** (Biscuit-Website repo / Vercel project): rewrites `/puzzles` → the Puzzle
  Lab deployment via `PUZZLES_ORIGIN`. Rewrite lives in `next.config.ts`, read at
  **build time** (so the hub must be redeployed after `PUZZLES_ORIGIN` changes).
- **Puzzle Lab** (Puzzle-Generator repo / Vercel project): `basePath: '/puzzles'`.
- **Rewrite target** = Puzzle Lab's own production `*.vercel.app` (distinct host →
  no redirect loop). Vercel auto-`noindex`es `*.vercel.app`, so no SEO leak.

Key URLs / config:

- Hub project env: `PUZZLES_ORIGIN = https://puzzle-generator-zfert99s-projects.vercel.app`
- Puzzle Lab project env: `BETTER_AUTH_URL`, `PASSKEY_RP_ID=biscuitlab.net`, `CRON_SECRET`, DB/Upstash…
- Puzzle Lab production alias: `puzzle-generator-zfert99s-projects.vercel.app` (public)
- Redirect repo: `github.com/zfert99/puzzles-redirect`

---

## Done & verified ✅

| Area | What | Evidence |
| --- | --- | --- |
| rpID | `PASSKEY_RP_ID=biscuitlab.net` + code decoupling (PG PR #27) | Passkey registered/authenticated under the new rpID |
| Account UI | `/account` passkey manager (PG PR #28) — app had **no** passkey-registration UI before | Used it to register the passkey |
| DNS / apex | `biscuitlab.net` serves the hub; `www`→apex | `curl biscuitlab.net` → 200 hub |
| Hub rewrite | `/puzzles` rewrite behind `PUZZLES_ORIGIN` + cross-zone `ProjectCard` (hub PR #23) | Dormant until env set |
| PG basePath | `basePath: '/puzzles'`, metadata, cron path, serverActions (PG PR #29, merged) | `puzzles.biscuitlab.net/puzzles` → 200 |
| Vercel env | `PUZZLES_ORIGIN`, `BETTER_AUTH_URL`, OAuth redirect/JS origins | user-set |
| Serving | `biscuitlab.net/puzzles` → **200** (Puzzle Lab); `/puzzles/_next/*` assets → 200 | `curl` |
| Server auth | `/puzzles/api/me/today` → **401** (session check runs) | `curl` |
| Redirect repo | `puzzles-redirect` (vercel.json 301 + index.html) created & pushed | GitHub |

---

## Blockers / issues encountered

### 1. DNS was at Cloudflare (audit said "avoid Cloudflare") — RESOLVED
The domain is registered at **Cloudflare** on Cloudflare nameservers, but records
are **grey-cloud (DNS-only) → Vercel** (no reverse proxy). The audit's concern was
the Cloudflare *proxy* (orange-cloud); grey-cloud avoids all of it and is a
supported Vercel setup. No transfer needed (and it's ICANN-locked until ~Aug 2026
anyway). **Rule:** keep every record grey-cloud, never proxied.

### 2. Wrong `PUZZLES_ORIGIN` → 404 — RESOLVED
First value was `puzzle-generator.vercel.app` — a different/old deploy **without**
`basePath` (`/puzzles` → 404). Also `*-<hash>-*.vercel.app` URLs are deployment-
pinned + always protected. Fixed to the stable production alias
`https://puzzle-generator-zfert99s-projects.vercel.app` (with `https://`, no
trailing slash).

### 3. Vercel Deployment Protection blocked the hub proxy — RESOLVED
The production `*.vercel.app` was behind **Vercel Authentication** (302 →
`vercel.com/sso-api`), so the hub's server-side rewrite couldn't reach it.
**"Trusted Sources" (OIDC) did NOT cover a transparent `rewrites()` proxy** — that
mechanism needs the caller to fetch/send a token, which a rewrite doesn't do.
Resolved by turning **Vercel Authentication off** on the Puzzle Lab project (the
app is already public via the custom domain; `*.vercel.app` is auto-`noindex`ed).
Correction to the plan: "no dedicated origin host needed" was only true with
protection **off** — otherwise you'd need a public origin domain or to disable it.

### 4. Relative auth-client `baseURL` threw at build — RESOLVED
A first attempt set the client `baseURL: '/puzzles/api/auth'` (relative).
better-auth runs `new URL(baseURL)`, which throws on a relative path (`Invalid
base URL`) — caught by the Vercel **preview** build on the draft PR (exactly why
it was staged as a draft). Switched to the client **`basePath`** option.

---

## ⛔ OPEN BLOCKER — better-auth routes 404 under basePath

**Symptom:** every better-auth HTTP endpoint 404s, on the origin directly (not a
hub issue):

```
/puzzles/api/auth/get-session      → 404
/puzzles/api/auth/sign-in/email    → 404   (POST)
/puzzles/api/auth/sign-up/email    → 404   (POST)
/puzzles/api/me/today              → 401   (non-better-auth route — works)
/puzzles  (page) + /puzzles/_next  → 200   (works)
```

So client sign-in, passkey, and OAuth would all break. This is the "verify the
auth round-trip at cutover" item the research flagged (better-auth + Next
`basePath`, GitHub better-auth#4715).

### Root cause (from reading better-auth source)

- better-auth's router base path = `new URL(ctx.baseURL).pathname`
  (`node_modules/better-auth/dist/api/index.mjs`).
- `ctx.baseURL` is built by `withPath(BETTER_AUTH_URL, basePath)`
  (`utils/url.mjs`) — and **`withPath` skips appending `basePath` (`/api/auth`) if
  `BETTER_AUTH_URL` already has a path.**
- We set `BETTER_AUTH_URL = https://biscuitlab.net/puzzles` (has path `/puzzles`),
  so `/api/auth` was **never appended** → router base becomes **`/puzzles`**, not
  `/puzzles/api/auth`.
- But the actual route (Next `basePath`) is at `/puzzles/api/auth/*`, and Next
  does **not** strip its `basePath` from `request.url`. So requests arrive at
  `/puzzles/api/auth/get-session`, the router expects `/puzzles/*`, the `/api/auth`
  segment mismatches → **every `/api/auth/*` endpoint 404s.**

### The fix (identified, NOT yet applied)

Two parts, together:

1. **Env** — set `BETTER_AUTH_URL = https://biscuitlab.net` (**origin only, remove
   `/puzzles`**).
2. **Code** (`src/features/auth/auth.ts`) — add `basePath: '/puzzles/api/auth'` to
   the `betterAuth({...})` config.

Then `withPath('https://biscuitlab.net', '/puzzles/api/auth')` → `ctx.baseURL =
https://biscuitlab.net/puzzles/api/auth` → router base = `/puzzles/api/auth` →
matches the incoming path. Callback URLs build as `ctx.baseURL + /callback/:id`
= `https://biscuitlab.net/puzzles/api/auth/callback/google` (correct). `rpID` /
`passkeyOrigin` are unaffected (origin is still `biscuitlab.net`). The client
already uses `basePath: '/puzzles/api/auth'`, so it lines up.

> Note: keeping `/puzzles` in `BETTER_AUTH_URL` cannot work regardless of the
> `basePath` option, because `withPath` ignores `basePath` once the URL has a
> path. The origin-only `BETTER_AUTH_URL` + explicit `basePath` is the only
> combination that yields router base `/puzzles/api/auth`.

**To apply:** a PG code PR (auth.ts `basePath`) + change the `BETTER_AUTH_URL`
env value + redeploy Puzzle Lab. Then verify:

```bash
curl -sI https://biscuitlab.net/puzzles/api/auth/get-session   # want: 200 (JSON session, null if logged out)
```

…then a real browser round-trip (passkey, Google OAuth, email/password).

---

## Not done yet ⏳

1. **Apply the better-auth basePath fix** (above) — PG code PR + env change + redeploy.
2. **Verify auth in a browser** at `biscuitlab.net/puzzles` — passkey, Google OAuth, email/password.
3. **The 301** — deploy the `puzzles-redirect` project on Vercel and **move
   `puzzles.biscuitlab.net` onto it** (remove from Puzzle-Generator, add to
   puzzles-redirect). Right now the subdomain still points at Puzzle Lab and 404s
   at its root under `basePath`.
4. **Hub finishing bits** — flip the project-card `href → /puzzles` +
   `crossZone: true`; add the hand-rolled sitemap index (`app/sitemap.xml/route.ts`
   referencing `/puzzles/sitemap.xml`).
5. **Per-page canonicals** on Puzzle Lab (`metadataBase` is set but no
   `<link rel="canonical">` is emitted) — minor SEO polish; the origin is already
   auto-`noindex`ed, so not urgent.
6. **Track C** — Search Console + Bing on the apex, IndexNow, analytics.
7. **Fold corrections back into the docs** — the Deployment-Protection caveat
   (issue #3) and the better-auth `basePath` finding (this doc) into the runbook /
   PG migration plan.

---

## Verify commands (for resuming)

```bash
curl -sI https://biscuitlab.net/puzzles                      # 200 (Puzzle Lab)
curl -sI https://biscuitlab.net/puzzles/api/auth/get-session # want 200 after the auth fix
curl -sI https://puzzles.biscuitlab.net/play                 # want 308 → /puzzles/play after the domain move
```
