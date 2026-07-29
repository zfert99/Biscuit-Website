# Biscuit Lab Hub

The static hub at [`biscuitlab.net`](https://biscuitlab.net) — it owns the apex
domain, indexes the projects, and hosts the build log. Companion to Puzzle Lab
(served under `/puzzles` via a multi-zone rewrite) and to `zfertig.com`.

Built with Next.js (App Router) + TypeScript + Tailwind. It is deliberately
small and static: no auth, no database, no CMS. See
[`Docs/BiscuitLab_Hub_Plan.md`](Docs/BiscuitLab_Hub_Plan.md) for the
authoritative scope and [`Docs/roadmap.md`](Docs/roadmap.md) for the build plan.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | What |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (incl. `jsx-a11y`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:e2e` | Playwright — includes the 320px reflow gate |

## Roadmap

The hub is sliced B0–B5 with gates. Full detail in
[`Docs/roadmap.md`](Docs/roadmap.md).

| Phase | What | Status |
| :---: | --- | :---: |
| **0** | Foundations — scaffold reset, repo baseline, prerequisites | 🚧 In progress |
| **1** | The hub page — cards + status stamp | 📋 Planned |
| **2** | The build log — MDX pipeline, first post | 📋 Planned |
| **3** | Multi-zone `/puzzles` migration | 📋 Planned |
| **4** | SEO surface | 📋 Planned |
| **5** | zfertig.com `feed.json` integration | 📋 Planned |

## Docs

- [`Docs/`](Docs/) — living plans (hub plan, roadmap, web-presence, audit)
- [`Docs/design/`](Docs/design/) — the design system
- [`Docs/research/`](Docs/research/) — deep-dive best-practice references
- [`Docs/archive/`](Docs/archive/) — superseded plans
