# Multi-Zone Cutover — Log & Status

Serving **Puzzle Lab** under **`biscuitlab.net/puzzles`** (subfolder) instead of
the `puzzles.biscuitlab.net` subdomain. This is the running record of the live
cutover: what's done, what broke, and what's left. Companion to
`Docs/multi-zone-migration-runbook.md` (the plan) and
`Docs/research/multi-zone-migration-validation.md` (the research).

**Last updated:** 2026-07-30, mid-cutover — revised against
`Docs/research/multi-zone-migration-safety-review.md`.

> **Safety-review corrections (2026-07-30).** Two earlier calls were wrong:
> (1) **disabling Deployment Protection was unnecessary and is a pre-launch
> security hazard** — Standard Protection never covers a *custom* production
> domain, so the right fix is a dedicated **`origin-puzzles.biscuitlab.net`** host
> with protection left ON; re-lock before public launch. (2) **The better-auth
> fix is conditional** on whether Next 16 strips its basePath from the handler
> URL — run the logging test first (§ below). Also: the separate `puzzles-redirect`
> project is unnecessary (fold the 308 into the hub), and per-page canonicals are
> the top SEO gap. Verdict: **GO — finish multi-zone**, but re-lock the origin
> first; fall back to the subdomain only if the strip test shows a real
> callback-URL conflict.

## TL;DR status

