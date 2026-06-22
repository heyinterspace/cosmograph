---
name: Brand — Cosmograph
description: The app's brand identity and the naming rules that survive the Galactic→Cosmograph rebrand.
---

# Brand: Cosmograph

The app brand is **Cosmograph**; the production domain is **cosmograph.space**. It was formerly "Galactic" / galactic.dad — do not reintroduce the old name in any live UI surface.

- **Keep the astronomy *concept* words** — "galaxy", "galactic plane", "galactic core", `GalaxySystem`. These describe the 3D visualization metaphor, not the brand. Only the product *name* changed.
- **Presence term:** visitors are "cosmographers" (was "galacticons"), e.g. "N cosmographers streaming now".
- **GitHub repo stays `heyinterspace/galactic`** (in `site.ts` + `GITHUB_REPO`). The actual repo was not renamed, so changing it would break the footer star count and sponsors link. Leave it until the user renames the repo.
- **Internal package/artifact slug is still `galaxy`** (`@workspace/galaxy`, artifact slug `galaxy`, `fetch:galaxy` script, `src/data/galaxyData.json`). Renaming touches workflows, artifact.toml, preview path, tsconfig, imports — high risk. Pending explicit user decision; don't rename silently.

**Why:** user requested a full rebrand ("every part… no shortcuts") but the concept word, the real repo, and the internal slug are infrastructure/metaphor, not brand — changing them blindly breaks things.
**How to apply:** when adding UI copy or metadata use "Cosmograph"/"cosmograph.space"; never write "Galactic" except the one historical 3.0.0 changelog line that announces the rename.
