# zfertig.com — Archive & Rebuild Plan

Companion to `Web_Presence_Plan_v2`. That document covers how the two sites
relate; this one covers getting off Wix and rebuilding.

**Scope note.** Information architecture and case study copy live in the earlier
`Portfolio_Plan` and `Site_Rebuild_Plan` documents. This plan deliberately does
not restate them. What it adds: the archive and migration mechanics, the
positioning decision that gates the rewrite, and the rules governing what Biscuit
Lab content appears here.

---

# PART 1 — Domain custody, first and urgent

Same shape as the rpID problem: cheap now, expensive later, blocks everything
downstream.

**Find out where zfertig.com is actually registered.** If it was registered
through Wix as part of a plan, Wix is the registrar and the domain is entangled
with the subscription.

If it is at Wix:

1. Unlock the domain and disable privacy in the Wix domain settings
2. Request the auth/EPP transfer code
3. Transfer to **Porkbun or Spaceship**. Both are flat-margin with free WHOIS
   privacy and no upsells. Five-year .com totals run roughly $49.60 (Spaceship,
   cheapest) to $55.40 (Porkbun, better human support). Six dollars is not the
   deciding factor — see the note below on why Cloudflare is off the list.
4. **Expect a 60-day lock** if the domain was registered or transferred within
   the last 60 days. ICANN rule, no appeal. This is why it goes first: it can
   silently eat two months of the timeline.
5. Do not cancel the Wix subscription until the transfer completes *and* the new
   site is live. Cancelling first can take the domain and the content down
   together.

Once transferred, **delegate authoritative nameservers to Vercel** and point DNS
at a placeholder deploy so the domain resolves to something you control while the
rebuild happens.

## Why not Cloudflare Registrar

It sells at cost, which is tempting, but it **mandates Cloudflare nameservers**
and prohibits external DNS. That forecloses the supported Vercel architecture.

And putting Cloudflare's proxy in front of Vercel is actively discouraged by
Vercel: masking the end-user IP degrades their bot protection, WAF, and DDoS
mitigation; rotating proxy exit IPs trigger continuous captcha challenges for
legitimate traffic; and stacking caches serves stale content because Vercel's
deploy-time purge cannot clear Cloudflare's. The signature failure is an
`err_too_many_redirects` loop — Cloudflare's default Flexible SSL forwards plain
HTTP to Vercel, Vercel returns a 308 upgrade to HTTPS, Cloudflare hands it back
to the browser, repeat. Escalating to Full (Strict) fixes the loop and none of
the rest.

Applies to biscuitlab.net too.

---

# PART 2 — Archive the Wix site properly

Wix has no meaningful export. There is no clean HTML dump, no markdown, no
content API for a standard site. Assume everything comes out by hand and budget
accordingly.

## Do all of this before deleting anything

**Public archive.** Run every URL through the Wayback Machine's Save Page Now.
Free, permanent, and it means the old site exists somewhere even if the local
copy is lost.

**Local static mirror.** `wget --mirror --convert-links --page-requisites` or
HTTrack against the live site. This will be ugly — Wix output is
JavaScript-heavy and the mirror may not render — but it captures the raw
material.

**Full-page screenshots of every page.** The most reliable record of what the
site actually looked like, and the fastest reference when rewriting.

**Media at full resolution.** Pull originals from the Wix Media Manager, not from
the rendered page. Wix serves aggressively resized and re-compressed images;
downloading what the browser shows means downloading degraded copies. This
matters most for anything from Shout! or Saga that will appear in a case study.

**Text into markdown.** One file per page, in a `/archive` folder in the new
repo. Copy the actual words, not a summary — you will want the original phrasing
available to react against while rewriting, even where the rewrite discards it.

**URL inventory.** Every page, its Wix path, and its intended destination on the
new site. Wix paths are often unpleasant (`/copy-of-about`, `/blank-1`). Cross
reference against Search Console and Bing Webmaster for what is actually indexed
and what has inbound links; anything on that list needs a 301. Everything else
can 404 cleanly.

## Gate

Do not proceed until: Wayback captures confirmed, screenshots complete, media
downloaded at full resolution, text in markdown, redirect map written down.

---

# PART 3 — Positioning (resolved)

Settled in the Portfolio Plan; recorded here because everything downstream
depends on it.

> I design learning experiences and build the software they run on.

**Target:** technical learning roles at software companies — Learning Experience
Designer, Technical Curriculum Developer, Developer Educator, Learning Engineer.
Not generic corporate L&D. Band $95–130K, anchoring high.

## What this settles for the rebuild

- **Homepage title tag / `<h1>`.** `Zack Fertig — Learning Experience Designer &
  Software Engineer` still holds. The name goes first on every page.