- ✅ **Core serving works** — `biscuitlab.net/puzzles` renders Puzzle Lab, assets load.
- ✅ **Prerequisites done** — passkey rpID moved to `biscuitlab.net`; DNS/apex live.
- ⚠️ **Origin is over-exposed** — Deployment Protection was turned OFF to reach the
  `*.vercel.app` origin. Wrong fix — must be re-locked via a custom origin host
  before launch (see issue #3).
- ⛔ **OPEN blocker** — better-auth HTTP routes 404 under `basePath`. Root cause
  confirmed; **the fix is conditional on a basePath-strip test — run it first**
  (see below).
- ⏳ **Not done** — re-lock the origin, the auth fix (after the test), per-page
  canonicals, the 301 (fold into hub), browser auth verification, hub card/sitemap.

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

### 3. Deployment Protection blocked the proxy — "resolved" the WRONG way (must redo)
The production `*.vercel.app` was behind **Vercel Authentication** (302 →
`vercel.com/sso-api`), so the hub's server-side rewrite couldn't reach it.
**"Trusted Sources" (OIDC) did NOT cover a transparent `rewrites()` proxy** (that
mechanism needs the caller to mint/attach a token — a rewrite doesn't) — that
diagnosis was correct.

**But the fix — turning Vercel Authentication off — was unnecessary and is a
pre-launch hazard** (safety review §1). **Standard Protection never covers a
*custom* production domain on any plan** — only generated `*.vercel.app` URLs and
previews. The rewrite failed only because `PUZZLES_ORIGIN` pointed at the
*generated* alias, which **is** protected. **Correct fix:** attach a dedicated
custom host **`origin-puzzles.biscuitlab.net`** to the Puzzle Lab project, point
the rewrite at it, and **leave Deployment Protection ON** — custom domains are
exempt, so the proxy reaches it while the generated URL + previews stay locked.

Current state (protection off) is **tolerable for a short pre-launch window but
must be re-locked before public launch.** Real exposures while off: (a)
**duplicate-content SEO** — the alias may not reliably carry `noindex` on direct
hits, and Puzzle Lab emits **no canonicals** yet; (b) direct-to-origin calls
**bypass hub security headers** and any hub-level WAF/rate protections; (c)
rate-limit/CSRF still hold *if* `trustedOrigins=['https://biscuitlab.net']` and
`CRON_SECRET` are enforced. Passkeys are spec-protected regardless (rpID isn't a
suffix of `*.vercel.app`), and host-only cookies don't leak to the alias.

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

### The fix — CONDITIONAL on a basePath-strip test (run it FIRST)

My proposed fix is correct **only if** Next 16 leaves `/puzzles` in the URL the
route handler receives. The safety review flags that better-auth issue #4715 (Next
15.4.1) reports Next **strips** the prefix — the pivotal empirical unknown. So run
this first, in `app/api/auth/[...all]/route.ts` on a GET to
`/puzzles/api/auth/get-session`:

```ts
export async function GET(request: Request) {
  console.log('auth url:', request.url);
  // ...existing toNextJsHandler flow
}
```

**Branch A — `request.url` still has `/puzzles/api/auth/...` (NOT stripped):**

- Env: `BETTER_AUTH_URL = https://biscuitlab.net` (origin only)
- Code (`auth.ts`): server `basePath: '/puzzles/api/auth'`
- → router base `/puzzles/api/auth`; callback resolves to
  `.../puzzles/api/auth/callback/google` (correct).

**Branch B — `request.url` has only `/api/auth/...` (STRIPPED):**

- Env: `BETTER_AUTH_URL = https://biscuitlab.net` (origin only)
- Code: leave server `basePath` **default** (`/api/auth`) → router base `/api/auth`
  matches the stripped path.
- BUT the callback would resolve to `.../api/auth/callback/google` (missing
  `/puzzles`) — so **explicitly set the Google provider `redirectURI:
  'https://biscuitlab.net/puzzles/api/auth/callback/google'`** and register that
  exact URI in Google Cloud Console.

Both branches: client `basePath: '/puzzles/api/auth'` (already set),
`trustedOrigins = ['https://biscuitlab.net']`, `rpID`/`passkeyOrigin` unchanged.
better-auth hard-codes the session cookie `Path: "/"`, so `getSession` on normal
pages is unaffected either way (confirmed from source).

> Why `/puzzles` can't stay in `BETTER_AUTH_URL`: `withPath` drops the default
> basePath once the URL has a path, so the router base becomes `/puzzles` (the
> current bug). `BETTER_AUTH_URL` must be **origin-only** in both branches.

> Plugin caveat (#4715): at least one plugin route reportedly still 404'd after
> the workaround — if PG uses better-auth plugins with their own endpoints, test
> each explicitly.

**To apply:** run the test → matching config as a PG code PR + `BETTER_AUTH_URL`
env change + redeploy → verify `get-session` → 200 and a real browser round-trip
(passkey, Google OAuth, email/password).

---

## Not done yet ⏳

Ordered per the safety review (re-lock origin → canonicals → fix auth → finish):

1. **Re-lock the origin (Stage 0 — do first).** Add custom host
   `origin-puzzles.biscuitlab.net` to the Puzzle Lab project (grey-cloud DNS at
   Cloudflare), **re-enable Deployment Protection**, repoint `PUZZLES_ORIGIN` →
   `https://origin-puzzles.biscuitlab.net`, redeploy the hub. Confirm the generated
   `*.vercel.app` alias now 401s while `biscuitlab.net/puzzles` still 200s.
2. **Per-page canonicals** (top SEO gap). Add `alternates: { canonical: './' }` in
   the PG root layout; `metadataBase = https://biscuitlab.net/puzzles`. Without it
   the exposed alias + trailing-slash/query variants risk duplicate indexing.
3. **Run the basePath-strip test, then apply the auth fix** (Branch A or B above) —
   PG code PR + `BETTER_AUTH_URL` env change + redeploy.
4. **Verify auth in a browser** — passkey, Google OAuth, email/password + `get-session`.
5. **The 301 — fold into the hub, not a separate project.** Attach
   `puzzles.biscuitlab.net` to the **hub** project and add a host-conditional
   `redirects()` rule (`basePath: false`; Vercel issues 308 = SEO-equivalent 301).
   The `puzzles-redirect` repo is **unnecessary** and can be decommissioned.
6. **Confirm hardening** — `serverActions.allowedOrigins=['biscuitlab.net']` (in
   #29) works through the proxy; `next/image` `remotePatterns`/`qualities` (Next 16
   requires both); `CRON_SECRET` returns 401 without the Bearer header.
7. **Hub finishing bits** — card `href → /puzzles` + `crossZone: true`; hand-rolled
   sitemap index (`app/sitemap.xml/route.ts` → `/puzzles/sitemap.xml`, canonical host).
8. **Track C** — Search Console + Bing on the apex (DNS TXT), IndexNow, analytics.
9. **Ops hygiene** — deploy origin **before** hub for coupled changes (no
   cross-project skew protection); `revalidatePath` is per-project; roll back with
   Vercel Instant Rollback per project; keep the exact config values
   (`BETTER_AUTH_URL`/basePath/`redirectURI`/deploy order) recorded here.

---

## Verify commands (for resuming)

```bash
curl -sI https://biscuitlab.net/puzzles                      # 200 (Puzzle Lab)
curl -sI https://biscuitlab.net/puzzles/api/auth/get-session # want 200 after the auth fix
curl -sI https://puzzles.biscuitlab.net/play                 # want 308 → /puzzles/play after the domain move
```
