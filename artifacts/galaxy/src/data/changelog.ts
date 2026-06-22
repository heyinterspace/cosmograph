export interface ChangelogEntry {
  /** Semver string, e.g. "1.3.0". */
  version: string;
  /** A spacey codename for the release. */
  codename: string;
  /** ISO date (YYYY-MM-DD) the release went out. */
  date: string;
  /** One-line mission summary. */
  summary: string;
  /** The log of what shifted in the cosmos this release. */
  changes: string[];
}

/**
 * The flight log. Newest release first — the head of this list is the version
 * shown across the UI (see CURRENT_VERSION below), so prepend new entries here.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "3.0.0",
    codename: "Cosmograph",
    date: "2026-06-22",
    summary: "A new name for the voyage — Galactic is now Cosmograph.",
    changes: [
      "New identity: the app is now Cosmograph, charting any scientist's life in science at cosmograph.space.",
      "The wordmark, share cards, footer, and live presence all fly the Cosmograph flag from bridge to bottom.",
    ],
  },
  {
    version: "2.0.0",
    codename: "Open Universe",
    date: "2026-06-21",
    summary: "The galaxy opens to every scientist in the sky.",
    changes: [
      "Explore anyone: search a researcher by name and the whole galaxy re-forms around their life's work, charted live from OpenAlex.",
      "Share this Cosmograph: capture your current view as a stat-laden card and copy it straight to the clipboard — no downloads, no detours.",
      "Bridge refit: Replay and Tour moved up beside Orbit and Fly, while Share and the GitHub beacon dropped into the command bar.",
      "A new footer beacon spells out what Cosmograph is for every first-time arrival.",
    ],
  },
  {
    version: "1.3.0",
    codename: "Bridge Console",
    date: "2026-06-20",
    summary: "Hauled the helm up to the bridge and opened the ship's log.",
    changes: [
      "Orbit and Fly thrusters relocated to the top deck, docked right beside the Info port.",
      "The Info beacon flies its name again — no more guessing at the lone glyph.",
      "Cracked open this flight log so you can trace every jump the ship has made.",
    ],
  },
  {
    version: "1.2.0",
    codename: "Star Charts",
    date: "2026-06-20",
    summary: "Drew up the navigation charts for every pilot aboard.",
    changes: [
      "Added a navigation primer for Orbit and Fly modes inside the Info port.",
      "Retired the manual tilt lever — a right-drag now banks the whole sky for you.",
    ],
  },
  {
    version: "1.1.0",
    codename: "Deep Space Signals",
    date: "2026-06-20",
    summary: "Tuned the antenna and caught signals from fellow travelers.",
    changes: [
      "Live presence: faint wisps now mark other cosmographers drifting through the same stars.",
      "A headcount beacon shows how many explorers are streaming through the galaxy right now.",
      "Pulled GitHub starlight into the footer so you can see the constellation grow.",
    ],
  },
  {
    version: "1.0.0",
    codename: "First Light",
    date: "2026-06-15",
    summary: "The galaxy ignites.",
    changes: [
      "Every research domain becomes a sun, every paper a planet, every co-author a moon.",
      "Two ways to roam: a god's-eye Orbit and a first-person Fly-through.",
      "A guided tour and a cinematic warp-in greet every new arrival.",
    ],
  },
];

/** The live version — always the newest entry in the flight log. */
export const CURRENT_VERSION = CHANGELOG[0].version;
