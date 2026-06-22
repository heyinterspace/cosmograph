import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Rocket, Radio } from "lucide-react";
import { useAppState } from "@/lib/store";
import { CHANGELOG } from "@/data/changelog";

function formatStardate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ChangelogDrawer() {
  const { changelogOpen, setChangelogOpen, consoleOpen } = useAppState();
  // Sit to the LEFT of the right-hand Flight Console instead of under it: offset
  // by the live console width (expanded vs collapsed rail) and cap our own width
  // so we never overflow the remaining space.
  const consoleW = consoleOpen ? "min(14rem,80vw)" : "3.5rem";

  useEffect(() => {
    if (!changelogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChangelogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changelogOpen, setChangelogOpen]);

  return (
    <AnimatePresence>
      {changelogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-auto"
        >
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setChangelogOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="changelog-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{
              right: consoleW,
              width: `min(34rem, calc(100vw - ${consoleW} - 0.5rem))`,
            }}
            className="custom-scrollbar absolute top-0 bottom-0 overflow-y-auto border-l-2 border-edge bg-bg/95 p-7 backdrop-blur-xl"
          >
            <button
              onClick={() => setChangelogOpen(false)}
              aria-label="Close"
              autoFocus
              className="absolute top-4 right-4 text-ink-dim transition-colors hover:text-ink"
            >
              <X size={18} />
            </button>

            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
              <Radio size={12} /> Ship's flight log
            </span>
            <h2
              id="changelog-drawer-title"
              className="mt-1 mb-2 text-2xl font-title font-bold tracking-tight text-ink"
            >
              Every jump this galaxy has made
            </h2>
            <p className="mb-6 text-[13px] leading-relaxed text-ink-dim">
              A running log of where the ship has been and what we've upgraded
              along the way — newest transmissions first.
            </p>

            <ol className="relative space-y-7 border-l-2 border-edge pl-6">
              {CHANGELOG.map((entry, i) => (
                <li key={entry.version} className="relative">
                  <span
                    className="absolute -left-[31px] grid h-6 w-6 place-items-center border-2 border-edge bg-bg text-accent"
                    aria-hidden
                  >
                    <Rocket size={12} />
                  </span>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-base font-bold tracking-tight text-ink">
                      v{entry.version}
                    </span>
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        i === 0
                          ? "border-accent text-accent"
                          : "border-edge text-ink-dim"
                      }`}
                    >
                      {i === 0 ? "Now in orbit" : entry.codename}
                    </span>
                    {i === 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                        {entry.codename}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-ink-dim/70">
                      {formatStardate(entry.date)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[13px] italic leading-relaxed text-ink-dim">
                    {entry.summary}
                  </p>

                  <ul className="mt-3 space-y-1.5">
                    {entry.changes.map((change, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-dim"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <p className="mt-8 border-t-2 border-edge pt-4 font-mono text-[11px] leading-relaxed text-ink-dim">
              Plotting a new course of your own? Fork the ship on GitHub and the
              log carries on from here.
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
