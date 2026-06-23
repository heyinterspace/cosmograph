# Cosmograph

**A scientist's life's work, rendered as a galaxy you can fly through.**

[cosmograph.space](https://cosmograph.space) turns any researcher's complete body of work into an explorable 3D universe: research domains become **suns**, papers become **planets** orbiting them (size = citations, orbit distance = topic relevance), and frequent co-authors become **moons**. Fly the spaceship through the disk or pull back into a god's-eye planetarium view, click any world for its details, and watch the whole corpus light up at once.

It started as a Father's Day gift for stem-cell scientist **Dr. Mahendra S. Rao** — and is now an open-source template you can point at *any* scientist: a dad, a mom, a mentor, or yourself.

> The shipped snapshot (Dr. Rao) spans **364 papers**, **28,860 citations**, **1,191 co-authors**, and **12 research domains** across **30 years** (1994–2024) — roughly 1.4 million words of published science, drawn as one navigable galaxy.

<!-- Tip: drop a hero screenshot or screen recording here, e.g. ![Cosmograph](docs/hero.png) -->

---

## Highlights

- 🌌 **A real galaxy, not a chart.** Photoreal suns, orbiting planets, and moons rendered with React Three Fiber, drei, and postprocessing — each domain gets its own stellar color and every orbit reads like a planetary system.
- 🚀 **Two ways to explore.** A first-person spaceship fly-through with momentum, and a god/planetarium orbit view with an adjustable axis.
- 🔭 **Everything is clickable.** Open any planet for paper details, any sun for a domain breakdown, and a stats layer that summarizes the entire body of work.
- 🛰️ **Live presence (optional).** Faint "wisps" mark other visitors exploring the same galaxy, with a live "*N cosmonauts streaming now*" headcount — anonymous and in-memory, nothing is persisted.
- 🧬 **No hardcoded identity.** The title, stats, domains, papers, and co-authors all come from a generated data snapshot. Regenerate it for a different scientist and the whole universe redraws.
- ⚡ **Fast and reliable by design.** The full dataset is fetched once at build time and baked into a static JSON file — no backend or database is needed for the core visualization.

## How it works

Cosmograph pulls a researcher's complete publication record from **[OpenAlex](https://openalex.org)** (free, open, no API key — Google Scholar has no public API). A one-time script crunches that record into a single static snapshot:

- Research **domains** ("suns") are derived from OpenAlex's topic hierarchy at the subfield level, with long-tail subfields folded into a "Cross-Disciplinary" sun (target ~6–12 suns).
- Each **paper** ("planet") is sized by citation count and placed at an orbit distance reflecting its relevance to the domain.
- Headline **stats** (papers, citations, h-index, i10, counts-by-year, top institution) are computed from the kept works.

The galaxy itself is a fully static bundle. Realtime presence and the GitHub star count are an *optional* enhancement served by a small always-on API server — the galaxy degrades gracefully if it's unreachable.

## Quick start

Requires [pnpm](https://pnpm.io) and Node.js 24+.

```bash
pnpm install

# Run the galaxy web app (served at /)
pnpm --filter @workspace/cosmograph run dev

# (Optional) run the presence + GitHub-stars API server
pnpm --filter @workspace/api-server run dev
```

Useful repo-wide commands:

```bash
pnpm run typecheck     # full typecheck across all packages
pnpm run build         # typecheck + build everything
```

## Make it for your own scientist

The app ships with **no hardcoded identity** — everything the UI shows comes from `artifacts/cosmograph/src/data/galaxyData.json`. To feature someone else, regenerate that snapshot:

```bash
# By name (prints the top OpenAlex matches to stderr so you can sanity-check)
pnpm --filter @workspace/cosmograph run fetch:galaxy -- --name "Ada Lovelace" \
  > artifacts/cosmograph/src/data/galaxyData.json

# Or by exact OpenAlex author ID (more precise)
pnpm --filter @workspace/cosmograph run fetch:galaxy -- --id A5111365293 \
  > artifacts/cosmograph/src/data/galaxyData.json
```

Then restart the galaxy — the title, stats, domains, papers, and co-authors all redraw from the new snapshot.

### When OpenAlex has merged two same-named researchers

OpenAlex occasionally lumps two distinct scientists who share a name under one author ID. The fetch script can drop the wrong person's works and **recompute every headline stat** from only the kept works:

| Flag | Effect |
| --- | --- |
| `--exclude-institution <OpenAlexInstId>` | Drop works affiliated with this institution (repeatable) |
| `--exclude-coauthor <OpenAlexAuthorId>` | Drop works co-authored with this person (repeatable) |
| `--min-year <YYYY>` / `--max-year <YYYY>` | Drop works outside this publication-year range |

Disambiguate by **research cluster** (institution + co-author), not by year alone — same-named researchers often publish in overlapping decades. See the project notes for the exact command that produced the shipped Dr. Rao snapshot.

## Project structure

This is a [pnpm](https://pnpm.io) monorepo.

```text
artifacts/
  cosmograph/        # The galaxy web app (React + Vite + React Three Fiber), served at /
    src/data/        #   galaxyData.json — the baked-in snapshot (source of truth)
    scripts/         #   fetch-galaxy.mjs — regenerates the snapshot from OpenAlex
  api-server/        # Express API: realtime presence (WebSocket) + GitHub-stars cache
lib/
  api-spec/          # OpenAPI spec — the source of truth for the API contract
  api-client-react/  # Generated React Query hooks (Orval)
  api-zod/           # Generated Zod schemas
  db/                # PostgreSQL schema + Drizzle ORM
```

## Tech stack

- **Frontend:** React, Vite, React Three Fiber + drei + postprocessing, Framer Motion, Tailwind
- **Backend:** Express 5 (Node.js 24, TypeScript 5.9)
- **Data:** PostgreSQL + Drizzle ORM; OpenAlex for publication data
- **Contracts & validation:** OpenAPI → Orval codegen, Zod (`zod/v4`)
- **Build:** Vite (web), esbuild (server)

## Realtime presence

The API server hosts an ephemeral multiplayer layer at `/api/presence`: each visitor's camera position is streamed so others see faint wisps and a live headcount. It's anonymous and in-memory only — nothing is persisted — and it ships with abuse/DDoS guards (connection caps, rate limits, payload limits, coordinate clamping, and a throttled broadcast). Because it needs a long-lived process, deploy the API server as an always-on instance; the galaxy bundle stays static and works without it.

## Deployment

- **Galaxy web app** — a static bundle; host it anywhere.
- **API server** — must run as an always-on process (the presence WebSocket needs persistence). Set `DATABASE_URL` (Postgres). Optionally set `GITHUB_REPO` (`owner/repo`) for the footer star count.

## Credits

Built by [Interspace Venture](https://interspace.ventures). Publication data from [OpenAlex](https://openalex.org). Made with love, first for Dr. Mahendra S. Rao — and now for any scientist you want to celebrate.

## License

MIT.
