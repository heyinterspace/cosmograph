import { Sun, Globe2, Moon, Orbit, Network, Compass, type LucideIcon } from "lucide-react";

// Single source of truth for the "what everything means" notes. Consumed by both
// the Info drawer (full reference) and the guided tour (so the tour teaches the
// same visual language instead of duplicating it).

export interface LegendItem {
  key: "suns" | "planets" | "moons" | "orbits" | "related";
  icon: LucideIcon;
  title: string;
  body: string;
}

export const LEGEND: LegendItem[] = [
  {
    key: "suns",
    icon: Sun,
    title: "Suns are research domains",
    body: "Each sun is a research field represented in this body of work. The larger the sun, the more papers published in that domain.",
  },
  {
    key: "planets",
    icon: Globe2,
    title: "Planets are papers",
    body: "Every planet orbiting a sun is a single published paper. The larger the planet, the more times it has been cited.",
  },
  {
    key: "moons",
    icon: Moon,
    title: "Moons are co-authors",
    body: "Select a paper and its moons appear — the collaborators who co-authored it.",
  },
  {
    key: "orbits",
    icon: Orbit,
    title: "Orbits show relevance",
    body: "A planet's distance from its sun reflects how central the paper is to that domain.",
  },
  {
    key: "related",
    icon: Network,
    title: "Nearby suns are related",
    body: "Solar systems are grouped by broad research field, so suns clustered together belong to the same area of science — while distant clusters are different fields entirely.",
  },
];

export const LEGEND_BY_KEY: Record<LegendItem["key"], LegendItem> = Object.fromEntries(
  LEGEND.map((l) => [l.key, l]),
) as Record<LegendItem["key"], LegendItem>;

export interface NavMode {
  icon: LucideIcon;
  name: string;
  blurb: string;
}

export const NAV_MODES: { orbit: NavMode; fly: NavMode } = {
  orbit: {
    icon: Orbit,
    name: "Orbit",
    blurb: "Float above the galaxy and study it from the outside.",
  },
  fly: {
    icon: Compass,
    name: "Fly",
    blurb: "Drop into the disk and pilot a ship through the stars.",
  },
};
