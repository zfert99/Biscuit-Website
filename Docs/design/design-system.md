# biscuitlab.net (Hub) — Design System

**This is the hub's design reference.** It inherits Puzzle Lab's visual
foundation and deliberately *refuses* Puzzle Lab's personality layer. Per
`Docs/BiscuitLab_Hub_Plan.md` Part 5, the hub is the **lab bench**: same
materials as Puzzle Lab, but everything squared up and disciplined. Puzzle Lab's
"corkboard chaos" stays behind the `/puzzles` door.

**Concept:** *Biscuit Lab* — a warm, hand-baked palette (cream, butterscotch,
chocolate) with a bold grape "lab" accent, rendered as chunky, pressable,
Flash-portal-era UI (thick outlines, hard offset shadows) on a modern,
accessible, performance-conscious foundation (Next.js + Tailwind). This
deliberately avoids the generic "warm cream + terracotta serif" AI-default look:
the accent pairing is butterscotch-gold + deep grape, and the display face is a
chunky rounded arcade face, not a high-contrast serif.

---

## What the hub inherits

The tokens, typography, radius/shadow/border system, the pressable button
mechanic, the button/nav components, the accessibility floor, and the voice —
all specified below so this doc is self-contained.

## What the hub refuses

These belong to Puzzle Lab only and must **not** appear on the hub:

- The full corkboard/scrapbook chaos layer: scattered polaroids, SVG
  `feTurbulence` wobble filters, coffee-ring doodles, tape/pushpins, torn-paper
  edges, halftone texture, marquee ticker, retro webring/badge strip.
- Rotation on everything. The hub permits **exactly one** rotated element (the
  status stamp — see "The hub signature").
- The parody ad module.
- Puzzle-surface components: puzzle cells, cage dividers, cage-sum labels, and
  the correct/wrong/selected game-feedback juice. The hub has no solve surface.

If a second thing on a hub page starts asking to be rotated or scattered, the
answer is no.

---

## 1. Color tokens

Two named families: **Biscuit** (warm neutrals) and **Lab** (accents). Every
accent is used with intent, never decoratively.

### Light mode

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#FBF3E3` | Page background (biscuit dough cream) |
| `--paper-2` | `#F5E7C8` | Card / raised surface background |
| `--ink` | `#2B1B12` | Primary text, chunky outlines (espresso brown-black) |
| `--ink-soft` | `#6B5544` | Secondary/muted text |
| `--butterscotch` | `#E8A33D` | Primary accent — primary CTAs, emphasis |
| `--butterscotch-dark` | `#C97F1E` | Button shadow/pressed state for butterscotch |
| `--grape` | `#5A3E96` | Secondary accent — "lab" branding, links, secondary buttons, nav |
| `--grape-dark` | `#3E2A69` | Button shadow/pressed state for grape |
| `--mint` | `#2FAE86` | Success (used sparingly on the hub) |
| `--cherry` | `#D8453F` | Danger (used sparingly on the hub) |

### Dark mode ("lab at night")

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#1B1224` | Page background (deep aubergine-black) |
| `--paper-2` | `#241833` | Card background |
| `--ink` | `#F5E9CE` | Primary text |
| `--ink-soft` | `#C9B8A0` | Secondary text |
| `--butterscotch` | `#F2B65A` | Primary accent (brightened for contrast) |
| `--grape` | `#9B7FD4` | Secondary accent (brightened) |
| `--mint` | `#4FCBA0` | Success |
| `--cherry` | `#F06B65` | Danger |

**Rule:** one primary accent (butterscotch) per view for the single most
important action; grape is reserved for navigation/branding and secondary
actions. All text-on-color pairs are checked at ≥4.5:1 (body) / ≥3:1 (large
text, UI components) per WCAG 2.2 AA.

> **Contrast is where a warm cream-on-butterscotch palette fails quietly.**
> Low-contrast text is the most common WCAG failure on the web. Check every
> token pair with a contrast tool **before** committing the tokens, not after.

Dark mode is only worth shipping if it falls out of the tokens for free — the
hub plan lists a dark-mode *toggle* as a non-goal.

---

## 2. Typography

Three roles, paired deliberately — not the Inter-everywhere default:

- **Display — "Fredoka"** (Google Fonts, variable, rounded geometric sans).
  The Flash-portal chunk: wordmark, hub headline, card titles. Used with
  restraint — never body copy.
- **Body/UI — "Manrope"** (Google Fonts). Clean modern grotesk for everything
  functional: nav, buttons, paragraph copy, the build log.
