# Multi-Zone Cutover — Log & Status

Serving **Puzzle Lab** under **`biscuitlab.net/puzzles`** (subfolder) instead of
the `puzzles.biscuitlab.net` subdomain. This is the running record of the live
cutover: what's done, what broke, and what's left. Companion to
`Docs/multi-zone-migration-runbook.md` (the plan) and
`Docs/research/multi-zone-migration-validation.md` (the research).

**Last updated:** 2026-07-30 — auth blocker **CLEARED**, origin re-locked, browser
auth (passkey + Google) verified, hub card link flipped. Revised against
`Docs/research/multi-zone-migration-safety-review.md`.

> **Safety-review corrections (2026-07-30) — both now actioned.**
> (1) **Deployment Protection re-locked the right way** — dedicated custom host
> **`origin-puzzles.biscuitlab.net`** on the Puzzle Lab project with protection left
> ON; the generated `*.vercel.app` alias is locked again (302) while the proxy
> reaches the exempt custom host. (2) **The better-auth fix was conditional** on
> whether Next 16 strips its basePath — the strip test ran and returned **Branch B
> (Next strips `/puzzles`)**; the fix is merged (PG #32) and verified live. Still
> open: per-page canonicals (top SEO gap), the 301 (fold the 308 into the hub), and
> the hub finishing bits. Verdict was **GO — finish multi-zone**; the risky auth
> step is done.

## TL;DR status

- ✅ **Core serving works** — `biscuitlab.net/puzzles` renders Puzzle Lab, assets load.
- ✅ **Prerequisites done** — passkey rpID moved to `biscuitlab.net`; DNS/apex live.
- ✅ **Origin re-locked** — `origin-puzzles.biscuitlab.net` (protection ON) is the
  rewrite target; generated alias 302s again (see issue #3).
- ✅ **Auth blocker CLEARED** — strip test → Branch B; fix merged (PG #32) and
  verified: `get-session` → **200**, `sign-in/email` → 401 (routes), passkey opts →
  401 (routes). Was 404 across the board.
- ✅ **Browser auth verified** — passkey ✓ and Google OAuth ✓ (user-confirmed).
  Google's post-login redirect dropped `/puzzles` (→ `/daily` 404); fixed in PG #33
  (basePath-prefix the social `callbackURL`).
- ✅ **Hub card link** — points at `/puzzles` (`crossZone: true`, same-tab hard-nav).
- ⏳ **Not done** — per-page canonicals, the 301 (fold into hub), hardening
  confirmations, hub sitemap index, Search Console.

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
- **Rewrite target** = dedicated custom host `origin-puzzles.biscuitlab.net`
  (distinct host → no redirect loop; exempt from Standard Protection so the proxy
  reaches it while the generated alias stays locked).

Key URLs / config:

- Hub project env: `PUZZLES_ORIGIN = https://origin-puzzles.biscuitlab.net`
- Puzzle Lab project env: `BETTER_AUTH_URL` (origin-only recommended; code now
  derives origin regardless), `PASSKEY_RP_ID=biscuitlab.net`, `GOOGLE_CLIENT_ID/SECRET`,
  `CRON_SECRET`, DB/Upstash…
- Puzzle Lab origin host: `origin-puzzles.biscuitlab.net` (protection ON) — CNAME →
  Vercel, grey-cloud at Cloudflare
- Puzzle Lab generated alias: `puzzle-generator-zfert99s-projects.vercel.app` (locked, 302)
- Redirect repo: `github.com/zfert99/puzzles-redirect` — **decommission** (fold 308 into hub)

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
| Origin re-lock | `origin-puzzles.biscuitlab.net` (protection ON) is `PUZZLES_ORIGIN`; generated alias → 302 | `curl` + `dig` |
| basePath-strip test | PG #31 diagnostic → handler receives `/api/auth/get-session` (Next **strips** `/puzzles`) → **Branch B** | `curl ?__pathcheck` |
| **Auth fix** | PG #32 — origin-only `baseURL` + pinned Google `redirectURI`; diagnostic removed | `get-session` 200, `sign-in/email` 401, passkey opts 401 (all route, not 404) |
| OAuth callback | PG #33 — basePath-prefix the social `callbackURL` (was `/daily` 404) | Google sign-in lands on `/puzzles/daily` (user-confirmed) |
| Browser auth | Passkey + Google OAuth round-trips | user-confirmed working |
| Hub card link | `href → /puzzles` + `crossZone: true` (hub, this PR) | renders `<a href="/puzzles">`, same-tab; eslint/tsc pass |

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

### 3. Deployment Protection blocked the proxy — RESOLVED (re-locked correctly)
The production `*.vercel.app` was behind **Vercel Authentication** (302 →
`vercel.com/sso-api`), so the hub's server-side rewrite couldn't reach it.
**"Trusted Sources" (OIDC) did NOT cover a transparent `rewrites()` proxy** (that
mechanism needs the caller to mint/attach a token — a rewrite doesn't) — that
diagnosis was correct.

The first fix — turning Vercel Authentication **off** — was unnecessary and a
pre-launch hazard (safety review §1): **Standard Protection never covers a *custom*
production domain**, only generated `*.vercel.app` URLs and previews. The rewrite
failed only because `PUZZLES_ORIGIN` pointed at the *generated* alias, which **is**
protected. **Correct fix (now applied):** a dedicated custom host
**`origin-puzzles.biscuitlab.net`** attached to the Puzzle Lab project (grey-cloud
CNAME → Vercel), `PUZZLES_ORIGIN` repointed at it, and **Deployment Protection
re-enabled**. Verified: `biscuitlab.net/puzzles` → 200 (proxy reaches the exempt
custom host), the generated alias → **302** (locked again), and
`dig origin-puzzles.biscuitlab.net` resolves to Vercel. The over-exposure window is
closed.

### 4. Relative auth-client `baseURL` threw at build — RESOLVED
A first attempt set the client `baseURL: '/puzzles/api/auth'` (relative).
better-auth runs `new URL(baseURL)`, which throws on a relative path (`Invalid
base URL`) — caught by the Vercel **preview** build on the draft PR (exactly why
it was staged as a draft). Switched to the client **`basePath`** option.

---

## ✅ RESOLVED — better-auth routes now mount under the `/puzzles` zone

**Was:** every better-auth HTTP endpoint 404'd on the origin (`get-session`,
`sign-in/email`, `sign-up/email`, passkey, OAuth) — only the non-better-auth
`/api/me/today` (401) and the page/`_next` assets (200) worked. Client sign-in,
passkey, and OAuth would all have broken.

### Root cause (confirmed from source **and** live)

- better-auth's router base path = `new URL(ctx.baseURL).pathname`, and `ctx.baseURL`
  is built by `withPath(BETTER_AUTH_URL, basePath)` which **skips appending the
  default `/api/auth` when `BETTER_AUTH_URL` already has a path.**
- `BETTER_AUTH_URL` was `https://biscuitlab.net/puzzles` → router base became
  `/puzzles`, never `/puzzles/api/auth`.
- The remaining unknown was whether Next 16 leaves `/puzzles` in the handler URL.
  **The strip test (PG #31) settled it:** hitting
  `/puzzles/api/auth/get-session?__pathcheck=1` through the hub, the handler received
  `pathname: /api/auth/get-session` — **Next strips `/puzzles`.** → **Branch B.**

So requests arrive at `/api/auth/*` while the router (mis)mounted at `/puzzles` →
404 everywhere.

### The fix (PG #32, merged + verified live)

Branch B, but encoded **in code** so it can't regress on an env typo:

- **`baseURL` derived origin-only** — `publicOrigin = new URL(appUrl).origin` (the
  old `passkeyOrigin`, renamed since it now doubles as `baseURL`). Router mounts at
  the default `/api/auth`, matching the stripped path. Correct even if
  `BETTER_AUTH_URL` still carries `/puzzles`.
- **Google `redirectURI` pinned** to `${publicOrigin}/puzzles/api/auth/callback/google`
  — the one absolute URL better-auth builds server-side, which an origin-only
  `baseURL` would otherwise emit without `/puzzles` (unreachable through the hub
  rewrite). **Must be whitelisted in the Google Cloud console** (redirect URI +
  `https://biscuitlab.net` as an authorized JS origin) before Google OAuth works.
- Removed the #31 diagnostic. `rpID`, WebAuthn `origin`, client
  `basePath: '/puzzles/api/auth'`, and the session cookie `Path: "/"` are unchanged.

**Verified live through the hub** (2026-07-30, post-deploy):

```text
/puzzles/api/auth/get-session               → 200  "null"   (was 404)
/puzzles/api/auth/sign-in/email (POST, bad) → 401  {"code":"INVALID_EMAIL_OR_PASSWORD"}
/puzzles/api/auth/passkey/generate-register-options → 401 (routes; unauth)
/puzzles/api/auth/get-session?__pathcheck=1 → 200 "null"   (diagnostic gone)
```

**Browser round-trip — verified (user-confirmed):** passkey ✓ and Google OAuth ✓.

One follow-on client bug surfaced during Google testing: the post-login redirect
went to `biscuitlab.net/daily` (404) instead of `/puzzles/daily`. Cause: the
passkey/email flows navigate via `router.push()` (Next prepends `basePath`), but
`signIn.social` hands `callbackURL` to better-auth, which resolves it against the
origin — no `basePath`. Fixed in **PG #33** by basePath-prefixing the *social*
`callbackURL` only (the client-side mirror of the server-side origin-only issue
above).

---

## Not done yet ⏳

Remaining after the auth blocker, re-lock, browser verification, and card link cleared:

1. **Per-page canonicals** — ✅ **code shipped (PG #34).** `alternates: { canonical:
   './' }` in the PG root layout; Next resolves it per-route against the (basePath-
   stripped) pathname + `metadataBase`, so every page self-canonicalizes to its
   `biscuitlab.net/puzzles/*` URL. Verified live in dev (no double `/puzzles`).
2. **The 301 (subdomain → subfolder)** — ✅ **code shipped (hub `redirects()`).** A
   host-scoped `redirects()` rule in the hub's `next.config.ts` sends
   `puzzles.biscuitlab.net/*` → `biscuitlab.net/puzzles/*` (308, path+query
   preserved; apex unaffected — verified locally via a spoofed Host header). **User
   actions remain:** (a) attach `puzzles.biscuitlab.net` to the **hub** Vercel
   project so requests reach the rule; (b) **decommission** the now-unnecessary
   `puzzles-redirect` project/repo.
3. **Confirm hardening** — `serverActions.allowedOrigins=['biscuitlab.net']` (in
   #29) works through the proxy; `next/image` `remotePatterns`/`qualities` (Next 16
   requires both); `CRON_SECRET` returns 401 without the Bearer header.
4. **Hub sitemap index** — hand-rolled `app/sitemap.xml/route.ts` listing the hub's
   own sitemap + `/puzzles/sitemap.xml` (canonical host).
5. **Track C** — Search Console + Bing on the apex (DNS TXT), IndexNow, analytics.
6. **Ops hygiene** — deploy origin **before** hub for coupled changes (no
   cross-project skew protection); `revalidatePath` is per-project; roll back with
   Vercel Instant Rollback per project; keep the exact config values
   (`BETTER_AUTH_URL`/`redirectURI`/deploy order) recorded here.

> **Config note:** `BETTER_AUTH_URL=https://biscuitlab.net` origin-only is
> recommended for clarity, but no longer required — the code (PG #32) derives the
> origin regardless of a stray path.

---

## Verify commands (for resuming)

```bash
curl -sI https://biscuitlab.net/puzzles                       # 200 (Puzzle Lab)
curl -s  https://biscuitlab.net/puzzles/api/auth/get-session  # 200 "null" (auth fix live)
curl -s -X POST https://biscuitlab.net/puzzles/api/auth/sign-in/email \
  -H 'Content-Type: application/json' -d '{"email":"x@y.z","password":"nope"}'  # 401 (routes)
curl -sI https://puzzles.biscuitlab.net/play                  # want 308 → /puzzles/play after the domain move
```
