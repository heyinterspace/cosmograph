---
name: Version bumping
description: How the Galactic UI version is set and what to update when shipping features.
---

The galaxy app's displayed version is NOT derived from git, checkpoints, or any
automation. It is `CURRENT_VERSION = CHANGELOG[0].version` — the head of the
hand-written flight log in `artifacts/galaxy/src/data/changelog.ts`. The version
only changes when a new entry is prepended to that array.

**Rule:** when shipping a user-facing feature/wave of work, prepend a new
`CHANGELOG` entry (version, codename, date, summary, changes[]) AND bump
`artifacts/galaxy/package.json` `version` to match. They are two separate
hardcoded values that must be kept in sync.

**Why:** features repeatedly shipped without a changelog entry, so the UI version
froze (sat at 1.3.0 through several feature waves until a user noticed). The flight
log is also surfaced in the UI (changelog drawer), so a stale log means users
can't see what shipped.