- **Mono — "Space Mono"** (Google Fonts). Dates, meta, small stats. A
  typewriter/booklet character that reads as precise without being a generic
  code font.

### Scale (rem, 1rem = 16px)

| Role | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| Display XL | 3.5rem | 600 | 1.05 | Hub positioning headline |
| Display L | 2.25rem | 600 | 1.1 | Section headers |
| Display M | 1.5rem | 600 | 1.2 | Card titles, log post titles |
| Body L | 1.125rem | 500 | 1.5 | Intro copy, blurbs |
| Body M | 1rem | 400 | 1.6 | Default body / log prose |
| Body S | 0.875rem | 500 | 1.4 | Labels, captions, meta |
| Mono S | 0.75rem | 500 | 1 | Dates, small meta |

Sentence case everywhere in UI copy — no Title Case, no ALL CAPS (the status
stamp is the one exception; see below).

---

## 3. Layout, radius, shadow tokens

- **Radius:** `--r-sm: 8px` (inputs, chips), `--r-md: 14px` (buttons),
  `--r-lg: 20px` (cards). Rounded but not pill-shaped.
- **Border:** chunky outlines are a signature — `border: 3px solid var(--ink)`
  on interactive elements (buttons, cards), `border: 1.5px solid
  var(--ink-soft)` on passive dividers.
- **Shadow — "pressable" offset shadow** (the core signature, not a blur):
  `box-shadow: 4px 4px 0 0 var(--ink)` at rest; on `:active`, the element
  translates `(4px, 4px)` and the shadow collapses to `0 0 0 0` — a physical
  "push the button in" effect. Cheap (no blur, GPU-friendly, one transform).
- **Grid:** an ordered card grid for the project cards
  (`grid-template-columns: repeat(auto-fit, minmax(...))`), generous space,
  aligned — **not** scattered. Standard 8pt spacing scale
  (`4/8/12/16/24/32/48px`).

---

## 4. Motion

Keep it restrained — the hub is chrome, not a game.

| Moment | Effect | Timing |
|---|---|---|
| Button press | Squash + offset-shadow collapse | 90ms, `ease-out`, translate 4px |
| Page/route transition | Simple fade + 8px slide, no bounce | 150ms `ease-out` |

All motion respects `prefers-reduced-motion` (fall back to instant state
changes, opacity-only feedback). No looping ambient animation, no screen-shake,
no confetti — those are Puzzle Lab's.

---

## 5. Core components

- **Buttons:** `primary` (butterscotch fill, ink border+shadow, ink text) for
  the single most important action per screen; `secondary` (paper-2 fill, grape
  border+shadow, grape text); `ghost` (no fill, no shadow, ink-soft text,
  underline on hover). Never more than one `primary` visible at once.
- **Project card:** `--r-lg`, paper-2 background, chunky ink border + offset
  shadow, screenshot thumbnail, Fredoka title (Display M), Body M blurb, an
  optional `contains` list naming sub-things, and the status stamp on the
  corner. The card treatment must make a *single* card look deliberate — if one
  card looks empty on the page, fix the card treatment, not by adding fake
  projects.
- **Log card:** compact — title (Display M or Body L), date (Mono S), one-line
  summary. Passive/read-only surfaces use a flat panel, not the heavy signature
  border.
- **Nav / header:** grape background bar, cream wordmark in Fredoka, ghost-style
  nav links. One small handwritten aside sits next to the wordmark (a permanent,
  low-key personality touch — the single handwritten line the hub allows).
- **Footer:** "built by Zack Fertig" → zfertig.com.

---

## 6. The hub signature — the status stamp

`LIVE` / `IN THE LAB` / `SHELVED` rendered as a chunky label-maker tag on the
corner of each project card — and **the single element on the page permitted to
sit off-square**, at a couple of degrees.

It earns the boldness three ways: it encodes something true rather than
decorating, it is the honest answer to the one-project problem, and it keeps
working as the grid fills up. Everything else stays disciplined so this is the
thing the page is remembered by.

Restraint check: exactly one rotated element, exactly one handwritten line, one
accent colour doing the emphasis.

**Accessibility (load-bearing, not a later pass).** Because the stamp encodes
status, it falls under WCAG SC 1.4.1 Use of Color. The words `LIVE` / `IN THE
LAB` / `SHELVED` carry the meaning; colour only reinforces it. The obvious later
"simplification" is to drop the words and keep the colours — **don't**, the text
label is load-bearing. Under SC 1.4.11, the stamp's border/fill need **3:1
non-text contrast** against the card, and the focus ring needs 3:1 against
whatever sits behind it.