- **Puzzle Lab is framed as learning design**, with the engineering visible as
  the *reason* the learning design is possible — the strategy taxonomy exists
  because the solver exists. Not as a separate engineering brag.
- **Biscuit Lab reads as evidence of shipping and maintaining.** That is a
  supporting claim in the positioning ("I ship and maintain, not just
  prototype"), which means the hub's status badges and the log's commit-adjacent
  honesty are doing real work, not decoration.
- **`/writing` is load-bearing.** It is the only evidence for the one claim the
  Portfolio Plan rates weak. See Part 4.

## What the positioning may not promise

The Portfolio Plan leans on real usage numbers — "two thousand monthly users is
concrete in a way personal project never is." The SEO research prices that
honestly, and it changes what the case study can claim.

A fresh apex with no inherited authority should expect indexing in days to weeks,
first movement on low-competition long-tail terms around months 3–6, and
meaningful traffic months 6–12. Google's own guidance is four months to a year.
On top of that, roughly 58–68% of Google searches now end without a click, and AI
Overviews cut position-one CTR by around 58% on affected queries — and
"how to solve X" content is exactly the exposed category.

**Consequence:** do not sequence the job hunt behind traffic. If the migration
lands in August 2026, meaningful organic traffic is a spring 2027 artifact. The
Puzzle Lab case study has to stand on the solver, the strategy taxonomy, and the
difficulty-as-curriculum thesis, with usage numbers as a bonus if they arrive in
time. Write it so that adding a traffic figure later is a one-line edit, not a
restructure.

This does not change the SEO work, which is cheap and compounds. It changes what
the portfolio is allowed to say.

## The one thing still open

Which shipped name the KenKen variant carries — Calc, Keisan, or otherwise. It
appears in the Puzzle Lab case study, the hub card, the app itself, and the SEO
titles. Not worth blocking on, but it wants settling before the case study is
written rather than after.

---

# PART 4 — What Biscuit Lab content appears here

**Correction from an earlier draft.** A previous version of this plan said "no
writing on zfertig.com, all posts canonical on biscuitlab.net." That was wrong,
because it collapsed two different genres into one. The Portfolio Plan is right:
`/writing` is not optional.

## Two genres, not one

| | `zfertig.com/writing` | `biscuitlab.net/log` |
|---|---|---|
| **Genre** | Technical curriculum | Build log |
| **Reader** | A hiring manager deciding whether you can teach engineers | A developer or user, and the crawler |
| **Shape** | Structured, worked example, diagram, teaches a concept to completion | Narrative — what broke, what you tried, what you learned |
| **Job** | Closes the one weak claim in the evidence table | Shows the practice is alive; earns long-tail search |
| **Cadence** | Three pieces, permanent | Whenever, scrappy |
| **Rots if stale?** | No — it's evidence, not a feed | Somewhat, and that's acceptable |

The topics overlap in *source material* but not in *artifact*. "How the digging
loop guarantees solvability" written as curriculum — structured, with a worked
example and a diagram — is a genuinely different document from a log post about
the same subject, and only the first one is evidence for the claim being made.

## The routing rule

**If a topic is good enough to be curriculum, it goes to `zfertig.com/writing`,
and `biscuitlab.net/log` gets a three-sentence pointer post.** If it is process
narrative or too small to teach from, it stays on the log and never crosses.

One canonical per piece, no duplicate content, and nothing gets written twice.

Current allocation of the material already in hand:

| Topic | Goes to |
|---|---|
| How the digging loop guarantees solvability by reasoning | `/writing` — the flagship piece |
| Why difficulty grading falls out of the solver's taxonomy | `/writing` |
| Test suite retrospective | `/writing` (third, lowest priority) |
| What reading the KSudoku source revealed about its dead difficulty parameters | `log` — a being-wrong story, poor portfolio artifact, good post |
| KenKen multiset cage tables vs Killer's | `log`, or `/writing` if it grows |

## Keeping `/writing` from becoming a blog

The failure mode is real — three posts, newest dated eighteen months ago, reading
as abandonment. Structural defences:

- Call it `/writing`, never `/blog`
- No prominent dates in the index, no pagination, no tags, no RSS-shaped
  furniture. It is a collection of artifacts, not a feed.
- Three pieces is complete. It does not need feeding.
- Let `biscuitlab.net/log` absorb the appetite for frequent posting — that is
  what it is for, and staleness costs far less there.

## What zfertig.com does with Biscuit Lab itself

**A "From the lab" strip on the homepage.** Three most recent log posts — title,
date, one line — linking out to biscuitlab.net. Pulled at build time from a JSON
feed the hub exposes. Perhaps twenty lines of code, and it makes the portfolio
look actively worked on rather than frozen at last edit. Revalidate daily so it
stays current without a redeploy.

**Case studies cite specific posts as evidence.** The Puzzle Lab case study makes
its argument and then points at the log for the full reasoning — "the digging
loop is described in detail here." Linking to the deeper artifact is stronger
than reprinting it, and it demonstrates the exact behaviour a developer-education
role screens for.

**A project card, not a project list.** One Biscuit Lab entry, treated as a
practice rather than a portfolio section. The full index lives on biscuitlab.net.

**Case studies cite `/writing` pieces too.** The Puzzle Lab case study argues
that difficulty grading is skill sequencing, then points at the write-up that
demonstrates it in full. That link is the case study and the gap-closer
reinforcing each other, which is the whole reason both exist.

---

# PART 5 — Build

**Stack.** Next.js on Vercel, matching everything else. Static output; there is
nothing here that needs a server or a database.

**Case studies in MDX.** Long-form with images and the occasional embedded
component. Content in the repo, versioned, portable — the entire point of leaving
Wix.

**Do not reuse the Biscuit Lab design system.** Different job, different
audience. The warm-baked chunky Flash-portal identity is right for a puzzle site
and wrong for a page a hiring manager reads. zfertig.com should be quiet,
typographic, and fast. The one place personality is welcome is the Biscuit Lab
card, which can hint at the other site's character as a deliberate contrast.

**Non-negotiables from the SEO section of the main plan:** `metadata` exports
with the name first on every page, one `<h1>` containing the name on the
homepage, `Person` JSON-LD with `sameAs` to LinkedIn, GitHub, and biscuitlab.net,
real alt text, an OG image per page. Set `metadataBase` to
`https://zfertig.com` so canonicals and OG URLs resolve absolutely.

**Repo baseline**, same as every other repo: GitHub Flow, branch protection
requiring *status checks* and linear history with "require approvals" **off**
(GitHub blocks self-approval and will lock you out of your own `main`),
Conventional Commits, squash-only merge, a CI workflow running lint /
`tsc --noEmit` / build, Dependabot, secret scanning with push protection, `.env*`
gitignored with a committed `.env.example`.

**Quality floor.** Reflow to a single column at **320 CSS px** (WCAG 2.2 SC
1.4.10 — 400% zoom on a 1280px viewport), no `user-scalable=no` in the viewport
meta, `img, video, iframe { max-width: 100%; height: auto }`,
`overflow-wrap: break-word`, relative font units, a visible `:focus-visible` ring
at 3:1 contrast, `prefers-reduced-motion` respected.
`eslint-plugin-jsx-a11y` at `recommended` as a blocking CI check. Case-study
images need explicit width and height to prevent CLS, and `priority` on the LCP
image.

**Analytics.** Vercel Analytics for Web Vitals field data — cookie-free, no
consent banner — and Plausible or Umami for traffic. Skip GA4.

---

# PART 6 — Sequence

## Now — blocks everything

1. Determine the registrar for zfertig.com
2. Start the transfer out of Wix if applicable (60-day lock risk)
3. Nameservers delegated to Vercel (not Cloudflare — Part 1), placeholder deploy
   so the domain resolves to something you control

## Before touching the Wix site

4. Wayback captures of every URL
5. Static mirror + full-page screenshots
6. Media pulled at full resolution from the Media Manager
7. Text extracted to markdown in `/archive`
8. URL inventory and redirect map, cross-referenced against Search Console

## Then — the portfolio proper

Positioning is already settled (Part 3), so this runs straight through. Order
follows the Portfolio Plan.

9. Build the shell: layout, typography, metadata, `Person` JSON-LD, OG images
10. **Saga case study** — strongest evidence, currently exists nowhere online
11. **Homepage** positioning, three cards, "From the lab" strip
12. **Puzzle Lab case study** — the one that justifies the salary band
13. **First `/writing` piece** — the digging loop. Closes the weak claim.
14. Shout! rebuilt from the archived content, leading with Shout Learn
15. CDT dashboard (short), About, Contact
16. DNS cutover, 301s live, EdTech-variant resume in place
17. Cancel Wix — only now
18. Search Console + Bing verification, sitemap submission
19. Consistency pass across resume / LinkedIn / site (Portfolio Plan Part 7)
20. Remaining `/writing` pieces as depth

Items 10–13 are the portfolio. Everything after is depth.

## Parallel, not blocking

Steps 1–8 are mechanical and can run alongside the Biscuit Lab hub work. Step 9
onward wants uninterrupted attention.

## Note on ordering against Biscuit Lab

The hub and the `/puzzles` migration should land *before* step 12, because the
Puzzle Lab case study will link to the live site and those links should point at
their permanent URLs. Writing the case study first means editing it again after
the move.
