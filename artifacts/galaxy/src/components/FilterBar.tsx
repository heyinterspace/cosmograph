import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useAppState } from "@/lib/store";
import {
  galaxyData,
  yearRange,
  maxCitations,
  isFiltersActive,
  countMatchingPapers,
} from "@/data/galaxy";

export function FilterBar() {
  const { filters, setFilters, resetFilters } = useAppState();
  const [open, setOpen] = useState(false);

  const filtersActive = isFiltersActive(filters);
  const totalPapers = galaxyData.papers.length;
  const matchCount = useMemo(
    () => (filtersActive ? countMatchingPapers(filters) : totalPapers),
    [filters, filtersActive, totalPapers],
  );

  const minYear = filters.minYear ?? yearRange.min;
  const maxYear = filters.maxYear ?? yearRange.max;

  return (
    <div className="absolute top-24 left-5 z-20 w-[min(320px,calc(100vw-2.5rem))] pointer-events-auto flex flex-col gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`glass-panel glass-panel-interactive flex items-center justify-between gap-2 px-4 py-2.5 ${
          open || filtersActive ? "text-accent" : "text-ink"
        }`}
      >
        <span className="flex items-center gap-2 font-display text-xs uppercase tracking-wider">
          <SlidersHorizontal size={15} />
          Filters
        </span>
        <span className={`font-mono text-[11px] ${filtersActive ? "text-accent" : "text-ink-dim"}`}>
          {filtersActive ? `${matchCount}/${totalPapers}` : totalPapers}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel p-4 flex flex-col gap-5 max-h-[30vh] md:max-h-[calc(100vh-13rem)] overflow-y-auto custom-scrollbar"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-dim">Year Range</span>
                <span className="font-mono text-[11px] text-ink">
                  {minYear}–{maxYear}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min={yearRange.min}
                  max={yearRange.max}
                  step={1}
                  value={minYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setFilters({ minYear: v <= yearRange.min ? null : Math.min(v, maxYear) });
                  }}
                  className="w-full h-1.5 bg-white/15 appearance-none cursor-pointer accent-accent"
                />
                <input
                  type="range"
                  min={yearRange.min}
                  max={yearRange.max}
                  step={1}
                  value={maxYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setFilters({ maxYear: v >= yearRange.max ? null : Math.max(v, minYear) });
                  }}
                  className="w-full h-1.5 bg-white/15 appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-dim">Min Citations</span>
                <span className="font-mono text-[11px] text-ink">{filters.minCitations.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxCitations}
                step={Math.max(1, Math.round(maxCitations / 200))}
                value={filters.minCitations}
                onChange={(e) => setFilters({ minCitations: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-white/15 appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-dim">Domain</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Chip active={filters.domainId === null} onClick={() => setFilters({ domainId: null })}>
                  All
                </Chip>
                {galaxyData.domains.map((d) => (
                  <Chip
                    key={d.id}
                    active={filters.domainId === d.id}
                    onClick={() => setFilters({ domainId: filters.domainId === d.id ? null : d.id })}
                  >
                    {d.name}
                  </Chip>
                ))}
              </div>
            </div>

            {filtersActive && (
              <button
                onClick={resetFilters}
                className="self-start flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-accent hover:text-ink transition-colors"
              >
                <X size={13} /> Reset filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 sm:py-1.5 border-2 border-edge font-mono text-[11px] transition-all ${
        active ? "bg-accent text-accent-foreground" : "bg-white/5 text-ink hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