---

## 7. Accessibility (WCAG 2.2 AA — part of the spec, not a later pass)

- **Contrast:** all text ≥4.5:1 (body) / ≥3:1 (large/UI). Re-verify anytime a
  new colour combination is introduced.
- **Focus:** every interactive element gets a visible focus ring — 2px, 3:1
  contrast, offset outside the chunky border (don't rely on the border alone).
- **Target size:** all tappable targets ≥24×24 CSS px.
- **Reflow (SC 1.4.10):** every hub page must reflow to a single column and be
  usable at **320 CSS px** (= 400% zoom on a 1280px viewport) with no
  two-dimensional scrolling. No `user-scalable=no` or `maximum-scale` in the
  viewport meta, ever.
- **Reduced motion:** `prefers-reduced-motion: reduce` strips all
  spring/slide/fade to instant transitions.
- **Colour independence:** no state is conveyed by colour alone.
- **Images:** real alt text on every screenshot; `img, video, iframe {
  max-width: 100%; height: auto }`, plus `overflow-wrap: break-word`.

Enforce in CI from the first commit: `eslint-plugin-jsx-a11y` at `recommended`
as a blocking check, and a Playwright test asserting `documentElement.scrollWidth
<= clientWidth + 1` at 320 / 375 / 768 / 1024 / 1440. Any overflow blocks merge.

---

## 8. Implementation notes (Next.js + Tailwind)

**As built:** dark mode ships via `prefers-color-scheme` (no toggle, no
`data-theme` layer) — it falls out of the tokens for free, which is the only bar
a dark mode had to clear here. Styling is colocated **CSS Modules** per component
over this global token layer; the Tailwind theme mapping below is optional and
not currently used.

```css
/* globals.css — token layer, mirrors the tables above */
:root {
  --paper: #FBF3E3; --paper-2: #F5E7C8;
  --ink: #2B1B12; --ink-soft: #6B5544;
  --butterscotch: #E8A33D; --butterscotch-dark: #C97F1E;
  --grape: #5A3E96; --grape-dark: #3E2A69;
  --mint: #2FAE86; --cherry: #D8453F;
  --r-sm: 8px; --r-md: 14px; --r-lg: 20px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #1B1224; --paper-2: #241833;
    --ink: #F5E9CE; --ink-soft: #C9B8A0;
    --butterscotch: #F2B65A; --butterscotch-dark: #C97F1E;
    --grape: #9B7FD4; --grape-dark: #3E2A69;
    --mint: #4FCBA0; --cherry: #F06B65;
  }
}
```

Use `next/font/google` to self-host Fredoka, Manrope, and Space Mono (plus
Permanent Marker for the single header aside) — no layout shift, no external
requests. The "pressable" shadow is a repeated `box-shadow: 4px 4px 0 0
var(--ink)` that collapses on `:active`.

**Status-stamp contrast, as built:** the tag border uses the themed `--ink`, so
it flips with the theme and always clears 3:1 against the card. `live` /
`in-the-lab` use a coloured fill (mint / butterscotch) with **fixed dark** text
(the light fills stay light in both themes); `shelved` is outline-only in
`--ink-soft`. The status **word** carries the meaning; colour only reinforces it.

**Do not extract a shared design-system package.** Two consumers (hub + Puzzle
Lab) does not justify the coordination cost. Copy these tokens into the hub's
`globals.css` and let the two sites drift. The trigger to extract is
behavioural — repeatedly making the same change across both repos in lockstep —
not a project count. See `Docs/BiscuitLab_Hub_Plan.md` Part 5.

---

## 9. Quick do/don't

**Do:** one accent per screen · chunky offset-shadow on every interactive
element · keep the project grid ordered and aligned · one status stamp per card
as the single rotated element · one handwritten aside in the header · verify
contrast before committing tokens · reflow to one column at 320px.

**Don't:** mix butterscotch and grape as competing primary actions · use
screen-shake or ambient animation · bring in the corkboard chaos layer,
polaroids, wobble filters, coffee stains, tape, marquee, or parody ads
(Puzzle Lab only) · rotate anything except the status stamp · let the chunky
border/shadow appear on passive/read-only surfaces · drop the words from the
status stamp and keep only the colours · extract a shared design-system package.
