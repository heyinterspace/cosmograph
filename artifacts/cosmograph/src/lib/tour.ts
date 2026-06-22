import type { LucideIcon } from "lucide-react";
import { Compass, Sparkles, TrendingUp } from "lucide-react";
import { galaxyData } from "@/data/galaxy";
import { LEGEND_BY_KEY } from "@/lib/legend";

export type TourTarget =
  | { type: "overview" }
  | { type: "sun"; id: string }
  | { type: "planet"; id: string };

export interface TourStop {
  title: string;
  caption: string;
  target: TourTarget;
  duration: number;
  icon?: LucideIcon;
}

const compactWords = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function buildTourStops(): TourStop[] {
  const stops: TourStop[] = [];
  const { author, stats, papers } = galaxyData;
  const domains = [...galaxyData.domains].sort(
    (a, b) => b.totalCitations - a.totalCitations,
  );
  const topPapers = [...papers].sort((a, b) => b.citations - a.citations);

  // 1. The ONLY explainer: one slide that doubles as the welcome and the key.
  stops.push({
    title: "Welcome",
    caption: `A lifetime of discovery by ${author.name} — ${stats.totalPapers} papers and ${stats.totalCitations.toLocaleString()} citations across ${stats.yearsActive} years. Quick key: each glowing sun is a research field, every planet a paper (bigger = more cited), and the moons are co-authors. Now, the highlights.`,
    target: { type: "overview" },
    duration: 9000,
    icon: Sparkles,
  });

  // 2. The defining research field (brightest sun).
  if (domains[0]) {
    stops.push({
      title: domains[0].name,
      caption: `${author.name}'s defining field: ${domains[0].name}, blazing with ${domains[0].totalCitations.toLocaleString()} citations across ${domains[0].paperCount} papers — the brightest sun in this galaxy.`,
      target: { type: "sun", id: domains[0].id },
      duration: 8500,
      icon: LEGEND_BY_KEY.suns.icon,
    });
  }

  // 3. The second-biggest field, to show range.
  if (domains[1]) {
    stops.push({
      title: domains[1].name,
      caption: `Close behind: ${domains[1].name} — ${domains[1].totalCitations.toLocaleString()} citations over ${domains[1].paperCount} papers, a whole second sun's worth of work.`,
      target: { type: "sun", id: domains[1].id },
      duration: 8000,
      icon: LEGEND_BY_KEY.suns.icon,
    });
  }

  // 4. The signature paper (largest planet).
  const mostCited = topPapers[0];
  if (mostCited) {
    stops.push({
      title: "His most-cited work",
      caption: `"${mostCited.title}" — cited ${mostCited.citations.toLocaleString()} times${mostCited.year ? ` since ${mostCited.year}` : ""}. The single largest planet in the galaxy.`,
      target: { type: "planet", id: mostCited.id },
      duration: 9000,
      icon: LEGEND_BY_KEY.planets.icon,
    });
  }

  // 5. A second landmark paper.
  const secondCited = topPapers[1];
  if (secondCited) {
    stops.push({
      title: "Another landmark",
      caption: `"${secondCited.title}" — ${secondCited.citations.toLocaleString()} citations${secondCited.year ? ` since ${secondCited.year}` : ""}, and one of his most-cited contributions.`,
      target: { type: "planet", id: secondCited.id },
      duration: 8500,
      icon: LEGEND_BY_KEY.planets.icon,
    });
  }

  // 6. The career, by the numbers.
  stops.push({
    title: "By the numbers",
    caption: `An h-index of ${author.hIndex} and ${author.i10Index} well-cited papers, ${stats.uniqueCoAuthors.toLocaleString()} collaborators worldwide, and an estimated ${compactWords(stats.estimatedWords)}+ words published — about ${Math.round(stats.estimatedWords / 90_000).toLocaleString()} novels' worth.`,
    target: { type: "overview" },
    duration: 9000,
    icon: TrendingUp,
  });

  // 7. Hand off to free exploration.
  stops.push({
    title: "Explore Freely",
    caption:
      "That's the highlight reel. Now drift through the rest of the universe at your own pace.",
    target: { type: "overview" },
    duration: 6000,
    icon: Compass,
  });

  return stops;
}

// Computed on demand (not a module-load constant) so it reflects the active
// scientist after a live dataset swap. Consumers memoize this at mount; the tour
// UI/camera components remount on dataset change (key={datasetVersion}).
export function getTourStops(): TourStop[] {
  return buildTourStops();
}
